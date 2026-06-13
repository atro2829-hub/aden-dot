"""Try different pooler ports and configurations for ap-east-1"""
import socket
import ssl
import struct
import hashlib
import hmac
import base64
import os
import re

POOLER_IP = '43.198.3.176'  # ap-east-1
SNI_HOSTNAME = 'db.ocjcbowrewenogrkexmr.supabase.co'
DATABASE = 'postgres'
PASSWORD = 'Mohammed775371829'

def create_tls_connection(ip, port, sni_hostname):
    sock = socket.create_connection((ip, port), timeout=15)
    sock.sendall(struct.pack('!II', 8, 80877103))
    response = sock.recv(1)
    if response != b'S':
        raise Exception(f'SSL rejected: {response}')
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx.wrap_socket(sock, server_hostname=sni_hostname)

def send_startup(sock, user, database):
    protocol = 196608
    params = f'user\0{user}\0database\0{database}\0\0'
    length = 4 + 4 + len(params)
    msg = struct.pack('!II', length, protocol) + params.encode('utf-8')
    sock.sendall(msg)

def bytes_xor(a, b):
    return bytes(x ^ y for x, y in zip(a, b))

def handle_scram_sha256(sock, user, password, msg_data):
    client_nonce = base64.b64encode(os.urandom(18)).decode('ascii')
    client_first = f'n,,n={user},r={client_nonce}'
    initial_response = client_first.encode('utf-8')
    mechanism = b'SCRAM-SHA-256\0'
    msg = b'p' + struct.pack('!I', len(mechanism) + 4 + 4 + len(initial_response)) + mechanism + struct.pack('!I', len(initial_response)) + initial_response
    sock.sendall(msg)
    
    msg_type = sock.recv(1)
    msg_len = struct.unpack('!I', sock.recv(4))[0] - 4
    data = sock.recv(msg_len)
    
    if msg_type == b'E':
        raise Exception('SASL error')
    
    server_first = {}
    for pair in data.decode('utf-8').split(','):
        if '=' in pair:
            key, val = pair.split('=', 1)
            server_first[key] = val
    
    server_nonce = server_first.get('r', '')
    salt_b64 = server_first.get('s', '')
    iterations = int(server_first.get('i', '4096'))
    
    client_final_bare = f'c=biws,r={server_nonce}'
    auth_message = f'n={user},r={client_nonce},r={server_nonce},s={salt_b64},i={iterations},{client_final_bare}'
    
    salt_bytes = base64.b64decode(salt_b64)
    ui = hmac.new(password.encode('utf-8'), salt_bytes, hashlib.sha256).digest()
    ui = bytes_xor(ui, hmac.new(ui, salt_bytes, hashlib.sha256).digest())
    for _ in range(iterations - 1):
        ui = bytes_xor(ui, hmac.new(ui, salt_bytes, hashlib.sha256).digest())
    
    client_key = hmac.new(ui, b'Client Key', hashlib.sha256).digest()
    stored_key = hashlib.sha256(client_key).digest()
    client_signature = hmac.new(stored_key, auth_message.encode('utf-8'), hashlib.sha256).digest()
    client_proof = bytes_xor(client_key, client_signature)
    
    client_proof_b64 = base64.b64encode(client_proof).decode('ascii')
    client_final = f'{client_final_bare},p={client_proof_b64}'
    msg = b'p' + struct.pack('!I', len(client_final.encode('utf-8')) + 4) + client_final.encode('utf-8')
    sock.sendall(msg)

def md5_password(user, password, salt):
    inner = hashlib.md5(password.encode('utf-8') + user.encode('utf-8')).hexdigest()
    outer = hashlib.md5(inner.encode('utf-8') + salt).hexdigest()
    return f'md5{outer}'

def parse_error(data):
    fields = {}
    i = 0
    while i < len(data):
        if data[i] == 0: break
        field_type = chr(data[i])
        i += 1
        end = data.index(b'\0', i)
        fields[field_type] = data[i:end].decode('utf-8', errors='replace')
        i = end + 1
    return fields.get('M', 'Unknown error')

def handle_auth(sock, user, password):
    while True:
        msg_type = sock.recv(1)
        if not msg_type: raise Exception('Connection closed')
        msg_len = struct.unpack('!I', sock.recv(4))[0] - 4
        msg_data = sock.recv(msg_len) if msg_len > 0 else b''
        
        if msg_type == b'R':
            auth_type = struct.unpack('!I', msg_data[:4])[0]
            if auth_type == 0:
                return True
            elif auth_type == 3:
                pw = password.encode('utf-8') + b'\0'
                sock.sendall(b'p' + struct.pack('!I', len(pw) + 4) + pw)
            elif auth_type == 5:
                salt = msg_data[4:8]
                md5pw = md5_password(user, password, salt)
                pw = md5pw.encode('utf-8') + b'\0'
                sock.sendall(b'p' + struct.pack('!I', len(pw) + 4) + pw)
            elif auth_type == 10:
                handle_scram_sha256(sock, user, password, msg_data)
            else:
                raise Exception(f'Unsupported auth: {auth_type}')
        elif msg_type == b'E':
            return parse_error(msg_data)
        elif msg_type == b'Z':
            return True
        elif msg_type in (b'S', b'K', b'N'):
            pass

