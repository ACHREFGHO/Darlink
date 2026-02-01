---
artifact_type: implementation_plan
artifact_name: DARLINK Multi-User Marketplace Implementation Plan
---

# DARLINK - Multi-User Vacation Rental Marketplace
## Implementation Plan v1.0

### Project Overview
Build a professional vacation rental marketplace for Tunisia with multi-user roles, property listings, and an admin approval workflow.

---

## Phase 1: Project Foundation & Setup

### 1.1 Next.js Project Initialization
**Goal**: Set up a modern Next.js 14+ project with App Router

**Tasks**:
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS with DARLINK color palette
- [ ] Install shadcn/ui components
- [ ] Set up project folder structure

**Commands**:
```bash
npx create-next-app@latest darlink --typescript --tailwind --app --src-dir
cd darlink
npx shadcn-ui@latest init
```

**Color Configuration** (`tailwind.config.ts`):
```typescript
colors: {
  darlink: {
    blue: '#0B3D6F',
    orange: '#F17720',
  }
}
```

---

### 1.2 Install Core Dependencies
**Goal**: Add all necessary packages for Supabase, authentication, and UI

**Tasks**:
- [ ] Install Supabase client
- [ ] Install form handling libraries
- [ ] Install date/calendar libraries
- [ ] Install UI enhancement libraries

**Commands**:
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install react-hook-form zod @hookform/resolvers
npm install date-fns react-day-picker
npm install clsx tailwind-merge class-variance-authority
```

---

## Phase 2: Database Schema & Supabase Setup

### 2.1 Supabase Project Configuration
**Goal**: Create and configure Supabase project

**Tasks**:
- [ ] Create Supabase project at supabase.com
- [ ] Copy project URL and anon key
- [ ] Create `.env.local` file with credentials
- [ ] Configure Google OAuth provider in Supabase Auth settings

**Environment Variables**:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

### 2.2 Database Migration: Core Tables
**Goal**: Create the foundational database schema with RLS policies

**File**: `supabase/migrations/001_initial_schema.sql`

**Tables to Create**:

#### 2.2.1 Profiles Table
```sql
CREATE TYPE user_role AS ENUM ('client', 'house_owner', 'admin');

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'client' NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2.2.2 Properties Table
```sql
CREATE TYPE property_type AS ENUM ('House', 'Apartment', 'Guesthouse');
CREATE TYPE property_status AS ENUM ('Pending', 'Published', 'Rejected');

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type property_type NOT NULL,
  status property_status DEFAULT 'Pending' NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  governorate TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  main_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2.2.3 Rooms Table
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_per_night DECIMAL(10, 2) NOT NULL,
  beds INTEGER NOT NULL,
  max_guests INTEGER NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2.2.4 Property Specs (Tags) Table
```sql
CREATE TYPE spec_category AS ENUM ('Family', 'Friends', 'Company', 'Romantic');

CREATE TABLE property_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  category spec_category NOT NULL,
  UNIQUE(property_id, category)
);
```

#### 2.2.5 Property Images Table
```sql
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2.3 Row Level Security (RLS) Policies
**Goal**: Implement secure data access rules

**Key Policies**:

```sql
-- Profiles: Users can read all, update own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Properties: Published visible to all, owners manage own
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published properties are viewable by everyone"
  ON properties FOR SELECT USING (status = 'Published' OR owner_id = auth.uid());

CREATE POLICY "Owners can insert their own properties"
  ON properties FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their own properties"
  ON properties FOR UPDATE USING (owner_id = auth.uid());

-- Admins can see and update all properties (implement via service role or admin check)

-- Rooms: Visible based on property visibility
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rooms visible if property is published or owned"
  ON rooms FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE id = rooms.property_id 
      AND (status = 'Published' OR owner_id = auth.uid())
    )
  );

-- Similar policies for property_specs and property_images
```

---

## Phase 3: Authentication & User Management

### 3.1 Authentication Provider Setup
**Goal**: Implement Google OAuth signup/login

