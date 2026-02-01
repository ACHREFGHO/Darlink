
-- Function to check if a specific room has availability for a date range
create or replace function public.check_room_availability(
  p_room_id uuid,
  p_start_date date,
  p_end_date date
) returns boolean as $$
declare
  v_units_count int;
  v_bookings_count int;
begin
  -- Get total units for this room type (default to 1 if not set)
  select coalesce(units_count, 1) into v_units_count 
  from rooms 
  where id = p_room_id;
  
  -- Count existing overlapping bookings that are not cancelled
  -- We check for overlap: (StartA <= EndB) and (EndA >= StartB)
  -- But usually hotel logic is: Booking Start < User End AND Booking End > User Start
  select count(*) into v_bookings_count 
  from bookings 
  where room_id = p_room_id
  and status in ('pending', 'confirmed') -- Pending requests also block calendars to prevent double booking attempts
  and start_date < p_end_date 
  and end_date > p_start_date;
  
  -- Return true if we have space (bookings < units)
  return v_bookings_count < v_units_count;
end;
$$ language plpgsql security definer;

-- Function to get all booked dates for a room (to disable in calendar)
-- Returns simple list of ranges, frontend can expand
create or replace function public.get_room_bookings(
    p_room_id uuid
) returns table (
    start_date date,
    end_date date
) as $$
begin
    return query
    select b.start_date, b.end_date
    from bookings b
    where b.room_id = p_room_id
    and b.status in ('pending', 'confirmed')
    and b.end_date >= current_date; -- Only future/current bookings
end;
$$ language plpgsql security definer;
