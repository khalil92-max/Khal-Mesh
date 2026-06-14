import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
const env = {};
for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2];
}
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const path = "e2669e41-1d22-4b86-8a48-a044b85c7eda-unscrew-the-hand.html";
const { data } = await supabase.storage.from("attachments").createSignedUrl(path, 60);
const res = await fetch(data.signedUrl, { method: "HEAD" });
console.log("content-type:", res.headers.get("content-type"));
console.log("content-disposition:", res.headers.get("content-disposition"));
