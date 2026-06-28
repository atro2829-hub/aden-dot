#!/usr/bin/env python3
"""
Apply ONLY the missing statements: functions, triggers, seed data, publications.
Skips tables/indexes/policies that already exist.
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


def execute_sql(query: str, timeout: int = 90) -> dict:
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


def execute_with_retry(query: str, max_retries: int = 10) -> dict:
    delay = 5
    result = None
    for attempt in range(max_retries):
        result = execute_sql(query)
        if result["ok"]:
            return result
        err = result.get("error", "")
        if "ThrottlerException" in err or result.get("status") == 429:
            print(f"  ⏳ throttle, retry {attempt+1}/{max_retries} بعد {delay}s")
            time.sleep(delay)
            delay = min(delay * 2, 60)
            continue
        return result
    return result


def split_sql_statements(sql_text: str) -> list:
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
    print("=== إكمال تطبيق الـ schema (الدوال + التريغرات + البيانات الأولية) ===")
    print()

    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        sql_text = f.read()

    statements = split_sql_statements(sql_text)

    # Focus on the important ones: FUNCTIONS, TRIGGERS, INSERTs, PUBLICATIONs
    # Skip already-applied: CREATE TABLE, CREATE INDEX, RLS policies (most are done)
    priority_types = {"FUNCTION", "TRIGGER", "INSERT", "EXTENSION", "PUBLICATION", "ALTER", "DROP"}

    success = 0
    skipped = 0
    failed = 0
    failures = []

    for idx, stmt in enumerate(statements, 1):
        upper = stmt.upper().strip()
        if upper.startswith("CREATE OR REPLACE FUNCTION"):
            stmt_type = "FUNCTION"
        elif upper.startswith("CREATE OR REPLACE TRIGGER") or upper.startswith("CREATE TRIGGER"):
            stmt_type = "TRIGGER"
        elif upper.startswith("DROP TRIGGER"):
            stmt_type = "DROP TRIGGER"
        elif upper.startswith("INSERT"):
            stmt_type = "INSERT"
        elif upper.startswith("CREATE EXTENSION"):
            stmt_type = "EXTENSION"
        elif upper.startswith("ALTER PUBLICATION"):
            stmt_type = "PUBLICATION"
        elif upper.startswith("ALTER TABLE"):
            stmt_type = "ALTER TABLE"
        else:
            continue  # skip non-priority

        first_line = stmt.split("\n")[0][:80]
        print(f"[{idx}/{len(statements)}] {stmt_type}: {first_line[:60]}")

        result = execute_with_retry(stmt, max_retries=10)
        if result["ok"]:
            success += 1
            print("  ✅")
        else:
            err = result.get("error", "")[:200]
            if "already exists" in err.lower() or "duplicate" in err.lower():
                print(f"  ⚠️  موجود مسبقاً")
                skipped += 1
            else:
                print(f"  ❌ {err[:100]}")
                failed += 1
                failures.append({"idx": idx, "type": stmt_type, "stmt": first_line, "error": err})

        time.sleep(2.0)  # generous delay

    print()
    print("=" * 60)
    print(f"✅ ناجح: {success}")
    print(f"⚠️  تخطي (موجود مسبقاً): {skipped}")
    print(f"❌ فشل: {failed}")

    if failures:
        print()
        print("=== الفشل ===")
        for f in failures:
            print(f"  [{f['idx']}] {f['type']}: {f['stmt']}")
            print(f"     {f['error'][:150]}")


if __name__ == "__main__":
    main()
