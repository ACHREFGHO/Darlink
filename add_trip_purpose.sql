
-- Add trip_purpose column to bookings table
alter table public.bookings 
add column if not exists trip_purpose text;
