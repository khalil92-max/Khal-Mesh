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

-- تفعيل RLS بدون policy: service role فقط يتجاوزه
alter table public.items enable row level security;

-- bucket المرفقات (خاص)
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;
