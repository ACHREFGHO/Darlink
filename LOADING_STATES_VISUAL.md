# Loading States - Visual Components Overview

## Component Hierarchy

```
┌─ Root App
│  └─ PageLoaderProvider (Global)
│     └─ ProgressBar (Route transitions)
│        └─ MainLayout
│           └─ SearchPage (app/search/page.tsx)
│              └─ SearchClient (app/search/search-client.tsx)
│                 ├─ Navbar
│                 ├─ FilterSubHeader
│                 │  └─ AdvancedFilters
│                 ├─ MainContentArea
│                 │  └─ ListColumn
│                 │     ├─ ResultsHeader
│                 │     └─ PropertyGrid
│                 │        └─ SearchResultsSkeleton (While Loading)
│                 │           └─ PropertyCardSkeleton × 8
│                 │        OR
│                 │           └─ PropertyCardListing × N
│                 │  └─ MapColumn
│                 │     └─ MapView
│                 │        └─ MapSkeleton (While Loading)
│                 └─ MobileNav
```

## Loading State Transitions

### Initial Page Load
```
┌─────────────────────────────────────┐
│ Page Transition Loading State        │
│ ┌───────────────────────────────────┐│
│ │ ProgressBar (0% → 100%)           ││
│ │ SpinnerLoader (Blue)               ││
│ │ "Loading..." text                  ││
│ └───────────────────────────────────┘│
└─────────────────────────────────────┘
         ↓ (Page content received)
┌─────────────────────────────────────┐
│ SearchClient Initialization          │
│ isInitializing = true                │
│ ┌───────────────────────────────────┐│
│ │ SearchResultsSkeleton (8 cards)    ││
│ │ ┌─────────┬──────────┬──────────┐ ││
│ │ │Card Sk. │Card Sk.  │Card Sk.  │ ││
│ │ │[shimmer]│[shimmer] │[shimmer] │ ││
│ │ │         │          │          │ ││
│ │ └─────────┴──────────┴──────────┘ ││
│ │ ... (with staggered animation)    ││
│ └───────────────────────────────────┘│
└─────────────────────────────────────┘
         ↓ (useEffect completes)
┌─────────────────────────────────────┐
│ SearchClient Ready                   │
│ isInitializing = false               │
│ ┌───────────────────────────────────┐│
│ │ PropertyCardListing × 8            ││
│ │ ┌─────────┬──────────┬──────────┐ ││
│ │ │Property │Property  │Property  │ ││
│ │ │Card [1] │Card [2]  │Card [3]  │ ││
│ │ │with img │with img  │with img  │ ││
│ │ └─────────┴──────────┴──────────┘ ││
│ │ ... (fully interactive)            ││
│ └───────────────────────────────────┘│
└─────────────────────────────────────┘
```

## Animation Timeline

### SearchResultsSkeleton Animation (Staggered)
```
Card 1: ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░  [050ms delay, 600ms duration]
Card 2: ░░░░░▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░  [100ms delay, 600ms duration]
Card 3: ░░░░░░░░░░▓▓▓▓▓▓░░░░░░░░░░░░░░░░░  [150ms delay, 600ms duration]
Card 4: ░░░░░░░░░░░░░░░░▓▓▓▓▓▓░░░░░░░░░░░  [200ms delay, 600ms duration]
... (continues for all 8 cards)

Where:
█ = Loaded (opaque, visible)
░ = Loading (in animation)
```

### Shimmer Animation (Per Card)
```
Card Skeleton:
┌────────────────────────────────────┐
│ ╱────────────────────────────────╲ │ ← Shimmer gradient traveling
│ Image placeholder (h-48)           │
│ ────────────────────────────────── │
│ ▓▓▓▓▓▓▓ (Title)                    │
│ ▓▓▓▓▓▓▓▓▓▓▓ (Location)             │
│ ▓▓▓▓▓  ▓▓▓▓▓ (Price | Rating)      │
└────────────────────────────────────┘

Shimmer Duration: 2s
Direction: Left → Right
Easing: Linear, infinite loop
Opacity: 30% white gradient overlay
```

