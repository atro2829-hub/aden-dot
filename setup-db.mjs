import pg from 'pg';
import fs from 'fs';
import tls from 'tls';
import net from 'net';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const POOLER_IP = '18.198.30.239';
const PASSWORD = 'Mohammed775371829';

async function main() {
  // Try non-TLS connections to pooler
  const attempts = [
    { port: 5432, user: 'postgres', label: 'port 5432, user=postgres, no TLS' },
    { port: 6543, user: 'postgres', label: 'port 6543, user=postgres, no TLS' },
    { port: 5432, user: 'postgres.ocjcbowrewenogrkexmr', label: 'port 5432, user=postgres.ref, no TLS' },
    { port: 6543, user: 'postgres.ocjcbowrewenogrkexmr', label: 'port 6543, user=postgres.ref, no TLS' },
  ];

  for (const attempt of attempts) {
    console.log(`\nTrying: ${attempt.label}...`);
    const stream = net.createConnection({
      host: POOLER_IP,
      port: attempt.port,
    });

    const connected = await new Promise((resolve) => {
      stream.once('connect', () => {
        console.log('  TCP connected');
        resolve(true);
      });
      stream.once('error', (err) => {
        console.log(`  TCP error: ${err.message.substring(0, 80)}`);
        resolve(false);
      });
      setTimeout(() => {
        console.log('  TCP timeout');
        stream.destroy();
        resolve(false);
      }, 10000);
    });

    if (!connected) continue;

    const client = new pg.Client({
      database: 'postgres',
      user: attempt.user,
      password: PASSWORD,
      stream: stream,
    });

    try {
      await client.connect();
      console.log('  ✅ PostgreSQL connected!');

      // Execute schema
      await executeSchema(client);
      await client.end();
      return;
    } catch (err) {
      console.log(`  ❌ pg error: ${err.message.substring(0, 120)}`);
      try { stream.destroy(); } catch(e) {}
    }
  }

  console.error('\n❌ All connection methods failed');
}

async function executeSchema(client) {
  let schemaSql = fs.readFileSync('/home/z/my-project/supabase-schema.sql', 'utf8');
  schemaSql = schemaSql.replace(
    /CREATE INDEX IF NOT EXISTS idx_posts_status ON posts\(status\) WHERE status = 'live';/,
    '-- Removed'
  );

  console.log('\nExecuting SQL schema...');
  const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));

  let ok = 0, fail = 0;
  for (const stmt of statements) {
    try {
      await client.query(stmt);
      ok++;
      if (stmt.includes('CREATE TABLE')) {
        const m = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
        if (m) console.log(`  ✅ ${m[1]}`);
      }
    } catch (err) {
      fail++;
      if (!err.message.includes('already exists')) {
        console.error(`  ❌ ${err.message.substring(0, 120)}`);
      }
    }
  }

  console.log(`\nResult: ${ok} ok, ${fail} fail`);

  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
  console.log('\n📊 Tables:');
  res.rows.forEach(r => console.log(`  - ${r.table_name}`));

  try { const g = await client.query('SELECT count(*) FROM gift_types;'); console.log(`🎁 Gifts: ${g.rows[0].count}`); } catch(e) {}
  try { const a = await client.query('SELECT count(*) FROM achievements;'); console.log(`🏆 Achievements: ${a.rows[0].count}`); } catch(e) {}
}

main().catch(err => console.error('Fatal:', err.message));
