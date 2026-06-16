-- KhalMesh — أقسام المنهج (مجلّدات تجمّع الموديولات).
-- شغّلها مرّة واحدة في Supabase ▸ SQL Editor
-- (أو: node scripts/migrate-sections.mjs "<DATABASE_URL>").

create extension if not exists "pgcrypto";

create table if not exists public.sections (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  position    int  not null default 0,
  author      text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists sections_position_idx on public.sections (position, created_at);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists sections_set_updated_at on public.sections;
create trigger sections_set_updated_at
  before update on public.sections
  for each row execute function public.set_updated_at();

alter table public.sections enable row level security;
grant all privileges on table public.sections to service_role;
grant all privileges on table public.sections to postgres;

-- ربط الموديول بقسم (حذف القسم يُرجِع موديولاته "بدون قسم")
alter table public.modules
  add column if not exists section_id uuid references public.sections(id) on delete set null;
create index if not exists modules_section_idx on public.modules (section_id);

notify pgrst, 'reload schema';