**Tasks**:
- [ ] Create `src/lib/supabase/client.ts` - browser client
- [ ] Create `src/lib/supabase/server.ts` - server client
- [ ] Build login page (`/login`)
- [ ] Build signup page (`/signup`) 
- [ ] Create auth callback route (`/auth/callback`)

**Key Files**:
- `src/app/login/page.tsx` - Login UI with Google OAuth
- `src/app/auth/callback/route.ts` - Handle OAuth redirect
- `src/middleware.ts` - Protect routes based on role

---

### 3.2 Role-Based Access Control
**Goal**: Redirect users based on their role after login

**Logic**:
- **Client** → `/` (Home page with search)
- **House Owner** → `/owner/dashboard`
- **Admin** → `/admin/dashboard`

**Middleware Check**:
```typescript
// Check user role and redirect accordingly
if (role === 'admin' && !path.startsWith('/admin')) {
  return NextResponse.redirect(new URL('/admin', request.url))
}
```

---

### 3.3 Profile Completion Flow
**Goal**: Create profiles table entry after Google signup

**Tasks**:
- [ ] Create database trigger to auto-create profile on auth.users insert
- [ ] Build profile completion form for new users
- [ ] Implement role selection (Client vs Owner request)

**Database Trigger**:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Phase 4: House Owner Features

### 4.1 Owner Dashboard
**Goal**: Central hub for owners to manage their properties

**Page**: `/owner/dashboard`

**Components**:
- [ ] Property list with status badges (Pending/Published/Rejected)
- [ ] "Add New Property" button → wizard
- [ ] Edit/Delete actions for each property
- [ ] Analytics cards (total properties, total rooms, bookings)

**UI Design**:
- Sidebar navigation with Lucide icons
- Status badges using DARLINK blue/orange
- Cards with shadcn/ui components

---

### 4.2 House Creation Wizard (3 Steps)
**Goal**: Multi-step form to create a new property

**Page**: `/owner/properties/new`

**Step 1: Property Information**
- [ ] Title, Description
- [ ] Type (House, Apartment, Guesthouse)
- [ ] Address, City, Governorate
- [ ] Main Image Upload
- [ ] Additional Images Upload (gallery)

**Step 2: Rooms Configuration**
- [ ] Dynamic form to add multiple rooms
- [ ] Each room: Name, Description, Price per Night, Beds, Max Guests
- [ ] Ability to add/remove rooms

**Step 3: Categories (Specs)**
- [ ] Checkboxes for: Family, Friends, Company, Romantic
- [ ] Must select at least one category
- [ ] Visual card selection with icons

**Form Handling**:
```typescript
// Use react-hook-form with zod validation
const schema = z.object({
  title: z.string().min(10),
  type: z.enum(['House', 'Apartment', 'Guesthouse']),
  rooms: z.array(z.object({
    name: z.string(),
    price_per_night: z.number().positive(),
    beds: z.number().int().positive()
  })).min(1),
  specs: z.array(z.enum(['Family', 'Friends', 'Company', 'Romantic'])).min(1)
})
```

**Wizard Navigation**:
- Progress indicator (Step 1/3, 2/3, 3/3)
- "Next", "Back", "Submit" buttons
- Save as draft functionality

---

### 4.3 Property Edit & Management
**Goal**: Allow owners to update properties after creation

**Page**: `/owner/properties/[id]/edit`

**Tasks**:
- [ ] Pre-populate wizard with existing data
- [ ] Allow editing only if status is 'Pending' or 'Rejected'
- [ ] Show rejection reason if status is 'Rejected'

---

## Phase 5: Admin Features

### 5.1 Admin Dashboard
**Goal**: Central control panel for approving/rejecting properties

**Page**: `/admin/dashboard`

**Sections**:
- [ ] Pending Properties List
  - Property title, owner name, type, date submitted
  - "View Details" button
  - Quick actions: Approve ✓, Reject ✗
- [ ] Statistics Cards
  - Total properties, pending approval, approved this month
