const fs = require("fs");
const path = require("path");

// Automatically load .env.local or .env if variables are not yet in process.env
function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment or .env.local.");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
  "Prefer": "return=representation",
};

async function supabaseDelete(table, filter = "") {
  const url = `${SUPABASE_URL}/rest/v1/${table}${filter}`;
  const res = await fetch(url, { method: "DELETE", headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DELETE ${table} failed: ${res.status} ${text}`);
  }
  console.log(`  ✓ Cleared table: ${table}`);
}

async function supabaseUpsert(table, body) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Prefer": "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`UPSERT ${table} failed: ${res.status} ${text}`);
  }
  console.log(`  ✓ Reset table: ${table}`);
}

async function main() {
  console.log("\n🔄 Resetting analytics data in Supabase...\n");

  try {
    // 1. Clear all events
    await supabaseDelete("analytics_events", "?id=neq.00000000-0000-0000-0000-000000000000");

    // 2. Clear per-issue stats
    await supabaseDelete("issue_analytics", "?issue_id=neq.00000000-0000-0000-0000-000000000000");

    // 3. Reset global summary to zero
    await supabaseUpsert("analytics_summary", {
      id: "global",
      total_readers: 0,
      active_readers: 0,
      total_views: 0,
      total_downloads: 0,
      last_updated: new Date().toISOString(),
    });

    console.log("\n✅ Analytics reset complete! All counters are now at zero.\n");
  } catch (err) {
    console.error("\n❌ Error:", err.message);
    process.exit(1);
  }
}

main();
