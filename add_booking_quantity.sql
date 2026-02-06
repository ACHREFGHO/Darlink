
-- Support booking multiple units of the same type (important for "Group of Apartments" or "Guesthouses")
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'bookings' and column_name = 'units_booked') then
        alter table public.bookings add column units_booked integer default 1 not null;
    end if;
end $$;

-- Force refresh schema cache
notify pgrst, 'reload schema';
