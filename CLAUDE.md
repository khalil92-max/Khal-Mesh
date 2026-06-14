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

## أدوات الإعداد (lمرة واحدة، في scripts/)
- `migrate.sql` / `grants.sql`: إنشاء الجدول + bucket + الصلاحيات (تُنفَّذ في Supabase SQL Editor).
- `smoke.mjs` / `list.mjs`: فحص قاعدة البيانات محلياً (`node scripts/<file>.mjs`).

## افتراضات
- المساحة مشتركة — أي مستخدم يعدّل/يحذف أي عنصر. لتقييد ذلك أضِف فحص `author === user`
  في `updateItem`/`deleteItem`.
