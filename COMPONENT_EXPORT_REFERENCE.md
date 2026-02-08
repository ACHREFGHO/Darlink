# Loading States Components - Export Reference

## Quick Import Guide

### Skeleton Components
```tsx
import {
    // Base component
    Skeleton,

    // Property components
    PropertyCardSkeleton,
    PropertyListSkeleton,
    PropertyDetailSkeleton,

    // Search components
    SearchFiltersSkeleton,
    SearchResultsSkeleton,

    // Feature components
    MapSkeleton,
    BookingWidgetSkeleton,

    // Utility components
    SkeletonList,
    SkeletonColumns
} from '@/components/ui/skeleton'
```

### Loading Components
```tsx
import {
    // Animations
    ShimmerLoading,
    PulseLoader,
    SpinnerLoader,
    BounceLoader,
    WaveLoader,

    // Full-page loaders
    PageLoader,
    LoadingCard,

    // Complex loading states
    SearchLoadingState,
    PropertyDetailLoadingState,

    // Inline loaders
    InlineLoader,
    ShimmerSkeleton
} from '@/components/ui/loading'
```

### Page Loader Components
```tsx
import {
    // Provider
    PageLoaderProvider,

    // Visual indicators
    ProgressBar,

    // Content wrappers
    ContentLoader,
    OverlayLoader
} from '@/components/ui/page-loader'
```

---

## Component Descriptions & Usage

### Skeleton Components (skeleton.tsx)

#### Skeleton (Base Component)
```tsx
<Skeleton 
    className="h-12 w-full"
    variant="default" // | 'text' | 'circle' | 'rect'
    animated={true}
/>
```
**Use**: Building custom skeleton layouts
**Props**: className, variant, animated, HTML attributes

#### PropertyCardSkeleton
```tsx
<PropertyCardSkeleton />
```
**Use**: Grid card loading state
**Includes**: Image, title, location, price, rating placeholders
**Responsive**: Yes (full width)

#### PropertyListSkeleton
```tsx
<PropertyListSkeleton />
```
**Use**: List item loading state
**Includes**: Thumbnail, title, location, details
**Responsive**: Yes (horizontal layout)

#### SearchFiltersSkeleton
```tsx
<SearchFiltersSkeleton />
```
**Use**: Filter UI loading state
**Includes**: Category tabs, filter button placeholders
**Responsive**: Yes (scrollable tabs)

#### PropertyDetailSkeleton
```tsx
<PropertyDetailSkeleton />
```
**Use**: Property page loading state
**Includes**: Image, title, stats, description, amenities
**Responsive**: Yes (full page)

#### SearchResultsSkeleton
```tsx
<SearchResultsSkeleton count={8} />
```
**Use**: Grid of cards with staggered animation
**Props**: count (number of cards)
**Animation**: Staggered slideInUp (50ms delays)
**Responsive**: Grid adjusts to breakpoints

#### MapSkeleton
```tsx
<MapSkeleton />
```
**Use**: Map view loading state
**Includes**: Background, controls, spinner
**Responsive**: Full container

#### BookingWidgetSkeleton
```tsx
<BookingWidgetSkeleton />
```
**Use**: Booking form loading state
**Includes**: Price, dates, guests, button
**Responsive**: Fixed width (sidebar)

#### SkeletonList
```tsx
<SkeletonList 
    count={5}
    variant="default" // | 'card' | 'list'
/>
```
**Use**: Dynamic list with configurable count
**Variants**: card (grid) or list (vertical)
**Animation**: Staggered fade-in

#### SkeletonColumns
```tsx
<SkeletonColumns 
    columns={3}
    rows={4}
/>
```
**Use**: Multi-column grid loading
**Props**: columns, rows
**Animation**: Staggered pulse effect

---

### Loading Components (loading.tsx)

#### ShimmerLoading
```tsx
<ShimmerLoading className="h-48 w-full" />
```
**Use**: Gradient wave effect overlay
**Animation**: Horizontal sweep (2s)
**Props**: className (dimensions)

#### PulseLoader
```tsx
<PulseLoader />
```
**Use**: Discrete loading indicator
**Visual**: Three pulsing dots
**Animation**: Staggered pulse (2s)
**Color**: #F17720 (orange)