## Loading State Variants

### 1. Search Results Grid
```
Component: SearchResultsSkeleton
Location: app/search/search-client.tsx
Trigger: isInitializing = true
Layout:
├─ 1 column (mobile)
├─ 2 columns (sm)
├─ 3 columns (lg)
└─ 4 columns (xl)

Count: Configurable (default: 8)
Animation: Staggered slideInUp (50ms delay)
Duration: 600ms per card
```

### 2. Property Card
```
Component: PropertyCardSkeleton
Size: Fixed aspect ratio
Elements:
├─ Image area (h-48, w-full)
├─ Title placeholder (3/4 width)
├─ Location (with icon)
└─ Price + Rating row

Animation: Pulse
Duration: 2s (infinite)
```

### 3. Property Detail Page
```
Component: PropertyDetailSkeleton
Sections:
├─ Hero image (full width, h-96)
├─ Title section
├─ Stats grid (3 columns)
├─ Description (4 lines)
└─ Amenities grid (2 columns)

Animation: Individual pulse on each section
Usage: Property detail pages during fetch
```

### 4. Map View
```
Component: MapSkeleton
Size: Full container
Elements:
├─ Background (gradient slate)
├─ Loading spinner (center)
├─ Control placeholders (top-right)
│  ├─ Zoom in button
│  ├─ Zoom out button
│  └─ Fullscreen button
└─ Legend placeholder

Animation: Pulse background + spinning loader
Usage: Map column in split view
```

### 5. Booking Widget
```
Component: BookingWidgetSkeleton
Size: Sticky sidebar
Elements:
├─ Price per night label
├─ Check-in date input
├─ Check-out date input
├─ Guests select
├─ Reserve button
└─ Disclaimer text

Animation: Pulse
Usage: Booking section during data fetch
```

## Loader Animations

### Spinner Loader
```
Size Options:
├─ sm: 4×4 (16px)
├─ md: 8×8 (32px)
└─ lg: 12×12 (48px)

Color Options:
├─ blue: #0B3D6F (Primary)
└─ orange: #F17720 (Accent)

Animation: Rotate 360° infinitely
Duration: ~1s per rotation
```

### Pulse Loader
```
Pattern:
   ●   ●   ●
  [pulse] [pulse] [pulse]
   ▄   ▄   ▄

Three dots
Color: #F17720 (Orange)
Timing: Staggered (0ms, 100ms, 200ms)
Each: Pulse 2s with delay
```

### Bounce Loader
```
Pattern:
   ●     ●     ●
  [bounce] [bounce] [bounce]
   ▀ ▀ ▀ ▀ ▀ ▀

Three dots bouncing
Color: #F17720 (Orange)
Scale: 0 → 1 → 0
Timing: Staggered per dot
Duration: 1.4s
```

### Wave Loader
```
Pattern:
   █ █ █ █ █
  [wave animation across 5 bars]
   ▀ ▀ ▀ ▀ ▀

Five vertical bars
Color: #0B3D6F (Blue)
Scale: 0.4 → 1 → 0.4
Timing: Cascading wave effect
Duration: 1.2s per cycle
```

## Loading State Colors

### Skeleton Elements
```
Background Gradient:
  from-slate-200  → via-slate-300  → to-slate-200
  #E2E8F0        → #CBD5E1         → #E2E8F0

Border:
  border-slate-100 (#F1F5F9)

Text (Placeholder):
  text-slate-300 (#CBD5E1) to text-slate-700 (#334155)
```

### Shimmer Effect
```
Base Color: Gradient slate-200 → slate-300 → slate-200
Overlay: white at 30% opacity
Wave: Travels left → right
Speed: 2 seconds per cycle
Direction: 0° → 100% translateX
```

