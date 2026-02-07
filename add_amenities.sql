-- Add amenities table
create table if not exists public.property_amenities (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade not null,
  amenity text not null,
  unique(property_id, amenity)
);

-- RLS for Amenities
alter table public.property_amenities enable row level security;
create policy "Amenities viewable by everyone" on public.property_amenities for select using (true);
create policy "Owners can manage amenities" on public.property_amenities for all using (
    exists (
      select 1 from public.properties
      where id = property_amenities.property_id
      and owner_id = auth.uid()
    )
);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
