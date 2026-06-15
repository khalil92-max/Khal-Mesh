// يطبع بيانات آخر العناصر التي تحتوي مجلّداً (للتشخيص).
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

const { data, error } = await supabase
  .from("items")
  .select("id, title, folder_prefix, folder_entry, folder_files, created_at")
  .not("folder_prefix", "is", null)
  .order("created_at", { ascending: false })
  .limit(3);

if (error) {
  console.log("ERR:", error.message);
  process.exit(1);
}
if (!data.length) {
  console.log("لا يوجد عنصر فيه مجلّد بعد.");
  process.exit(0);
}
for (const it of data) {
  const files = it.folder_files || [];
  console.log("───────────────");
  console.log("title :", it.title);
  console.log("entry :", it.folder_entry);
  console.log("files :", files.length, "→", files.slice(0, 15).join(", "));
  console.log("url   : /api/folder/" + it.id + "/" + it.folder_entry);
  console.log(
    "entry∈files?",
    files.includes(it.folder_entry) ? "نعم ✅" : "لا ❌ (سبب 404)"
  );
}
