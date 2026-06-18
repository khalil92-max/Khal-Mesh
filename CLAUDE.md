# KhalMesh — دليل المشروع (لأي جلسة Claude)

موقع خاص بين شخصين (Khalil + Meshari) لمشاركة notes / links / projects.
محمي بـ password، RTL عربي، light mode.

## التشغيل المحلي
- المنفذ **3000 مشغول بمشروع آخر** على هذا الجهاز — شغّل دائماً على منفذ بديل:
  ```
  npx next dev -p 3100
  ```
  ثم افتح http://localhost:3100
- أي تعديل على `.env` يتطلّب **إيقاف وإعادة تشغيل** السيرفر.
- Git مثبّت في `C:\Program Files\Git\cmd` (إن لم يكن في PATH أضِفه للجلسة).

## الروابط
- GitHub: https://github.com/khalil92-max/Khal-Mesh
- الإنتاج (Vercel): https://khal-mesh.vercel.app
- Supabase project ref: `wbvviopaadgftxrbaqqi`

## النشر
- `git push origin main` ➜ Vercel ينشر تلقائياً.
- متغيّرات البيئة مضبوطة على Vercel (Production). تغييرها يتطلّب **Redeploy**.
- نفس متغيّرات `.env` السبعة مطلوبة محلياً وعلى Vercel (انظر `.env.example`).

## المعمارية
- Next.js 15 (App Router) + TS + Tailwind v3 + Supabase (service role، server-only).
- مصادقة: `/api/login` يتحقق ويضبط cookie موقّعة HMAC (`src/lib/session.ts`)؛
  `src/middleware.ts` يحمي كل المسارات ماعدا `/login` و `/api/login`.
- البيانات: server actions في `src/app/actions.ts`؛ القراءة في `src/lib/items.ts`.
- المرفقات تُخدَّم عبر `/api/file/[id]` بنوع المحتوى الصحيح (HTML يعمل كصفحة، لا كنص).
- **مرفقات المجلّدات**: يمكن رفع مجلّد كامل لعنصر (أعمدة `folder_prefix/folder_entry/folder_files`
  على `items`، تخزين تحت `folders/<uuid>/...`). يُخدَّم عبر `/api/folder/[id]/[...path]`
  فيشتغل موقع HTML بروابطه النسبية؛ صفحة `/items/[id]/files` تتصفّح الملفات.
  ⚠️ المحتوى المرفوع يعمل على **نفس أصل التطبيق** (لتُحمَّل ملفاته الفرعية بالكوكي) — ارفع
  فقط مجلّدات تثق بها. الرفع يمرّ عبر server action (حدّ Vercel ~4.5MB لكل عملية).
- **المنهج (modules)**: صفحة `/curriculum` — جدول `public.modules` (`completed_by text[]`،
  `file_path`). كل موديول يُؤشَّر مكتملاً لكل شخص؛ النسبة لكل شخص = موديولاته ÷ الإجمالي.
  أكشن في `src/app/module-actions.ts`، قراءة في `src/lib/modules.ts`. ملف الموديول يُخدَّم
  عبر `/api/module-file/[id]` (HTML يعمل كصفحة، غيره يُنزَّل). رفع الملفات المشترك في
  `src/lib/storage.ts`. رابط "المنهج" البنفسجي في الشريط الجانبي.
  تُجمَّع الموديولات في **أقسام** (مجلّدات قابلة للطيّ، واحد مفتوح في كل مرّة): جدول
  `public.sections` + `modules.section_id` (FK on delete set null). الأكورديون في
  `src/components/CurriculumAccordion.tsx`، نقل الموديول عبر `ModuleSection`.
- **ساعات التعلّم**: جدول `public.learning_log` (`person`, `hours`)؛ إجمالي كل شخص يظهر
  جنب اسمه في الشريط الجانبي. القراءة في `src/lib/learning.ts` (**متسامحة** ترجع {} لو
  الجدول مفقود حتى لا ينهار الشريط)، الإضافة عبر `AddHours` + `src/app/learning-actions.ts`.

## أدوات الإعداد (lمرة واحدة، في scripts/)
- `migrate.sql` / `grants.sql`: إنشاء الجدول + bucket + الصلاحيات (تُنفَّذ في Supabase SQL Editor).
- `migrate-folders.sql`: يضيف أعمدة المجلّدات (شغّلها في SQL Editor، أو
  `node scripts/migrate-folders.mjs "<DATABASE_URL>"`). قاعدة المحلّي والإنتاج **واحدة**.
- `migrate-modules.sql`: ينشئ جدول `modules` + عمود `file_path` (SQL Editor أو
  `node scripts/migrate-modules.mjs "<DATABASE_URL>"`).
- `migrate-sections.sql`: ينشئ جدول `sections` + عمود `modules.section_id`
  (SQL Editor أو `node scripts/migrate-sections.mjs "<DATABASE_URL>"`).
- `migrate-learning.sql`: ينشئ جدول `learning_log` لساعات التعلّم
  (SQL Editor أو `node scripts/migrate-learning.mjs "<DATABASE_URL>"`).
- `smoke.mjs` / `list.mjs` / `check-folders.mjs` / `folder-info.mjs` / `check-modules.mjs`:
  فحص قاعدة البيانات محلياً (`node scripts/<file>.mjs`).

## افتراضات
- المساحة مشتركة — أي مستخدم يعدّل/يحذف أي عنصر. لتقييد ذلك أضِف فحص `author === user`
  في `updateItem`/`deleteItem`.
