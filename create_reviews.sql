
-- 1. Create Reviews Table with Score Categories
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  booking_id uuid references public.bookings(id) on delete cascade, -- Optional, but good for verification
  
  -- Overall rating
  rating decimal(3,2) not null check (rating >= 1 and rating <= 5),
  
  -- Score Categories
  cleanliness integer not null check (cleanliness >= 1 and cleanliness <= 5),
  accuracy integer not null check (accuracy >= 1 and accuracy <= 5),
  communication integer not null check (communication >= 1 and communication <= 5),
  location_rating integer not null check (location_rating >= 1 and location_rating <= 5),
  check_in integer not null check (check_in >= 1 and check_in <= 5),
  value integer not null check (value >= 1 and value <= 5),
  
  comment text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.reviews enable row level security;

-- 3. Policies
-- Everyone can read reviews
create policy "Reviews are viewable by everyone" 
on public.reviews for select using (true);

-- Users can only insert their own reviews
create policy "Users can insert their own reviews" 
on public.reviews for insert with check (auth.uid() = user_id);

-- Users can only delete their own reviews
create policy "Users can delete their own reviews" 
on public.reviews for delete using (auth.uid() = user_id);

-- 4. View for Property Average Ratings
drop view if exists public.property_ratings;
create view public.property_ratings as
select 
  property_id, 
  count(*) as review_count, 
  round(avg(rating), 2) as average_rating,
  round(avg(cleanliness), 2) as avg_cleanliness,
  round(avg(accuracy), 2) as avg_accuracy,
  round(avg(communication), 2) as avg_communication,
  round(avg(location_rating), 2) as avg_location,
  round(avg(check_in), 2) as avg_check_in,
  round(avg(value), 2) as avg_value
from public.reviews
group by property_id;
