-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Create the storage bucket
insert into storage.buckets (id, name, public) 
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- 2. Create policy to allow uploads
create policy "Authenticated users can upload images"
on storage.objects for insert
with check ( bucket_id = 'property-images' and auth.role() = 'authenticated' );

-- 3. Create policy to allow public viewing
create policy "Images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'property-images' );

-- 4. Create policy to allow owners to delete their own images (optional but good)
create policy "Users can delete own images"
on storage.objects for delete
using ( bucket_id = 'property-images' and auth.uid()::text = (storage.foldername(name))[1] );
