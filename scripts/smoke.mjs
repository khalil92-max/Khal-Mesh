// فحص شامل لمسار البيانات: insert -> select -> upload -> signed url -> cleanup
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

const log = (...a) => console.log(...a);

// 1) insert
const { data: ins, error: e1 } = await supabase
  .from("items")
  .insert({ type: "note", title: "فحص تلقائي", body: "هذا عنصر اختبار", author: "system" })
  .select()
  .single();
if (e1) { console.error("INSERT FAILED:", e1.message); process.exit(1); }
log("1) insert OK  id:", ins.id);

// 2) select
const { data: sel, error: e2 } = await supabase.from("items").select("*").eq("id", ins.id).single();
if (e2) { console.error("SELECT FAILED:", e2.message); process.exit(1); }
log("2) select OK  title:", sel.title);

// 3) storage upload + signed url
const path = `smoke-${ins.id}.txt`;
const { error: e3 } = await supabase.storage.from("attachments").upload(path, new Blob(["hello"]), { contentType: "text/plain" });
if (e3) { console.error("UPLOAD FAILED:", e3.message); process.exit(1); }
const { data: signed, error: e4 } = await supabase.storage.from("attachments").createSignedUrl(path, 60);
if (e4) { console.error("SIGNED URL FAILED:", e4.message); process.exit(1); }
log("3) storage upload + signed url OK");

// 4) cleanup
await supabase.storage.from("attachments").remove([path]);
await supabase.from("items").delete().eq("id", ins.id);
log("4) cleanup OK");
log("\nALL GOOD ✅ — DB + Storage يعملان بالكامل");
