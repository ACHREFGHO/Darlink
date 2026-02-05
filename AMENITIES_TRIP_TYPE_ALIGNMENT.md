# Property Amenities & Trip Type Alignment

## Overview
This document explains how property amenities (specs) are aligned with trip types across the booking request and search functionality in the DARLINK platform.

## System Architecture

### 1. **Property Specs (Amenities/Categories)**
Properties are categorized based on their suitability for different types of trips. These are stored in the `property_specs` table.

**Available Categories:**
- **Family** 👨‍👩‍👧‍👦 - Safe, spacious, and kid-friendly
- **Friends** 🎉 - Perfect for group trips and fun
- **Company** 💼 - Work-ready with WiFi and desks
- **Romantic** 💕 - Cozy, private, and beautiful views

**Database Schema:**
```sql
create type spec_category as enum ('Family', 'Friends', 'Company', 'Romantic');

create table public.property_specs (
  id uuid primary key,
  property_id uuid references properties(id),
  category spec_category not null,
  unique(property_id, category)
);
```

**Where it's used:**
- Property creation wizard (Step 3)
- Property editing
- Search filtering

### 2. **Trip Purpose (Booking Intent)**
When guests book a property, they specify the purpose of their trip. This is stored in the `bookings` table.

**Available Options:**
- **Family** 👨‍👩‍👧‍👦 - Family vacation
- **Friends** 🎉 - Friends getaway
- **Company** 💼 - Business/Work trip
- **Romantic** 💕 - Romantic stay
- **Other** ✈️ - Other purpose

**Database Schema:**
```sql
alter table public.bookings 
add column if not exists trip_purpose text;
```

**Where it's used:**
- Booking creation form
- Booking confirmation dialog
- Guest trip history

### 3. **Search Trip Type**
Users can filter properties based on their trip type when searching.

**Available Filters:**
- **Family** 👨‍👩‍👧‍👦
- **Friends** 🎉
- **Company** 💼
- **Romantic** 💕

**How it works:**
```typescript
// In app/page.tsx
if (category) {
  query = query.eq('property_specs.category', category)
}
```

## Alignment & Consistency

### Visual Consistency
All three systems now use the same icons and emojis:

| Category | Icon | Emoji | Description |
|----------|------|-------|-------------|
| Family | Users | 👨‍👩‍👧‍👦 | Family-friendly properties |
| Friends | PartyPopper | 🎉 | Group-friendly properties |
| Company | Briefcase | 💼 | Business-ready properties |
| Romantic | Heart | 💕 | Romantic getaways |

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    PROPERTY OWNER                            │
│                                                              │
│  1. Creates Property                                         │
│  2. Selects Amenities/Categories (property_specs)           │
│     ✓ Family, Friends, Company, Romantic                    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    SEARCH & DISCOVERY                        │
│                                                              │
│  1. User searches with filters                              │
│  2. Selects Trip Type (category)                            │
│     ✓ Family, Friends, Company, Romantic                    │
│  3. System filters properties by property_specs.category    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    BOOKING REQUEST                           │
│                                                              │
│  1. Guest selects dates and room                            │
│  2. Chooses Trip Purpose                                    │
│     ✓ Family, Friends, Company, Romantic, Other             │
│  3. Submits booking request                                 │
│  4. trip_purpose saved to bookings table                    │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                OWNER REVIEWS REQUEST                         │
│                                                              │
│  1. Owner sees booking request                              │
│  2. Views guest profile details                             │
│  3. Sees trip_purpose in confirmation dialog                │
│     "💕 Romantic stay" or "👨‍👩‍👧‍👦 Family vacation"          │
│  4. Makes informed decision                                 │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Details

### 1. Property Specs Selection
**File:** `components/properties/step-3-specs.tsx`

```tsx
const CATEGORIES = [
  { id: 'Family', label: 'Family', icon: Users, description: 'Safe, spacious, and kid-friendly.' },
  { id: 'Friends', label: 'Friends', icon: PartyPopper, description: 'Perfect for group trips and fun.' },
  { id: 'Company', label: 'Company', icon: Briefcase, description: 'Work-ready with WiFi and desks.' },
  { id: 'Romantic', label: 'Romantic', icon: Heart, description: 'Cozy, private, and beautiful views.' }
]
```

