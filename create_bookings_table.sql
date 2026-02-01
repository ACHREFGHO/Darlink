
-- 1. Create Bookings Table
create type booking_status as enum ('pending', 'confirmed', 'cancelled');

create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade not null,
  room_id uuid references public.rooms(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  
  start_date date not null,
  end_date date not null,
  status booking_status default 'pending' not null,
  total_price decimal(10, 2) not null,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS
alter table public.bookings enable row level security;

-- 3. RLS Policies

-- Owners can view bookings for their properties
create policy "Owners can view bookings"
  on public.bookings for select using (
    exists (
      select 1 from public.properties
      where id = bookings.property_id
      and owner_id = auth.uid()
    )
  );

-- Users can view their own bookings
create policy "Users can view own bookings"
  on public.bookings for select using (auth.uid() = user_id);

-- Users can insert bookings (request to book)
create policy "Users can create bookings"
  on public.bookings for insert with check (auth.uid() = user_id);
  
-- Owners can update status
create policy "Owners can update booking status"
  on public.bookings for update using (
    exists (
      select 1 from public.properties
      where id = bookings.property_id
      and owner_id = auth.uid()
    )
  );
