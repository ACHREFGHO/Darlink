-- 1. Drop the existing broad policy
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;

-- 2. Create a much stricter policy
-- This ensures that only users with an 'accepted' (confirmed) booking can leave a review.
-- It also links the review to the specific booking that was successful.
CREATE POLICY "Users can insert reviews only for confirmed bookings" 
ON public.reviews FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.bookings
    WHERE id = reviews.booking_id
    AND user_id = auth.uid()
    AND status = 'confirmed'
  )
);

-- OPTIONAL: Prevent multiple reviews for the same booking
ALTER TABLE public.reviews ADD CONSTRAINT unique_booking_review UNIQUE (booking_id);
