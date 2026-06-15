-- KhalMesh — دعم رفع مجلّد كامل كمرفق لعنصر.
-- شغّلها مرّة واحدة في Supabase ▸ SQL Editor (نفس قاعدة المحلّي والإنتاج).
--
-- folder_prefix : بادئة التخزين في bucket "attachments"، مثل folders/<uuid>
-- folder_entry  : المسار النسبي لملف البداية (عادةً index.html)
-- folder_files  : قائمة المسارات النسبية لكل ملفات المجلّد (للعرض والحذف والتحقّق)

alter table public.items
  add column if not exists folder_prefix text,
  add column if not exists folder_entry  text,
  add column if not exists folder_files  text[];

-- أعِد تحميل مخبّأ المخطّط في PostgREST حتى يلتقط الأعمدة فوراً
-- (وإلا قد يظهر خطأ: Could not find the 'folder_entry' column ... in the schema cache)
notify pgrst, 'reload schema';
