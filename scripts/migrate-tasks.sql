-- KhalMesh — تصنيف "مهمة" (task) + عمود deadline على items.
-- شغّلها مرّة واحدة في Supabase ▸ SQL Editor
-- (أو: node scripts/migrate-tasks.mjs "<DATABASE_URL>").
--
-- المهمة مثل الملاحظة (عنوان + وصف) لكن مع موعد نهائي؛ عند وصوله تظهر
-- في الواجهة كورقة ممزّقة. الوقت يُخزَّن كوقت حائط (بلا منطقة زمنية).

-- يضيف القيمة الجديدة للـ enum (آمن لإعادة التشغيل). لا نستخدمها في نفس
-- السكربت حتى لا تتعارض مع تنفيذ المعاملة الواحدة.
alter type item_type add value if not exists 'task';

-- عمود الموعد النهائي (وقت حائط بلا منطقة زمنية).
alter table public.items add column if not exists deadline timestamp;

notify pgrst, 'reload schema';