def send_query(sock, query):
    query_bytes = query.encode('utf-8') + b'\0'
    msg = b'Q' + struct.pack('!I', len(query_bytes) + 4) + query_bytes
    sock.sendall(msg)

def read_until_ready(sock):
    results = []
    while True:
        msg_type = sock.recv(1)
        if not msg_type: break
        msg_len = struct.unpack('!I', sock.recv(4))[0] - 4
        msg_data = sock.recv(msg_len) if msg_len > 0 else b''
        if msg_type == b'C':
            results.append(('OK', msg_data.decode('utf-8', errors='replace')))
        elif msg_type == b'E':
            results.append(('ERROR', parse_error(msg_data)))
        elif msg_type == b'D':
            num_cols = struct.unpack('!H', msg_data[:2])[0]
            cols = []
            offset = 2
            for _ in range(num_cols):
                col_len = struct.unpack('!i', msg_data[offset:offset+4])[0]
                offset += 4
                if col_len >= 0:
                    cols.append(msg_data[offset:offset+col_len].decode('utf-8', errors='replace'))
                    offset += col_len
                else:
                    cols.append(None)
            results.append(('ROW', cols))
        elif msg_type == b'Z':
            break
    return results

def try_config(ip, port, user, sni_hostname):
    try:
        sock = create_tls_connection(ip, port, sni_hostname)
        send_startup(sock, user, DATABASE)
        result = handle_auth(sock, user, PASSWORD)
        
        if result is True:
            # Wait for ReadyForQuery
            while True:
                msg_type = sock.recv(1)
                msg_len = struct.unpack('!I', sock.recv(4))[0] - 4
                msg_data = sock.recv(msg_len) if msg_len > 0 else b''
                if msg_type == b'Z': break
            return sock
        else:
            try: sock.close()
            except: pass
            return result  # error message
    except Exception as err:
        return str(err)[:150]

def main():
    configs = [
        ('5432', 'postgres', SNI_HOSTNAME),
        ('5432', 'postgres.ocjcbowrewenogrkexmr', SNI_HOSTNAME),
        ('6543', 'postgres', SNI_HOSTNAME),
        ('6543', 'postgres.ocjcbowrewenogrkexmr', SNI_HOSTNAME),
    ]
    
    sock = None
    for port, user, sni in configs:
        print(f'\nTrying: port={port}, user={user}, SNI={sni}...')
        result = try_config(POOLER_IP, int(port), user, sni)
        
        if isinstance(result, ssl.SSLSocket):
            print(f'✅ CONNECTED!')
            sock = result
            break
        else:
            print(f'❌ {str(result)[:120]}')
    
    if not sock:
        print('\n❌ All configs failed')
        return
    
    # Execute schema
    print('\nExecuting SQL schema...')
    with open('/home/z/my-project/supabase-schema.sql', 'r') as f:
        schema_sql = f.read()

    schema_sql = schema_sql.replace(
        "CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status) WHERE status = 'live';",
        '-- Removed'
    )

    statements = [s.strip() for s in schema_sql.split(';') if s.strip() and not s.strip().startswith('--')]

    ok = 0
    fail = 0
    for stmt in statements:
        try:
            send_query(sock, stmt)
            results = read_until_ready(sock)
            errors = [r for r in results if r[0] == 'ERROR']
            if errors:
                raise Exception(errors[0][1])
            ok += 1
            if 'CREATE TABLE' in stmt:
                m = re.search(r'CREATE TABLE IF NOT EXISTS (\w+)', stmt)
                if m:
                    print(f'  ✅ {m.group(1)}')
        except Exception as err:
            fail += 1
            if 'already exists' not in str(err):
                print(f'  ❌ {str(err)[:120]}')

    print(f'\nResult: {ok} ok, {fail} fail')

    # Verify
    send_query(sock, "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")
    results = read_until_ready(sock)
    rows = [r[1] for r in results if r[0] == 'ROW']
    print('\n📊 Tables:')
    for row in rows:
        print(f'  - {row[0]}')

    try:
        send_query(sock, 'SELECT count(*) FROM gift_types')
        results = read_until_ready(sock)
        rows = [r[1] for r in results if r[0] == 'ROW']
        if rows:
            print(f'\n🎁 Gift types: {rows[0][0]}')
    except: pass

    try:
        send_query(sock, 'SELECT count(*) FROM achievements')
        results = read_until_ready(sock)
        rows = [r[1] for r in results if r[0] == 'ROW']
        if rows:
            print(f'🏆 Achievements: {rows[0][0]}')
    except: pass

    sock.close()
    print('\nDone!')

main()
