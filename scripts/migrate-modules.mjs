// يشغّل scripts/migrate-modules.sql على قاعدة Supabase عبر connection string.
// الاستخدام: node scripts/migrate-modules.mjs "<DATABASE_URL>"
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const url = process.argv[2] || process.env.DATABASE_URL;
if (!url) {
  console.error(
    'ERROR: مرّر connection string كأول وسيط:\n  node scripts/migrate-modules.mjs "postgresql://postgres:PASSWORD@db.<ref>.supabase.co:5432/postgres"'
  );
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, "migrate-modules.sql"), "utf8");

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    "select to_regclass('public.modules') as t"
  );
  console.log(
    rows[0].t ? "MIGRATION OK ✅ — جدول modules جاهز" : "⚠️ لم يُنشأ جدول modules"
  );
} catch (e) {
  console.error("MIGRATION FAILED:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
