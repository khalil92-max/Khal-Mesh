// فحص سريع: هل جدول modules ظاهر لـ PostgREST؟
// الاستخدام: node scripts/check-modules.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(
  /\r?\n/
)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2];
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { error } = await supabase
  .from("modules")
  .select("id, title, completed_by")
  .limit(1);

if (error) {
  console.log("CHECK FAILED ❌ :", error.message);
  console.log("→ شغّل هجرة الموديولات (migrate-modules.sql) أولاً.");
  process.exit(2);
}
console.log("CHECK OK ✅ — جدول modules جاهز. الميزة تعمل.");
