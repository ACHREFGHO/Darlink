
-- Run this in Supabase SQL Editor to fix the stuck booking issue

-- 1. Check if functionality exists and add the column if missing
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'trip_purpose') then
        alter table public.bookings add column trip_purpose text;
    end if;
end $$;

-- 2. Force refresh schema cache just in case
notify pgrst, 'reload schema';
