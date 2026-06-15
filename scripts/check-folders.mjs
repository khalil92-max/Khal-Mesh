// فحص سريع: هل أعمدة المجلّد ظاهرة لـ PostgREST (نفس مسار التطبيق)؟
// الاستخدام: node scripts/check-folders.mjs
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
  .from("items")
  .select("id, folder_prefix, folder_entry, folder_files")
  .limit(1);

if (error) {
  console.log("CHECK FAILED ❌ :", error.message);
  console.log(
    "→ الأعمدة غير ظاهرة: إمّا أنّ ALTER ما انشغّل، أو مخبّأ PostgREST قديم."
  );
  process.exit(2);
}
console.log("CHECK OK ✅ — أعمدة المجلّد ظاهرة لـ PostgREST. الميزة جاهزة.");
