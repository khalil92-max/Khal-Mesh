// يشغّل scripts/migrate-folders.sql على قاعدة Supabase عبر connection string.
// الاستخدام: node scripts/migrate-folders.mjs "<DATABASE_URL>"
// (نفس الـ connection string المستخدم مع migrate.mjs)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const url = process.argv[2] || process.env.DATABASE_URL;
if (!url) {
  console.error(
    'ERROR: مرّر connection string كأول وسيط:\n  node scripts/migrate-folders.mjs "postgresql://postgres:PASSWORD@db.<ref>.supabase.co:5432/postgres"'
  );
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, "migrate-folders.sql"), "utf8");

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    "select column_name from information_schema.columns where table_schema='public' and table_name='items' and column_name like 'folder_%' order by column_name"
  );
  const cols = rows.map((r) => r.column_name);
  if (cols.length === 3) {
    console.log("MIGRATION OK ✅ — الأعمدة:", cols.join(", "));
  } else {
    console.log("⚠️ الأعمدة الموجودة:", cols.join(", ") || "(لا شيء)");
  }
} catch (e) {
  console.error("MIGRATION FAILED:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
