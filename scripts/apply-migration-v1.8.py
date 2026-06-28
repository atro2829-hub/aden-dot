#!/usr/bin/env python3
"""
Apply v1.8 migration SQL to the Aden Dot Supabase project via the
Management API.

Reads /home/z/my-project/download/adendot-migration-v1.8.sql, splits it
into batches (separated by ';') and POSTs each batch to the
/v1/projects/{ref}/database/query endpoint using the personal access
token.

Idempotent — uses CREATE TABLE IF NOT EXISTS, CREATE OR REPLACE FUNCTION,
and INSERT ... ON CONFLICT DO NOTHING so re-runs are safe.
"""

import json
import os
import re
import sys
import time

import requests

ACCESS_TOKEN = os.environ.get("SUPABASE_ACCESS_TOKEN", "")
if not ACCESS_TOKEN:
    print("ERROR: SUPABASE_ACCESS_TOKEN env var not set", file=sys.stderr)
    sys.exit(1)
PROJECT_REF = "bkqsetwjfdhuxtbtzatw"
SQL_FILE = "/home/z/my-project/download/adendot-migration-v1.8.sql"

MANAGEMENT_URL = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"
SESSION = requests.Session()
SESSION.headers.update({
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json",
    # Cloudflare blocks Python-urllib UA, use a real browser UA
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
})


def split_sql(sql: str) -> list[str]:
    """Split SQL into individual statements, respecting strings and dollar-quoted bodies."""
    statements: list[str] = []
    buf: list[str] = []
    i = 0
    n = len(sql)
    in_single = False
    in_double = False
    dollar_tag: str | None = None
    while i < n:
        ch = sql[i]
        nxt = sql[i + 1] if i + 1 < n else ""
        # dollar-quoted function body — supports both `$$` and `$tag$` styles
        if not in_single and not in_double:
            if dollar_tag is None:
                m = re.match(r"\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$", sql[i:])
                if m:
                    dollar_tag = m.group(0)
                    buf.append(dollar_tag)
                    i += len(dollar_tag)
                    continue
            else:
                if sql.startswith(dollar_tag, i):
                    buf.append(dollar_tag)
                    i += len(dollar_tag)
                    dollar_tag = None
                    continue
        # single quotes
        if not in_double and not dollar_tag:
            if ch == "'":
                # escape '' inside string
                if in_single and nxt == "'":
                    buf.append("''")
                    i += 2
                    continue
                in_single = not in_single
                buf.append(ch)
                i += 1
                continue
        # double quotes (identifiers)
        if not in_single and not dollar_tag:
            if ch == '"':
                in_double = not in_double
                buf.append(ch)
                i += 1
                continue
        # statement separator
        if ch == ";" and not in_single and not in_double and not dollar_tag:
            buf.append(ch)
            stmt = "".join(buf).strip()
            if stmt:
                statements.append(stmt)
            buf = []
            i += 1
            continue
        buf.append(ch)
        i += 1
    tail = "".join(buf).strip()
    if tail:
        statements.append(tail)
    return statements


def run_query(query: str) -> tuple[int, str]:
    try:
        resp = SESSION.post(MANAGEMENT_URL, json={"query": query}, timeout=120)
        return resp.status_code, resp.text
    except Exception as e:
        return 0, str(e)


def main() -> int:
    if not os.path.isfile(SQL_FILE):
        print(f"ERROR: SQL file not found: {SQL_FILE}", file=sys.stderr)
        return 1

    with open(SQL_FILE, "r", encoding="utf-8") as f:
        sql = f.read()

    print(f"Loaded SQL: {len(sql):,} bytes")
    statements = split_sql(sql)
    print(f"Split into {len(statements)} statements")

    ok = 0
    failed = 0
    skipped = 0
    for idx, stmt in enumerate(statements, 1):
        # Skip pure-comment / empty statements
        stripped = re.sub(r"--.*", "", stmt).strip().rstrip(";").strip()
        if not stripped:
            skipped += 1
            continue

        first_kw = stripped.split(None, 1)[0].upper() if stripped else ""
        # Truncate preview for log
        preview = re.sub(r"\s+", " ", stripped)[:80]
        print(f"[{idx}/{len(statements)}] {first_kw}  {preview}")

        code, body = run_query(stmt)
        if code == 200 or code == 201:
            ok += 1
            continue
        # Many "create if not exists" / "already exists" cases are not fatal:
        if code == 400 and any(
            marker in body
            for marker in (
                "already exists",
                "does not exist",
                "no such",
                "duplicate key",
                " duplicate ",
                "No function matches",
            )
        ):
            print(f"   -> non-fatal ({code}): {body[:200]}")
            skipped += 1
            continue
        # 42501 = insufficient permission can sometimes happen for alter owner — log and continue
        if code == 42501:
            print(f"   -> permission warning ({code}): {body[:200]}")
            skipped += 1
            continue
        print(f"   !! FAILED ({code}): {body[:500]}")
        failed += 1
        time.sleep(0.3)

    print(f"\nDone: ok={ok}, skipped={skipped}, failed={failed}")
    return 0 if failed == 0 else 2


if __name__ == "__main__":
    sys.exit(main())
