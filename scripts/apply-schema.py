#!/usr/bin/env python3
"""
Apply Supabase schema via Management API /database/query endpoint.
"""
import json
import os
import re
import sys
import time
import urllib.request
import urllib.error

TOKEN = os.environ.get("SUPABASE_ACCESS_TOKEN", "")
PROJECT_REF = os.environ.get("SUPABASE_PROJECT_REF", "bkqsetwjfdhuxtbtzatw")
SCHEMA_FILE = "/home/z/my-project/supabase-schema.sql"
API_BASE = "https://api.supabase.com/v1"

if not TOKEN:
    print("ERROR: SUPABASE_ACCESS_TOKEN environment variable not set")
    sys.exit(1)


def execute_sql(query: str, timeout: int = 60) -> dict:
    """Execute a single SQL statement via Management API."""
    url = f"{API_BASE}/projects/{PROJECT_REF}/database/query"
    body = json.dumps({"query": query}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Origin": "https://supabase.com",
            "Referer": "https://supabase.com/",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return {"ok": True, "status": resp.status, "data": resp.read().decode("utf-8", errors="replace")}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        return {"ok": False, "status": e.code, "error": body}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def execute_sql_with_retry(query: str, max_retries: int = 8, timeout: int = 60) -> dict:
    """Execute SQL with retry on rate limit (ThrottlerException)."""
    delay = 3  # initial delay
    result = None
    for attempt in range(max_retries):
        result = execute_sql(query, timeout=timeout)
        if result["ok"]:
            return result
        err = result.get("error", "")
        if "ThrottlerException" in err or result.get("status") == 429:
            print(f"  ⏳ rate limited, إعادة محاولة {attempt + 1}/{max_retries} بعد {delay}s...")
            time.sleep(delay)
            delay = min(delay * 2, 30)  # exponential backoff, max 30s
            continue
        return result  # non-retryable error
    return result  # last error


def split_sql_statements(sql_text: str) -> list:
    """Split SQL into individual statements, respecting $$ blocks."""
    text = sql_text
    statements = []
    current = []
    in_dollar_quote = False
    dollar_tag = None

    i = 0
    while i < len(text):
        if not in_dollar_quote:
            m = re.match(r"\$[a-zA-Z0-9_]*\$", text[i:i + 100])
            if m:
                dollar_tag = m.group(0)
                current.append(dollar_tag)
                in_dollar_quote = True
                i += len(dollar_tag)
                continue
        else:
            if dollar_tag and text[i:i + len(dollar_tag)] == dollar_tag:
                tag_len = len(dollar_tag)
                current.append(dollar_tag)
                in_dollar_quote = False
                dollar_tag = None
                i += tag_len
                continue

        char = text[i]
        if char == ";" and not in_dollar_quote:
            stmt = "".join(current).strip()
            if stmt:
                cleaned = re.sub(r"--.*$", "", stmt, flags=re.MULTILINE).strip()
                if cleaned:
                    statements.append(stmt)
            current = []
            i += 1
            continue

        current.append(char)
        i += 1

    final = "".join(current).strip()
    if final:
        cleaned = re.sub(r"--.*$", "", final, flags=re.MULTILINE).strip()
        if cleaned:
            statements.append(final)

    return statements


def main():
    print(f"=== تطبيق schema على مشروع Supabase ===")
    print(f"Project: {PROJECT_REF}")
    print()

    # Drop test table first
    print("=== تنظيف جدول الاختبار ===")
    r = execute_sql("DROP TABLE IF EXISTS _test_table")
    print(r.get("data", r.get("error", ""))[:50])
    print()

    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        sql_text = f.read()

    statements = split_sql_statements(sql_text)
    print(f"تم استخراج {len(statements)} استعلام SQL")
    print()

    success_count = 0
    fail_count = 0
    skipped = 0
    failures = []

    for idx, stmt in enumerate(statements, 1):
        first_line = stmt.split("\n")[0][:80]
        upper = stmt.upper().strip()
        if upper.startswith("CREATE TABLE"):
            stmt_type = "CREATE TABLE"
        elif upper.startswith("CREATE INDEX"):
            stmt_type = "CREATE INDEX"
        elif upper.startswith("CREATE OR REPLACE FUNCTION"):
            stmt_type = "FUNCTION"
        elif upper.startswith("CREATE OR REPLACE TRIGGER") or upper.startswith("CREATE TRIGGER"):
            stmt_type = "TRIGGER"
        elif upper.startswith("CREATE OR REPLACE POLICY") or upper.startswith("CREATE POLICY"):
            stmt_type = "POLICY"
        elif upper.startswith("ALTER"):
            stmt_type = "ALTER"
        elif upper.startswith("INSERT"):
            stmt_type = "INSERT"
        elif upper.startswith("DROP"):
            stmt_type = "DROP"
        elif upper.startswith("CREATE EXTENSION"):
            stmt_type = "EXTENSION"
        elif upper.startswith("CREATE TYPE"):
            stmt_type = "TYPE"
        elif upper.startswith("CREATE SCHEMA"):
            stmt_type = "SCHEMA"
        elif upper.startswith("GRANT"):
            stmt_type = "GRANT"
        elif upper.startswith("UPDATE"):
            stmt_type = "UPDATE"
        else:
            stmt_type = "QUERY"

        print(f"[{idx}/{len(statements)}] {stmt_type}: {first_line[:60]}")

        # Skip CREATE TABLE since all tables are already created
        if stmt_type == "CREATE TABLE":
            # Check if the table already exists
            table_match = re.search(r'CREATE TABLE IF NOT EXISTS\s+(\S+)', stmt, re.IGNORECASE)
            if table_match:
                table_name = table_match.group(1).split('.')[-1].strip('"')
                check_result = execute_sql_with_retry(
                    f"SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='{table_name}' LIMIT 1",
                    max_retries=3
                )
                if check_result["ok"] and "1" in check_result.get("data", "[]"):
                    print(f"  ⚠️  الجدول موجود - تخطي")
                    skipped += 1
                    time.sleep(0.5)
                    continue

        # Skip CREATE INDEX — check if exists
        if stmt_type == "CREATE INDEX":
            idx_match = re.search(r'CREATE (UNIQUE )?INDEX IF NOT EXISTS\s+(\S+)', stmt, re.IGNORECASE)
            if idx_match:
                idx_name = idx_match.group(2).split('.')[-1].strip('"')
                check_result = execute_sql_with_retry(
                    f"SELECT 1 FROM pg_indexes WHERE indexname='{idx_name}' LIMIT 1",
                    max_retries=3
                )
                if check_result["ok"] and "1" in check_result.get("data", "[]"):
                    print(f"  ⚠️  الفهرس موجود - تخطي")
                    skipped += 1
                    time.sleep(0.5)
                    continue

        result = execute_sql_with_retry(stmt, max_retries=8, timeout=120)

        if result["ok"]:
            success_count += 1
        else:
            err_msg = result.get("error", "unknown error")[:300]
            # Check if it's "already exists" — that's OK, skip
            if "already exists" in err_msg.lower() or "duplicate" in err_msg.lower():
                print(f"  ⚠️  موجود مسبقاً - تم التخطي")
                skipped += 1
            else:
                print(f"  ❌ فشل: {err_msg[:150]}")
                fail_count += 1
                failures.append({
                    "idx": idx,
                    "type": stmt_type,
                    "stmt": first_line,
                    "error": err_msg,
                })

        time.sleep(1.0)  # base delay between requests to avoid throttling

    print()
    print("=" * 60)
    print(f"النتيجة النهائية:")
    print(f"  ✅ ناجح: {success_count}")
    print(f"  ⚠️  موجود مسبقاً (تخطي): {skipped}")
    print(f"  ❌ فشل: {fail_count}")
    print()

    if failures:
        print("=== الفشل التفصيلي ===")
        for f in failures[:20]:
            print(f"  [{f['idx']}] {f['type']}: {f['stmt']}")
            print(f"     {f['error'][:200]}")
        if len(failures) > 20:
            print(f"  ... و {len(failures) - 20} فشل آخر")

    sys.exit(0 if fail_count == 0 else 1)


if __name__ == "__main__":
    main()