#### SpinnerLoader
```tsx
<SpinnerLoader 
    size="md" // | 'sm' | 'lg'
    color="blue" // | 'orange'
/>
```
**Use**: Primary loading indicator
**Visual**: Rotating circle
**Sizes**: sm (16px), md (32px), lg (48px)
**Colors**: blue (#0B3D6F), orange (#F17720)

#### BounceLoader
```tsx
<BounceLoader />
```
**Use**: Playful loading animation
**Visual**: Three bouncing dots
**Animation**: Bounce effect (1.4s)
**Color**: #F17720 (orange)

#### WaveLoader
```tsx
<WaveLoader />
```
**Use**: Wave motion effect
**Visual**: Five vertical bars waving
**Animation**: Wave motion (1.2s)
**Color**: #0B3D6F (blue)

#### PageLoader
```tsx
<PageLoader />
```
**Use**: Full-page overlay loader
**Includes**: Spinner + text
**Overlay**: white at 80% opacity + blur
**Responsive**: Centered on all screens

#### LoadingCard
```tsx
<LoadingCard />
```
**Use**: Loading state for individual card
**Includes**: Image, title, content placeholders
**Animation**: Shimmer effect

#### SearchLoadingState
```tsx
<SearchLoadingState />
```
**Use**: Complete search page loading UI
**Includes**: Header, progress, 8 skeleton cards
**Props**: None (fixed layout)
**Responsive**: Full width grid

#### PropertyDetailLoadingState
```tsx
<PropertyDetailLoadingState />
```
**Use**: Complete property page loading UI
**Includes**: Image, title, stats, description, amenities
**Props**: None (fixed layout)
**Responsive**: Full width layout

#### InlineLoader
```tsx
<InlineLoader text="Loading..." />
```
**Use**: Compact inline loading indicator
**Visual**: Spinner + text
**Props**: text (string)
**Responsive**: Inline element

#### ShimmerSkeleton
```tsx
<ShimmerSkeleton className="h-32 w-full" />
```
**Use**: Reusable shimmer effect
**Animation**: Gradient wave (2s)
**Props**: className (dimensions)

---

### Page Loader Components (page-loader.tsx)

#### PageLoaderProvider
```tsx
<PageLoaderProvider>
    {children}
</PageLoaderProvider>
```
**Use**: Global loading state provider
**Setup**: Wrap entire app in layout.tsx
**Features**: Route transition detection
**Props**: children (React.ReactNode)

#### ProgressBar
```tsx
<ProgressBar />
```
**Use**: Animated progress indicator
**Visual**: Gradient bar at top
**Animation**: Simulated progress (0 → 90%)
**Props**: None (auto-manages)

#### ContentLoader
```tsx
<ContentLoader
    isLoading={isLoading}
    fallback={<PropertyDetailSkeleton />}
>
    {content && <PropertyDetail content={content} />}
</ContentLoader>
```
**Use**: Wrapper for content with loading state
**Props**: 
  - isLoading (boolean)
  - fallback (React.ReactNode)
  - children (React.ReactNode)
**Animation**: Smooth fade transitions
**Mode**: Wait mode (no overlap)

#### OverlayLoader
```tsx
<OverlayLoader isVisible={isSubmitting} />
```
**Use**: Overlay for async operations
**Visual**: Dark overlay + spinner
**Props**: isVisible (boolean)
**Animation**: Fade in/out
**Dismissible**: Via isVisible prop

---

## Common Usage Patterns

### Pattern 1: Search Page (Implemented)
```tsx
import { SearchResultsSkeleton } from '@/components/ui/skeleton'

function SearchClient({ properties, isLoading }) {
    const [isInitializing, setIsInitializing] = useState(true)
    
    useEffect(() => {
        setIsInitializing(false)
    }, [])
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isInitializing ? (
                <SearchResultsSkeleton count={8} />
            ) : (
                properties.map(p => <PropertyCard key={p.id} {...p} />)
            )}
        </div>
    )
}
```

### Pattern 2: Content Loader
```tsx
import { ContentLoader } from '@/components/ui/page-loader'
import { PropertyDetailSkeleton } from '@/components/ui/skeleton'

function PropertyDetail({ propertyId }) {
    const [isLoading, setIsLoading] = useState(true)
    const [property, setProperty] = useState(null)
    
    useEffect(() => {
        fetchProperty(propertyId).then(data => {
            setProperty(data)
            setIsLoading(false)
        })
    }, [propertyId])
    
    return (
        <ContentLoader
            isLoading={isLoading}
            fallback={<PropertyDetailSkeleton />}
        >
            {property && <PropertyDetailsComponent property={property} />}
        </ContentLoader>
    )
}
```

### Pattern 3: Async Operation
```tsx
import { OverlayLoader } from '@/components/ui/page-loader'

function BookingForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const handleSubmit = async () => {
        setIsSubmitting(true)
        await submitBooking()
        setIsSubmitting(false)
    }
    
    return (
        <>
            <OverlayLoader isVisible={isSubmitting} />
            <form onSubmit={handleSubmit}>
                {/* Form fields */}
            </form>
        </>
    )
}
```

### Pattern 4: List Loading
```tsx
import { SkeletonList } from '@/components/ui/skeleton'

function PropertyList({ isLoading, count }) {
    return (
        <div className="space-y-2">
            {isLoading ? (
                <SkeletonList count={count} variant="list" />
            ) : (
                properties.map(p => <PropertyListItem key={p.id} {...p} />)
            )}
        </div>
    )
}
```

### Pattern 5: Inline Loading
```tsx
import { InlineLoader } from '@/components/ui/loading'

function FilterResults() {
    const [isFiltering, setIsFiltering] = useState(false)
    
    return (
        <div>
            {isFiltering && <InlineLoader text="Applying filters..." />}
            {/* Results */}
        </div>
    )
}
```

---

## Props Reference

### Skeleton Props
```tsx
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'text' | 'circle' | 'rect'
    animated?: boolean
    className?: string
}
```

### SpinnerLoader Props
```tsx
interface SpinnerLoaderProps {
    size?: 'sm' | 'md' | 'lg'
    color?: 'blue' | 'orange'
}
```

### InlineLoader Props
```tsx
interface InlineLoaderProps {
    text?: string
}
```

### OverlayLoader Props
```tsx
interface OverlayLoaderProps {
    isVisible?: boolean
}
```

### ContentLoader Props
```tsx
interface ContentLoaderProps {
    isLoading: boolean
    children: React.ReactNode
    fallback?: React.ReactNode
}
```

### SearchResultsSkeleton Props
```tsx
interface SearchResultsSkeletonProps {
    count?: number // Default: 8
}
```

### SkeletonList Props
```tsx
interface SkeletonListProps {
    count?: number // Default: 5
    variant?: 'card' | 'list' | 'default'
}
```

### SkeletonColumns Props
```tsx
interface SkeletonColumnsProps {
    columns?: number // Default: 3
    rows?: number // Default: 4
}
```

---

## Styling with Tailwind

All components use Tailwind CSS classes:
- **Skeleton base**: `bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200`
- **Variants**: `rounded`, `rounded-full`, `rounded-lg`
- **Animations**: `animate-pulse`, custom `@keyframes`
- **Responsive**: Built-in responsive classes (sm, md, lg, xl)

---

## Animation Details

### Pulse Animation
```css
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

### Shimmer Animation
```css
animation: shimmer 2s linear infinite;
@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
```

### slideInUp Animation (Staggered)
```css
animation: slideInUp 0.6s ease-out ${delay}s both;
@keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
```

### Wave Animation
```css
animation: wave 1.2s infinite ${offset}s;
@keyframes wave {
    0%, 100% { transform: scaleY(0.4); }
    50% { transform: scaleY(1); }
}
```

---

## Color Reference

```
Primary Blue:    #0B3D6F
Accent Orange:   #F17720
Skeleton Slate:  #E2E8F0 → #CBD5E1 → #E2E8F0
Border Slate:    #F1F5F9
Text Slate:      #CBD5E1 → #334155
```

---

## File Locations

```
components/
├── ui/
│   ├── skeleton.tsx         (10 skeleton components)
│   ├── loading.tsx          (11 loader components)
│   └── page-loader.tsx      (4 page transition components)
│
Documentation/
├── LOADING_STATES_COMPLETE.md       (Overview)
├── LOADING_STATES_IMPLEMENTATION.md (Technical)
├── LOADING_STATES_GUIDE.md          (Usage patterns)
├── LOADING_STATES_VISUAL.md         (Visual specs)
├── LOADING_STATES_TESTING.md        (Testing guide)
└── DEPLOYMENT_CHECKLIST.md          (Deployment info)
```

---

## Dependencies

- React 18+
- Next.js 13+
- Tailwind CSS 3+
- Framer Motion 10+ (for PageLoaderProvider, ContentLoader)
- Lucide React (for icons in loaders)

All standard, no additional packages needed!

---

## Next Steps

1. **Import** - Use the components in your pages
2. **Integrate** - Add loading states to existing pages
3. **Customize** - Adjust colors, sizes, animations
4. **Test** - Verify on different devices
5. **Monitor** - Track performance metrics
6. **Iterate** - Refine based on user feedback

---

**Ready to use! Pick a component and get started.** 🚀
