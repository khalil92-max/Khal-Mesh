-- منح الصلاحيات لأدوار Supabase على جدول items
grant usage on schema public to service_role, anon, authenticated;
grant all privileges on table public.items to service_role;
grant all privileges on table public.items to postgres;

-- إعادة تحميل schema cache الخاص بـ PostgREST
notify pgrst, 'reload schema';