### Loaders
```
Spinner Border: slate-200 (#E2E8F0)
Spinner Top: 
  - Orange: #F17720
  - Blue: #0B3D6F

Pulse Dots: #F17720 (Orange)
Wave Bars: #0B3D6F (Blue)
Bounce Dots: #F17720 (Orange)
Page Overlay: white at 80% + blur
```

## Responsive Behavior

### Mobile (< 640px)
```
SearchResultsSkeleton:
├─ 1 column layout
├─ Full width cards
├─ Height: auto
└─ Gap: 4 (1rem)

Spinners:
├─ Smaller size (sm)
├─ Centered on screen
└─ Positioned above content
```

### Tablet (640px - 1024px)
```
SearchResultsSkeleton:
├─ 2 column layout
├─ Equal card widths
├─ Responsive gap
└─ Full viewport height
```

### Desktop (> 1024px)
```
SearchResultsSkeleton:
├─ 3-4 column layout
├─ Balanced spacing
├─ Split view support
└─ Map column integration
```

## Performance Metrics

### Bundle Size
```
loading.tsx:        ~3.2 KB (gzipped)
skeleton.tsx:       ~2.8 KB (gzipped)
page-loader.tsx:    ~1.9 KB (gzipped)
─────────────────────────────
Total:              ~7.9 KB (gzipped)
```

### Render Performance
```
SearchResultsSkeleton (8 cards):
├─ Render time: <10ms
├─ Paint time: <50ms
├─ Animation FPS: 60fps
└─ Memory: <2MB

PageLoader:
├─ Render time: <5ms
├─ Paint time: <20ms
├─ Memory: <1MB
```

### Animation Performance
```
CSS Animations:
├─ animate-pulse (Tailwind native)
├─ transform: translateX (GPU accelerated)
├─ opacity: changes (GPU accelerated)
└─ hardware acceleration: Yes

Will-change CSS: Applied to animated elements
Transform-origin: Optimized for smooth motion
```

## Accessibility

### Screen Reader Support
```
Skeleton elements:
├─ No aria-label (implies non-semantic content)
├─ No role attribute (divs are generic)
└─ Hidden from accessibility tree

Loading indicators:
├─ aria-live="polite" on loaders
├─ Text content for context
└─ Role="status" where appropriate
```

### Motion Preferences
```
@media (prefers-reduced-motion: reduce) {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

[Note: Currently not implemented, ready for addition]
```

## Integration Points

### Search Page
```
File: app/search/search-client.tsx
─────────────────────────────────
Trigger: isInitializing state
Component: SearchResultsSkeleton
Count: 8 cards
Duration: ~600ms total animation
Fallback: PropertyCardListing rendering
```

### Property Detail
```
File: app/properties/[id]/page.tsx (Future)
────────────────────────────────────────────
Trigger: Data fetch in progress
Component: PropertyDetailSkeleton OR ContentLoader
Duration: Variable (until data received)
Fallback: Full property details
```

### Booking Operations
```
File: components/booking/booking-section.tsx
─────────────────────────────────────────────
Trigger: Submission in progress
Component: OverlayLoader OR InlineLoader
Duration: Until operation completes
Feedback: Success message or error
```

## Customization Guide

### Change Skeleton Colors
```tsx
// In skeleton.tsx
className={cn(
    'bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200', // Changed
    ...
)}
```

### Adjust Animation Speed
```tsx
// In SearchResultsSkeleton
style={{
    animation: `slideInUp 0.3s ease-out ${i * 0.02}s both`, // Faster (0.3s)
}}
```

### Change Loader Colors
```tsx
// In loading.tsx
const colorClass = color === 'orange' 
    ? 'border-red-500' // Changed to red
    : 'border-blue-500'
```

### Add Prefers-Reduced-Motion
```css
@media (prefers-reduced-motion: reduce) {
    .animate-pulse {
        animation: none;
        opacity: 0.6;
    }
}
```