### 2. Search Trip Type Filter
**File:** `components/site/search-bar.tsx`

```tsx
const tripTypes = [
  { id: 'Family', icon: Users, emoji: '👨‍👩‍👧‍👦' },
  { id: 'Friends', icon: PartyPopper, emoji: '🎉' },
  { id: 'Company', icon: Briefcase, emoji: '💼' },
  { id: 'Romantic', icon: Heart, emoji: '💕' }
]
```

### 3. Booking Trip Purpose
**File:** `components/booking/booking-section.tsx`

```tsx
<SelectContent>
  <SelectItem value="Family">👨‍👩‍👧‍👦 Family Trip</SelectItem>
  <SelectItem value="Friends">🎉 Friends Getaway</SelectItem>
  <SelectItem value="Company">💼 Business/Work</SelectItem>
  <SelectItem value="Romantic">💕 Romantic Stay</SelectItem>
  <SelectItem value="Other">✈️ Other</SelectItem>
</SelectContent>
```

### 4. Confirmation Dialog Display
**File:** `components/owner/booking-confirmation-dialog.tsx`

```tsx
{booking?.trip_purpose && (
  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 md:col-span-2">
    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Trip Purpose</p>
    <div className="flex items-center gap-2">
      <Badge className="bg-[#F17720]/10 text-[#F17720] hover:bg-[#F17720]/20 font-bold">
        {booking.trip_purpose}
      </Badge>
      <span className="text-sm text-gray-600">
        {booking.trip_purpose === 'Family' && '👨‍👩‍👧‍👦 Family vacation'}
        {booking.trip_purpose === 'Friends' && '🎉 Friends getaway'}
        {booking.trip_purpose === 'Company' && '💼 Business/Work trip'}
        {booking.trip_purpose === 'Romantic' && '💕 Romantic stay'}
        {booking.trip_purpose === 'Other' && '✈️ Other purpose'}
      </span>
    </div>
  </div>
)}
```

## Benefits of This Alignment

### 1. **Consistent User Experience**
- Same terminology across all touchpoints
- Matching icons and emojis throughout the platform
- Clear visual language

### 2. **Better Matching**
- Guests can search for properties that match their trip type
- Properties are categorized based on their actual amenities
- Owners see what type of trip the guest is planning

### 3. **Informed Decisions**
- Owners can see if the property matches the guest's needs
- Example: A "Romantic" property owner can prioritize "Romantic" trip bookings
- Helps prevent mismatched expectations

### 4. **Data Insights**
- Track which trip types are most popular
- Understand property utilization by category
- Optimize property listings based on demand

## Future Enhancements

### Potential Improvements:
1. **Smart Matching Score**
   - Calculate compatibility between property specs and trip purpose
   - Show match percentage to owners
   - Prioritize well-matched bookings

2. **Analytics Dashboard**
   - Show property owners which trip types book most
   - Suggest adding amenities to attract specific trip types
   - Track conversion rates by category

3. **Auto-Recommendations**
   - Suggest properties based on trip purpose
   - "This property is perfect for Family trips!"
   - Highlight matching amenities

4. **Multiple Categories**
   - Allow properties to have multiple specs
   - Weight them by importance
   - More nuanced matching

## Testing Checklist

- [ ] Property specs save correctly
- [ ] Search filters by category work
- [ ] Trip purpose saves with booking
- [ ] Confirmation dialog shows trip purpose
- [ ] Icons display consistently
- [ ] Emojis render properly
- [ ] Mobile responsive design
- [ ] Translations work (if applicable)
- [ ] Database constraints enforced
- [ ] RLS policies allow proper access

## Related Files

### Components
- `components/properties/step-3-specs.tsx` - Property amenities selection
- `components/site/search-bar.tsx` - Search with trip type filter
- `components/booking/booking-section.tsx` - Booking with trip purpose
- `components/owner/booking-confirmation-dialog.tsx` - Display trip purpose

### Database
- `supabase_schema.sql` - property_specs table definition
- `add_trip_purpose.sql` - bookings.trip_purpose column

### Pages
- `app/page.tsx` - Search filtering logic
- `app/bookings/page.tsx` - Display trip purpose in bookings
- `app/owner/bookings/page.tsx` - Owner booking management
