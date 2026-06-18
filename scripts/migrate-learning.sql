-- KhalMesh — سجلّ ساعات التعلّم اليدوية (تظهر جنب أسماء الأشخاص في الشريط).
-- شغّلها مرّة واحدة في Supabase ▸ SQL Editor
-- (أو: node scripts/migrate-learning.mjs "<DATABASE_URL>").
--
-- كل إضافة = صف؛ إجمالي ساعات الشخص = مجموع hours حيث person = الاسم.

create extension if not exists "pgcrypto";

create table if not exists public.learning_log (
  id          uuid primary key default gen_random_uuid(),
  person      text not null,
  hours       numeric not null,
  author      text not null,
  created_at  timestamptz not null default now()
);

create index if not exists learning_log_person_idx on public.learning_log (person);

alter table public.learning_log enable row level security;
grant all privileges on table public.learning_log to service_role;
grant all privileges on table public.learning_log to postgres;

notify pgrst, 'reload schema';
