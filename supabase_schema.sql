-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (User Management)
-- Links to auth.users and stores role/approval status
create type user_role as enum ('client', 'house_owner', 'admin');

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  role user_role default 'client' not null,
  is_approved boolean default false, -- Only relevant for house_owners
  avatar_url text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Trigger to create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'client' -- Default role, can be updated later
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. PROPERTIES TABLE
create type property_type as enum ('House', 'Apartment', 'Guesthouse');
create type property_status as enum ('Pending', 'Published', 'Rejected');

create table public.properties (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  type property_type not null,
  status property_status default 'Pending' not null,
  
  -- Location
  address text not null,
  city text not null,
  governorate text not null,
  
  -- Media
  main_image_url text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for Properties
alter table public.properties enable row level security;

create policy "Published properties are viewable by everyone"
  on public.properties for select using (status = 'Published' or owner_id = auth.uid());

create policy "Owners can insert their own properties"
  on public.properties for insert with check (owner_id = auth.uid());

create policy "Owners can update their own properties"
  on public.properties for update using (owner_id = auth.uid());


-- 3. ROOMS TABLE
create table public.rooms (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade not null,
  name text not null, -- e.g., "Master Bedroom" or "Whole House"
  description text,
  price_per_night decimal(10, 2) not null,
  beds integer not null default 1,
  max_guests integer not null default 2,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- RLS for Rooms
alter table public.rooms enable row level security;

create policy "Rooms viewable if property is published or user is owner"
  on public.rooms for select using (
    exists (
      select 1 from public.properties
      where id = rooms.property_id
      and (status = 'Published' or owner_id = auth.uid())
    )
  );

create policy "Owners can manage rooms"
  on public.rooms for all using (
    exists (
      select 1 from public.properties
      where id = rooms.property_id
      and owner_id = auth.uid()
    )
  );


-- 4. PROPERTY SPECS (Tags/Categories)
create type spec_category as enum ('Family', 'Friends', 'Company');

create table public.property_specs (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade not null,
  category spec_category not null,
  unique(property_id, category)
);

-- RLS for Specs
alter table public.property_specs enable row level security;
-- (Simpler policy: allow read for all, write for owners)
create policy "Specs viewable by everyone" on public.property_specs for select using (true);
create policy "Owners can manage specs" on public.property_specs for all using (
    exists (
      select 1 from public.properties
      where id = property_specs.property_id
      and owner_id = auth.uid()
    )
);


-- 5. PROPERTY IMAGES (Gallery)
create table public.property_images (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade not null,
  image_url text not null,
  display_order integer default 0,
  created_at timestamptz default now()
);

alter table public.property_images enable row level security;
create policy "Images viewable by everyone" on public.property_images for select using (true);
create policy "Owners can manage images" on public.property_images for all using (
    exists (
      select 1 from public.properties
      where id = property_images.property_id
      and owner_id = auth.uid()
    )
);

-- 6. STORAGE BUCKET SETUP (Scripts for SQL Editor context)
-- Note: Buckets often need to be created via Dashboard, but policies can be here
insert into storage.buckets (id, name, public) 
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Policies for property-images
create policy "Authenticated users can upload images"
on storage.objects for insert
with check ( bucket_id = 'property-images' and auth.role() = 'authenticated' );

create policy "Images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'property-images' );

-- Policies for avatars
create policy "Authenticated users can upload avatars"
on storage.objects for insert
with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Users can update their own avatars"
on storage.objects for update
using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Avatars are publicly accessible"
on storage.objects for select
using ( bucket_id = 'avatars' );


-- 3. ROOMS TABLE (Updated)
-- Added units_count to support multiple units of the same type (e.g. "5 Apartments available")
alter table public.rooms add column if not exists units_count integer default 1 not null;

-- 7. BOOKINGS TABLE (Availability Management)
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

-- RLS for Bookings
alter table public.bookings enable row level security;

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
