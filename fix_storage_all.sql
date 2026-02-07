-- ==========================================
-- 1. CREATE BUCKETS
-- ==========================================

-- Create property-images bucket
insert into storage.buckets (id, name, public) 
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- Create avatars bucket
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- ==========================================
-- 2. CLEANUP OLD POLICIES (To avoid conflicts)
-- ==========================================
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Images are publicly accessible" on storage.objects;
drop policy if exists "Users can delete own images" on storage.objects;
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
drop policy if exists "Users can update their own avatars" on storage.objects;
drop policy if exists "Avatars are publicly accessible" on storage.objects;

-- ==========================================
-- 3. PROPERTY-IMAGES POLICIES
-- ==========================================

create policy "Authenticated users can upload images"
on storage.objects for insert
with check ( bucket_id = 'property-images' and auth.role() = 'authenticated' );

create policy "Images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'property-images' );

create policy "Users can delete own images"
on storage.objects for delete
using ( bucket_id = 'property-images' and auth.uid()::text = (storage.foldername(name))[1] );

-- ==========================================
-- 4. AVATARS POLICIES
-- ==========================================

create policy "Authenticated users can upload avatars"
on storage.objects for insert
with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Note: We use update and delete policies too for maintenance
create policy "Users can update their own avatars"
on storage.objects for update
using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Avatars are publicly accessible"
on storage.objects for select
using ( bucket_id = 'avatars' );