- [ ] User Management Section
  - Approve house owner accounts (if `is_approved` is false)
  - View all users with role filters

---

### 5.2 Property Review Interface
**Goal**: Detailed view for admins to review properties

**Page**: `/admin/properties/[id]`

**Features**:
- [ ] Full property details display
- [ ] Image gallery
- [ ] Rooms list with pricing
- [ ] Approve button → Sets status to 'Published'
- [ ] Reject button → Modal to enter rejection reason, sets status to 'Rejected'
- [ ] Contact owner button

---

### 5.3 Owner Approval System
**Goal**: Approve house owners before they can list properties

**Logic**:
- New users requesting "House Owner" role have `is_approved = false`
- Admin sees list of pending owner approvals
- Admin approves → `is_approved = true`, owner can now create properties
- RLS policy: Properties can only be inserted if owner `is_approved = true`

**UI**:
- `/admin/owners/pending` page
- Owner name, email, join date, "Approve" button

---

## Phase 6: Client (Guest) Features

### 6.1 Home Page with Spec Filters
**Goal**: Allow clients to discover properties by category

**Page**: `/` (Home)

**Hero Section**:
- [ ] Large header with DARLINK branding
- [ ] Tagline: "Find Your Perfect Stay in Tunisia"
- [ ] Search bar (location, dates, guests)

**Spec Filter Section**:
- [ ] Four large cards: Family, Friends, Company, Romantic
- [ ] Each card has icon, title, description
- [ ] Click card → Navigate to `/search?spec=Family`

**Featured Properties**:
- [ ] Grid of 6-8 published properties
- [ ] Property card: Image, title, location, price from, badges

---

### 6.2 Search Results Page
**Goal**: Display filtered properties based on search criteria

**Page**: `/search`

**Filters**:
- [ ] Spec category (from URL param or sidebar)
- [ ] Location (governorate)
- [ ] Price range
- [ ] Property type
- [ ] Number of guests

**Results Grid**:
- [ ] Property cards with hover effects
- [ ] Pagination or infinite scroll
- [ ] Empty state if no results

---

### 6.3 Property Detail Page
**Goal**: Show full property information for booking

**Page**: `/properties/[id]`

**Sections**:
- [ ] Image gallery (main + thumbnails)
- [ ] Property title, location, type, specs badges
- [ ] Description
- [ ] Rooms list with availability and booking buttons
- [ ] Map with location pin
- [ ] Owner contact information
- [ ] Book Now CTA

---

## Phase 7: UI/UX Implementation

### 7.1 Design System Setup
**Goal**: Consistent "Tech Startup" aesthetic with DARLINK colors

**Tasks**:
- [ ] Configure shadcn/ui theme with custom colors
- [ ] Create reusable component library
  - Button variants (primary: orange, secondary: blue)
  - Card with hover effects
  - Badge component (status, specs)
  - Input fields with validation states
- [ ] Typography scale using Inter or Outfit font
- [ ] Spacing and layout tokens

**Tailwind Config**:
```typescript
theme: {
  extend: {
    colors: {
      primary: '#F17720', // Orange
      secondary: '#0B3D6F', // Blue
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    }
  }
}
```

---

### 7.2 shadcn/ui Components Installation
**Goal**: Install necessary UI primitives

