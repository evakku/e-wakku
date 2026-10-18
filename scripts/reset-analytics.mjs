import fs from "fs";
import path from "path";

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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing Supabase credentials in environment or .env.local.");
  console.error("   Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY is not defined.");
  console.warn("   Using NEXT_PUBLIC_SUPABASE_ANON_KEY. Note: Under secured RLS policies, anon role may receive HTTP 401/403.");
  console.warn("   Add SUPABASE_SERVICE_ROLE_KEY to .env.local for authorized reset operations.\n");
}

const headers = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
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
