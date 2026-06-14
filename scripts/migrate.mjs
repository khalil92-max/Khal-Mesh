// يشغّل scripts/migrate.sql على قاعدة بيانات Supabase عبر connection string.
// الاستخدام: node scripts/migrate.mjs "<DATABASE_URL>"
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const url = process.argv[2] || process.env.DATABASE_URL;
if (!url) {
  console.error("ERROR: provide a connection string as the first argument.");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, "migrate.sql"), "utf8");

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    "select count(*)::int as n from public.items"
  );
  console.log("MIGRATION OK — items table ready, rows:", rows[0].n);
} catch (e) {
  console.error("MIGRATION FAILED:", e.message);
  process.exit(1);
} finally {
  await client.end();
}
