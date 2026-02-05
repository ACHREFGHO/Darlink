create table if not exists public.favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, property_id)
);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites"
  on public.favorites for select using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.favorites for delete using (auth.uid() = user_id);
