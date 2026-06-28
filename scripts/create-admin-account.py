#!/usr/bin/env python3
"""
Create Admin account on Aden Dot platform via Supabase Auth API + Admin API.
Generates a special admin user distinct from regular users.

Admin credentials:
  Email:    admin@adendot.app
  Username: aden.admin
  Password: AdenAdmin@2026
  Display:  مدير المنصة
  Role:     admin
"""

import sys
import json
import urllib.request
import urllib.error

SUPABASE_URL = "https://bkqsetwjfdhuxtbtzatw.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGtmemVtcm9zZGdrZ3R6aHRnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTM3NTg1NywiZXhwIjoyMDk2OTUxODU3fQ.gKTa_CbKLCHcgjLA_-OqGwCqHHr3dtDxZ-3Pbx-bWx4"

ADMIN_EMAIL = "admin@adendot.app"
ADMIN_PASSWORD = "AdenAdmin@2026"
ADMIN_USERNAME = "aden.admin"
ADMIN_NICKNAME = "مدير المنصة"
ADMIN_BIO = "الحساب الرسمي لإدارة منصة عدن دوت - South Yemen"

def api_call(method, path, body=None, headers_extra=None):
    url = f"{SUPABASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    if headers_extra:
        headers.update(headers_extra)
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body_text = resp.read().decode("utf-8") or "{}"
            try:
                return resp.status, json.loads(body_text)
            except json.JSONDecodeError:
                return resp.status, body_text
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8") or ""
        try:
            return e.code, json.loads(body_text)
        except json.JSONDecodeError:
            return e.code, body_text
    except Exception as e:
        return 0, str(e)


def list_existing_users():
    code, body = api_call("GET", "/auth/v1/admin/users?per_page=1000")
    if code != 200 or not isinstance(body, dict):
        return []
    return body.get("users", []) or []


def find_user_by_email(users, email):
    for u in users:
        if u.get("email", "").lower() == email.lower():
            return u
    return None


def create_auth_user():
    body = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
        "email_confirm": True,
        "user_metadata": {
            "username": ADMIN_USERNAME,
            "nickname": ADMIN_NICKNAME,
            "role": "admin",
        },
    }
    code, resp = api_call("POST", "/auth/v1/admin/users", body)
    if code in (200, 201):
        uid = resp.get("id") if isinstance(resp, dict) else None
        if uid:
            print(f"[OK] Auth user created: {uid}")
            return uid
    if code == 422 and isinstance(resp, dict) and "already" in str(resp.get("msg", "")).lower():
        print("[INFO] User already exists in auth; continuing")
    elif code == 400 and isinstance(resp, dict) and "already" in str(resp.get("msg", "")).lower():
        print("[INFO] User already exists in auth; continuing")
    else:
        print(f"[WARN] create_auth_user returned {code}: {resp}")
    users = list_existing_users()
    u = find_user_by_email(users, ADMIN_EMAIL)
    return u.get("id") if u else None


def update_user_password(uid):
    body = {"password": ADMIN_PASSWORD}
    code, resp = api_call("PUT", f"/auth/v1/admin/users/{uid}", body)
    if code in (200, 204):
        print(f"[OK] Password updated for {uid}")
    else:
        print(f"[WARN] update_user_password returned {code}: {resp}")


def upsert_profile(uid):
    body = {
        "uid": uid,
        "email": ADMIN_EMAIL,
        "username": ADMIN_USERNAME,
        "nickname": ADMIN_NICKNAME,
        "bio": ADMIN_BIO,
        "role": "admin",
        "is_verified": True,
        "is_premium": True,
        "is_email_verified": True,
        "is_profile_complete": True,
        "status": "online",
        "coins_balance": 999999,
        "diamonds_balance": 999999,
        "level": 99,
        "xp": 999999,
        "popularity": 9999,
        "profile_image": "",
        "region": "aden",
        "gender": "unspecified",
    }

    code, resp = api_call("GET", f"/rest/v1/users?uid=eq.{uid}&select=uid")
    exists = False
    if code in (200, 206) and isinstance(resp, list):
        exists = len(resp) > 0

    if exists:
        code, resp = api_call(
            "PATCH",
            f"/rest/v1/users?uid=eq.{uid}",
            body,
            headers_extra={"Prefer": "return=representation"},
        )
        print(f"[INFO] Profile PATCH -> {code}")
    else:
        code, resp = api_call(
            "POST",
            "/rest/v1/users",
            body,
            headers_extra={"Prefer": "return=representation,resolution=ignore-duplicates"},
        )
        print(f"[INFO] Profile POST -> {code}")
        if code in (200, 201) and isinstance(resp, list) and resp:
            print(f"[OK] Profile row inserted")
        else:
            print(f"[WARN] Profile insert response: {resp}")

    code, resp = api_call("GET", f"/rest/v1/users?uid=eq.{uid}&select=username,role,is_verified,nickname")
    if code == 200 and isinstance(resp, list) and resp:
        print(f"[VERIFY] Profile row: {resp[0]}")


def ensure_wallet(uid):
    code, resp = api_call("GET", "/rest/v1/wallets?limit=1")
    if code == 200 and isinstance(resp, list) and resp:
        cols = list(resp[0].keys())
        user_col = "user_id" if "user_id" in cols else ("uid" if "uid" in cols else "user_id")
        body = {
            user_col: uid,
            "coins_balance": 999999,
            "diamonds_balance": 999999,
        }
    else:
        body = {"user_id": uid, "coins_balance": 999999, "diamonds_balance": 999999}

    code, resp = api_call(
        "POST",
        "/rest/v1/wallets",
        body,
        headers_extra={"Prefer": "return=representation,resolution=ignore-duplicates"},
    )
    print(f"[INFO] Wallet upsert -> {code}")
    if code not in (200, 201):
        print(f"[WARN] Wallet response: {resp}")


def main():
    print("=" * 60)
    print("Aden Dot - Admin Account Provisioning")
    print("=" * 60)
    print(f"Email:    {ADMIN_EMAIL}")
    print(f"Username: {ADMIN_USERNAME}")
    print(f"Password: {ADMIN_PASSWORD}")
    print("=" * 60)

    print("\n[1/4] Creating/locating auth user...")
    uid = create_auth_user()
    if not uid:
        print("[FAIL] Could not create or find auth user. Aborting.")
        return 1

    print("\n[2/4] Setting admin password...")
    update_user_password(uid)

    print("\n[3/4] Upserting admin profile row...")
    upsert_profile(uid)

    print("\n[4/4] Ensuring wallet row exists...")
    ensure_wallet(uid)

    print("\n" + "=" * 60)
    print("ADMIN ACCOUNT READY")
    print("=" * 60)
    print(f"  Email:    {ADMIN_EMAIL}")
    print(f"  Username: @{ADMIN_USERNAME}")
    print(f"  Password: {ADMIN_PASSWORD}")
    print(f"  UID:      {uid}")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    sys.exit(main())
