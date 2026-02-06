-- 1. PROPERTY VIEWS TABLE
create table if not exists public.property_views (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references public.properties(id) on delete cascade not null,
  viewer_id uuid references auth.users(id) on delete set null, -- Optional logged in user
  viewed_at timestamptz default now()
);

-- RLS for Views
alter table public.property_views enable row level security;
create policy "Owners can view views for their properties"
  on public.property_views for select using (
    exists (
      select 1 from public.properties
      where id = property_views.property_id
      and owner_id = auth.uid()
    )
  );

create policy "Anyone can insert a view"
  on public.property_views for insert with check (true);

-- Index for performance
create index if not exists idx_property_views_property_at on public.property_views(property_id, viewed_at);

-- 2. DASHBOARD SUMMARY VIEW (Optional but helpful)
-- Monthly earnings per owner
create or replace view public.owner_monthly_earnings as
select 
  p.owner_id,
  date_trunc('month', b.start_date) as month,
  sum(b.total_price) as earnings
from public.bookings b
join public.properties p on b.property_id = p.id
where b.status = 'confirmed'
group by p.owner_id, month;

-- Daily views per owner
create or replace view public.owner_daily_views as
select 
  p.owner_id,
  date_trunc('day', v.viewed_at) as day,
  count(*) as view_count
from public.property_views v
join public.properties p on v.property_id = p.id
group by p.owner_id, day;
