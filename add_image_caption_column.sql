
-- Add caption column to property_images to support "photo name" parameter
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'property_images' and column_name = 'caption') then
        alter table public.property_images add column caption text;
    end if;
end $$;

-- Force refresh schema cache
notify pgrst, 'reload schema';