**Components to Add**:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tabs
```

---

### 7.3 Layout & Navigation
**Goal**: Consistent header/footer across all pages

**Header** (`/src/components/layout/header.tsx`):
- [ ] DARLINK logo (links to `/`)
- [ ] Navigation links (role-dependent)
  - Client: Home, Search, My Bookings
  - Owner: Dashboard, My Properties, Add Property
  - Admin: Dashboard, Pending Properties, Users
- [ ] User menu (avatar, logout)

**Footer**:
- [ ] Links: About, Contact, Terms, Privacy
- [ ] Social media icons
- [ ] Copyright notice

---

## Phase 8: Additional Features & Polish

### 8.1 Image Upload to Supabase Storage
**Goal**: Allow property image uploads

**Tasks**:
- [ ] Create `property-images` bucket in Supabase Storage
- [ ] Implement upload component with drag-and-drop
- [ ] Image preview before upload
- [ ] Resize/optimize images on client side
- [ ] Store URLs in `property_images` table

---

### 8.2 Form Validation & Error Handling
**Goal**: Robust validation and user feedback

**Tasks**:
- [ ] Zod schemas for all forms
- [ ] Real-time validation feedback
- [ ] Toast notifications for success/error
- [ ] Loading states for async actions

---

### 8.3 Responsive Design
**Goal**: Mobile-first, works on all devices

**Breakpoints**:
- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

**Tasks**:
- [ ] Test wizard on mobile (vertical steps)
- [ ] Responsive property grid (1 col mobile, 2 tablet, 3 desktop)
- [ ] Mobile navigation (hamburger menu)

---

## Phase 9: Testing & Deployment

### 9.1 Manual Testing Checklist
- [ ] User can sign up with Google and profile is created
- [ ] Client can browse properties and filter by specs
- [ ] Owner can create property with multiple rooms
- [ ] Property goes to "Pending" status after creation
- [ ] Admin can approve/reject properties
- [ ] Approved properties appear on home page
- [ ] Owner can edit rejected properties
- [ ] RLS policies prevent unauthorized access

---

### 9.2 Deployment Preparation
**Platform**: Vercel (recommended for Next.js)

**Tasks**:
- [ ] Create Vercel project
- [ ] Set environment variables in Vercel dashboard
- [ ] Configure custom domain (optional)
- [ ] Set up Supabase production environment
- [ ] Run migrations on production database

---

## Implementation Order

### Sprint 1 (Foundation)
1. Initialize Next.js project ✓
2. Install dependencies ✓
3. Create Supabase project ✓
4. Run database migrations ✓
5. Set up authentication ✓

### Sprint 2 (Owner Flow)
1. Build owner dashboard ✓
2. Create house creation wizard (Steps 1-3) ✓
3. Implement image upload ✓
4. Test property creation flow ✓

### Sprint 3 (Admin Flow)
1. Build admin dashboard ✓
2. Create property approval interface ✓
3. Implement owner approval system ✓
4. Test approval workflow ✓

### Sprint 4 (Client Flow)
1. Build home page with spec filters ✓
2. Create search results page ✓
3. Build property detail page ✓
4. Test client browsing experience ✓

### Sprint 5 (Polish)
1. Refine UI/UX across all pages ✓
2. Implement responsive design ✓
3. Add loading states and error handling ✓
4. Final testing and deployment ✓

---

## Key Technical Decisions

### Why Next.js App Router?
- Server Components for better performance
- Built-in API routes for backend logic
- Excellent SEO for property listings

### Why Supabase?
- PostgreSQL with built-in Row Level Security
- Google OAuth integration
- Real-time subscriptions (future booking feature)
- File storage for images

### Why shadcn/ui?
- Customizable, not a black box
- Accessible components out of the box
- Works perfectly with Tailwind
- Copy-paste components = full control

---

## Success Criteria

✅ **Users can sign up** with Google and are assigned the "Client" role by default  
✅ **Owners can list properties** with multiple rooms and categories  
✅ **Admins can approve/reject** properties before they go live  
✅ **Clients can filter** properties by spec categories (Family, Friends, etc.)  
✅ **UI is professional** with DARLINK branding (#0B3D6F, #F17720)  
✅ **Data is secure** with proper RLS policies  

---

## Next Steps

**Once you approve this plan**, I will:

1. **Use the Terminal** to:
   - Initialize the Next.js project
   - Install all dependencies
   - Create the folder structure
   - Set up Supabase configuration

2. **Use the Browser Agent** to:
   - Verify the Owner Dashboard layout
   - Test the House Creation Wizard flow
   - Review the Admin approval interface
   - Validate responsive design on different screen sizes

**Your approval needed to proceed!** 🚀

---

*Last updated: 2026-01-16*
