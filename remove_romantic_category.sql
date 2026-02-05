-- Remove 'Romantic' from spec_category enum
-- This requires recreating the enum type

-- Step 1: Add a temporary column with text type
ALTER TABLE public.property_specs ADD COLUMN category_temp text;

-- Step 2: Copy data to temporary column
UPDATE public.property_specs SET category_temp = category::text;

-- Step 3: Drop the old column (this will also drop the constraint)
ALTER TABLE public.property_specs DROP COLUMN category;

-- Step 4: Drop the old enum type
DROP TYPE IF EXISTS spec_category;

-- Step 5: Create new enum type without 'Romantic'
CREATE TYPE spec_category AS ENUM ('Family', 'Friends', 'Company');

-- Step 6: Add the column back with the new enum type
ALTER TABLE public.property_specs ADD COLUMN category spec_category;

-- Step 7: Copy data back (excluding 'Romantic' entries)
UPDATE public.property_specs 
SET category = category_temp::spec_category 
WHERE category_temp IN ('Family', 'Friends', 'Company');

-- Step 8: Delete any 'Romantic' entries
DELETE FROM public.property_specs WHERE category_temp = 'Romantic';

-- Step 9: Make the column NOT NULL
ALTER TABLE public.property_specs ALTER COLUMN category SET NOT NULL;

-- Step 10: Drop the temporary column
ALTER TABLE public.property_specs DROP COLUMN category_temp;

-- Step 11: Recreate the unique constraint
ALTER TABLE public.property_specs ADD CONSTRAINT property_specs_property_id_category_key UNIQUE (property_id, category);
