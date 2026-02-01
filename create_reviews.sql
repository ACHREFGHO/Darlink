
-- 1. Create Reviews Table
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null, -- Link to profiles for name/avatar
  booking_id uuid references public.bookings(id) on delete cascade not null,
  
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  
  created_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.reviews enable row level security;

-- 3. Policies
-- Everyone can read reviews
create policy "Reviews are visible to everyone" 
on public.reviews for select using (true);

-- Authenticated users can create reviews if they own the booking
create policy "Users can create reviews for their bookings" 
on public.reviews for insert 
with check (
    auth.uid() = user_id 
);

-- 4. Helper to calculate average rating
-- (Optional, can be done in frontend or via view, but a view is nice)
create or replace view public.property_ratings as
select 
  property_id, 
  count(*) as review_count, 
  round(avg(rating), 2) as average_rating
from public.reviews
group by property_id;
