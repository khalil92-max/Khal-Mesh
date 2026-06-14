# KhalMesh

مساحة خاصة بين شخصين فقط لمشاركة **الملاحظات والروابط والمشاريع**. محمية بـ password،
واجهة عربية RTL، Light mode، وكل الوصول للبيانات يتم **server-side فقط**.

البناء: Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Storage) · Vercel.

---

## نظرة سريعة على المعمارية

- **المصادقة:** صفحة `/login` فيها حقل password واحد. التحقق يتم في route handler
  (`/api/login`) مقابل قيم مخزّنة في environment variables. عند النجاح تُنشأ
  **httpOnly secure cookie** موقّعة بـ HMAC-SHA256 (`SESSION_SECRET`) وتحمل اسم المستخدم.
- **الحماية:** `src/middleware.ts` يحمي كل المسارات ماعدا `/login` و `/api/login`؛ أي طلب
  بدون session صالح يُحوّل إلى `/login`. الرقم السري لا يصل أبداً إلى الـ client bundle.
- **البيانات:** كل عمليات CRUD تمرّ عبر **server actions** و route handlers باستخدام
  **service role key** (متغيّر سري على الخادم فقط). الـ anon key غير مستخدم في الـ client إطلاقاً.
- **الملفات:** المرفقات تُرفع إلى Supabase Storage في bucket خاص (private)، وتُعرض عبر
  signed URLs تُولّد server-side وقت العرض.

---

## 1) متغيّرات البيئة المطلوبة

انسخ `.env.example` إلى `.env.local` واملأ القيم:

```env
USER1_NAME=khaled
USER1_PASSWORD=<رقم سري طويل وصعب>
USER2_NAME=friend
USER2_PASSWORD=<رقم سري طويل وصعب>

SESSION_SECRET=<قيمة عشوائية طويلة>

SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
```

| المتغيّر | الوصف |
|---|---|
| `USER1_NAME` / `USER2_NAME` | اسم كل مستخدم — يُستخدم كـ `author` لكل عنصر. |
| `USER1_PASSWORD` / `USER2_PASSWORD` | الرقم السري لكل مستخدم. لا hardcode في الكود. |
| `SESSION_SECRET` | سر توقيع الـ cookie. ولّده بـ: `openssl rand -base64 48`. |
| `SUPABASE_URL` | من Supabase ➜ Project Settings ➜ API. |
| `SUPABASE_SERVICE_ROLE_KEY` | المفتاح السري (service_role). **لا تكشفه أبداً.** |

> لاحظ: لا يوجد أي متغيّر بادئته `NEXT_PUBLIC_` — لأن كل شيء يعمل على الخادم.

---

## 2) إعداد Supabase

1. أنشئ مشروعاً جديداً على [supabase.com](https://supabase.com).
2. افتح **SQL Editor** ونفّذ السكربت التالي لإنشاء الجدول والـ trigger والـ RLS:

```sql
-- توليد UUID
create extension if not exists "pgcrypto";

-- نوع العنصر
do $$ begin
  create type item_type as enum ('note', 'link', 'project');
exception when duplicate_object then null;
end $$;

-- جدول العناصر
create table if not exists public.items (
  id          uuid primary key default gen_random_uuid(),
  type        item_type not null,
  title       text not null,
  body        text,
  url         text,
  file_path   text,
  author      text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists items_created_at_idx on public.items (created_at desc);

-- تحديث updated_at تلقائياً
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at
  before update on public.items
  for each row execute function public.set_updated_at();

-- تفعيل RLS بدون أي policy:
-- يمنع anon/authenticated تماماً، بينما service role (المستخدم على الخادم) يتجاوز RLS.
alter table public.items enable row level security;
```

3. أنشئ الـ Storage bucket (خاص). نفّذ في SQL Editor:

```sql
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;
```

> أو من الواجهة: **Storage ➜ New bucket** باسم `attachments` مع إبقاء **Public** مغلقاً.
> لا حاجة لأي Storage policies لأن الوصول يتم عبر service role من الخادم فقط.

4. من **Project Settings ➜ API** انسخ `Project URL` و `service_role` key إلى `.env.local`.

---

## 3) التشغيل محلياً

```bash
npm install
npm run dev
```

افتح `http://localhost:3000` — ستُحوّل إلى `/login`. أدخل أحد الـ passwords.

---

## 4) النشر على Vercel

1. ارفع المشروع إلى مستودع Git (GitHub مثلاً).
2. على [vercel.com](https://vercel.com) ➜ **Add New ➜ Project** واختر المستودع.
   (Vercel يكتشف Next.js تلقائياً — لا حاجة لإعداد build.)
3. في **Settings ➜ Environment Variables** أضف **كل** المتغيّرات من القسم (1)
   للبيئات: Production و Preview و Development.
4. اضغط **Deploy**.
5. بعد النشر، أي تغيير على متغيّرات البيئة يتطلّب **Redeploy**.

> الـ cookie تُضبط بـ `secure: true` تلقائياً في الإنتاج (HTTPS)، وغير secure محلياً (HTTP).

---

## بنية المشروع

```
src/
├── middleware.ts            حماية كل المسارات
├── app/
│   ├── layout.tsx           RTL + الخطوط
│   ├── globals.css          ألوان/تصميم
│   ├── page.tsx             الصفحة الرئيسية (قائمة + فلتر + بحث)
│   ├── new/page.tsx         إضافة عنصر
│   ├── items/[id]/edit/     تعديل عنصر
│   ├── actions.ts           server actions: create / update / delete
│   └── api/
│       ├── login/route.ts   تحقق + ضبط الكوكي
│       └── logout/route.ts  مسح الكوكي
├── components/              واجهة (Header, ItemForm, ItemCard, Toolbar, ...)
└── lib/
    ├── session.ts           توقيع/تحقق الكوكي (Edge-safe)
    ├── auth.ts              قراءة المستخدم الحالي + قائمة المسموح لهم
    ├── supabase.ts          عميل service role (server-only)
    ├── items.ts             استعلامات القراءة + signed URLs
    └── types.ts             الأنواع
```

---

## الافتراضات (عند الغموض اخترنا الأبسط)

- **تخزين الـ session:** cookie موقّعة بـ HMAC تحمل اسم المستخدم — بدون جدول sessions
  ولا مكتبة auth خارجية. كافٍ ومناسب لشخصين.
- **الملكية (`author`):** تُحدَّد من الـ session وقت الإنشاء. أي مستخدم من الاثنين
  يمكنه تعديل/حذف أي عنصر (مساحة مشتركة بين صديقين). لو احتجت تقييد التعديل على
  صاحب العنصر فقط، أضف فحص `author === user` في `updateItem`/`deleteItem`.
- **المرفقات:** ملف واحد اختياري لكل عنصر. الاسم الأصلي يُستخرج من المسار للعرض.
  حد الحجم الافتراضي 10MB (`next.config.ts`).
- **البحث:** `ilike` بسيط على العنوان والمحتوى (غير حسّاس لحالة الأحرف).
- **Tailwind v3** اختياراً للاستقرار وسهولة التهيئة.
- لا تسجيل (signup) — المستخدمون ثابتان عبر متغيّرات البيئة فقط.
```
