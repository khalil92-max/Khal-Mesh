// يشغّل scripts/migrate-tasks.sql على قاعدة Supabase عبر connection string.
// الاستخدام: node scripts/migrate-tasks.mjs "<DATABASE_URL>"
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const url = process.argv[2] || process.env.DATABASE_URL;
if (!url) {
  console.error(
    'ERROR: مرّر connection string كأول وسيط:\n  node scripts/migrate-tasks.mjs "postgresql://postgres:PASSWORD@db.<ref>.supabase.co:5432/postgres"'
  );
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, "migrate-tasks.sql"), "utf8");

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    "select column_name from information_schema.columns where table_name = 'items' and column_name = 'deadline'"
  );
  console.log(
    rows.length
      ? "MIGRATION OK ✅ — نوع 'task' وعمود deadline جاهزان"
      : "⚠️ لم يُضَف عمود deadline"
  );
} catch (e) {
  console.error("MIGRATION FAILED:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
