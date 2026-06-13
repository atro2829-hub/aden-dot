#!/usr/bin/env node
/**
 * Aden Dot Supabase Database Setup Script
 */

import fs from 'fs';

const PROJECT_REF = 'ocjcbowrewenogrkexmr';
const API_BASE = 'https://api.supabase.com/v1';

const SQL = fs.readFileSync(new URL('./supabase-schema.sql', import.meta.url), 'utf8');

async function main() {
  const token = process.argv[2];
  if (!token || !token.startsWith('sbp_')) {
    console.error('Usage: node setup-supabase.js <PERSONAL_ACCESS_TOKEN>');
    process.exit(1);
  }

  console.log('Setting up Aden Dot database...');
  console.log(`Project: ${PROJECT_REF}`);

  const res = await fetch(`${API_BASE}/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: SQL }),
  });

  if (res.ok) {
    console.log('Database schema applied successfully!');
  } else {
    const err = await res.text();
    console.error('Error:', err);
  }
}

main();
