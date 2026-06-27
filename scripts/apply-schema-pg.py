#!/usr/bin/env python3
"""
Apply Supabase schema via direct PostgreSQL connection.
"""
import os
import sys
import time
import re
import psycopg2
from psycopg2 import sql, errors

# Connection info — use pooler (IPv4) with SNI project identifier
# All credentials come from environment variables for security
import os
import sys
PROJECT_REF = os.environ.get("SUPABASE_PROJECT_REF", "bkqsetwjfdhuxtbtzatw")
DB_HOST = os.environ.get("SUPABASE_POOLER_HOST", f"aws-0-ap-southeast-1.pooler.supabase.com")
DB_PORT = int(os.environ.get("SUPABASE_DB_PORT", "6543"))
DB_NAME = "postgres"
DB_USER = f"postgres.{PROJECT_REF}"
DB_PASSWORD = os.environ.get("SUPABASE_DB_PASSWORD", "")
SCHEMA_FILE = "/home/z/my-project/supabase-schema.sql"

if not DB_PASSWORD:
    print("ERROR: SUPABASE_DB_PASSWORD environment variable not set")
    sys.exit(1)


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
    print(f"=== تطبيق schema عبر PostgreSQL مباشرة ===")
    print(f"Host: {DB_HOST}")
    print(f"DB: {DB_NAME}, User: {DB_USER}")
    print()

    # Read schema
    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        sql_text = f.read()

    statements = split_sql_statements(sql_text)
    print(f"تم استخراج {len(statements)} استعلام SQL")
    print()

    # Connect
    print("الاتصال بقاعدة البيانات...")
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            connect_timeout=30,
            sslmode="require",
        )
        conn.autocommit = True  # Required for DDL statements
        cur = conn.cursor()
        print("✅ متصل")
        print()
    except Exception as e:
        print(f"❌ فشل الاتصال: {e}")
        sys.exit(1)

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

        try:
            cur.execute(stmt)
            success_count += 1
        except errors.DuplicateObject as e:
            print(f"  ⚠️  موجود مسبقاً - تخطي")
            skipped += 1
        except errors.DuplicateTable as e:
            print(f"  ⚠️  الجدول موجود مسبقاً - تخطي")
            skipped += 1
        except errors.DuplicateFunction as e:
            print(f"  ⚠️  الدالة موجودة مسبقاً - تخطي")
            skipped += 1
        except errors.DuplicateTrigger as e:
            # Triggers — try DROP then CREATE
            print(f"  ⚠️  التريغر موجود مسبقاً - تخطي")
            skipped += 1
        except errors.InFailedSqlTransaction as e:
            print(f"  ❌ فشل: {e}")
            fail_count += 1
            failures.append({"idx": idx, "type": stmt_type, "stmt": first_line, "error": str(e)})
        except errors.Error as e:
            err_msg = str(e)[:200]
            # Check if "already exists"
            if "already exists" in err_msg.lower():
                print(f"  ⚠️  موجود مسبقاً - تخطي")
                skipped += 1
            else:
                print(f"  ❌ فشل: {err_msg}")
                fail_count += 1
                failures.append({"idx": idx, "type": stmt_type, "stmt": first_line, "error": err_msg})

    cur.close()
    conn.close()

    print()
    print("=" * 60)
    print(f"النتيجة النهائية:")
    print(f"  ✅ ناجح: {success_count}")
    print(f"  ⚠️  موجود مسبقاً (تخطي): {skipped}")
    print(f"  ❌ فشل: {fail_count}")
    print()

    if failures:
        print("=== الفشل التفصيلي ===")
        for f in failures[:15]:
            print(f"  [{f['idx']}] {f['type']}: {f['stmt']}")
            print(f"     {f['error']}")
        if len(failures) > 15:
            print(f"  ... و {len(failures) - 15} فشل آخر")

    sys.exit(0 if fail_count == 0 else 1)


if __name__ == "__main__":
    main()
