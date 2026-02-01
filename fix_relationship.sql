
-- 1. Drop the old Foreign Key that points to auth.users (which prevents joining profiles)
alter table public.bookings
drop constraint if exists bookings_user_id_fkey;

-- 2. Add new Foreign Key pointing to public.profiles
-- This allows: supabase.from('bookings').select('*, guest:profiles(...)')
alter table public.bookings
add constraint bookings_user_id_fkey
foreign key (user_id)
references public.profiles(id)
on delete cascade;
