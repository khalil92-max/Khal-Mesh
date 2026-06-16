-- KhalMesh — منهج (modules) مع تتبّع إنجاز لكل شخص.
-- شغّلها مرّة واحدة في Supabase ▸ SQL Editor
-- (أو: node scripts/migrate-modules.mjs "<DATABASE_URL>"). نفس قاعدة المحلّي والإنتاج.
--
-- completed_by : أسماء الأشخاص الذين أكملوا الموديول (مصفوفة نصوص).
--                النسبة لكل شخص = عدد الموديولات التي تحوي اسمه ÷ إجمالي الموديولات.

create extension if not exists "pgcrypto";

create table if not exists public.modules (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  position     int  not null default 0,
  completed_by text[] not null default '{}',
  file_path    text,
  author       text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- مرفق ملف لكل موديول (لجداول أُنشئت قبل إضافة العمود)
alter table public.modules add column if not exists file_path text;

create index if not exists modules_position_idx on public.modules (position, created_at);

-- تحديث updated_at تلقائياً (الدالة منشأة أصلاً في migrate.sql؛ نعيد تعريفها للاحتياط)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists modules_set_updated_at on public.modules;
create trigger modules_set_updated_at
  before update on public.modules
  for each row execute function public.set_updated_at();

-- RLS بدون policy: service role فقط يتجاوزه (نفس نمط جدول items)
alter table public.modules enable row level security;

grant all privileges on table public.modules to service_role;
grant all privileges on table public.modules to postgres;

notify pgrst, 'reload schema';
