import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2];
}
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data, error } = await supabase
  .from("items")
  .select("id,type,title,url,file_path,author,created_at")
  .order("created_at", { ascending: false });
if (error) { console.error(error.message); process.exit(1); }
for (const it of data) {
  console.log(`[${it.type}] "${it.title}" | url=${it.url ?? "-"} | file=${it.file_path ?? "-"} | by ${it.author}`);
}
console.log(`\nالمجموع: ${data.length} عنصر`);
