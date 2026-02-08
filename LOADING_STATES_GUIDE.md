/**
 * Loading States & Skeleton Components - Implementation Guide
 * 
 * This guide shows how to integrate loading states throughout your Darlink application
 */

// ============================================================================
// 1. BASIC SKELETON COMPONENTS
// ============================================================================

import {
    Skeleton,
    PropertyCardSkeleton,
    PropertyListSkeleton,
    SearchFiltersSkeleton,
    PropertyDetailSkeleton,
    SearchResultsSkeleton,
    MapSkeleton,
    BookingWidgetSkeleton,
    SkeletonList,
    SkeletonColumns
} from '@/components/ui/skeleton'

// Usage: Individual skeleton for custom layouts
function CustomLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" /> {/* Default */}
            <Skeleton variant="text" /> {/* Text variant */}
            <Skeleton variant="circle" className="w-12 h-12" /> {/* Circle */}
            <Skeleton variant="rect" className="w-full h-48" /> {/* Rectangle */}
            <Skeleton animated={false} className="bg-slate-100" /> {/* No animation */}
        </div>
    )
}

// ============================================================================
// 2. LOADING STATE LOADERS
// ============================================================================

import {
    SpinnerLoader,
    PulseLoader,
    BounceLoader,
    WaveLoader,
    PageLoader,
    LoadingCard,
    SearchLoadingState,
    PropertyDetailLoadingState,
    InlineLoader,
    ShimmerSkeleton
} from '@/components/ui/loading'

// Usage: Full page loader during transitions
function PageTransition() {
    return (
        <div>
            <PageLoader /> {/* Overlay loader */}
        </div>
    )
}

// Usage: Inline loading indicators
function LoadingStates() {
    return (
        <div className="space-y-8">
            <SpinnerLoader size="md" color="orange" />
            <PulseLoader />
            <BounceLoader />
            <WaveLoader />
            <InlineLoader text="Fetching properties..." />
        </div>
    )
}

// Usage: Complete search results loading state
function SearchPageLoading() {
    return <SearchLoadingState />
}

// Usage: Complete property detail loading state
function PropertyPageLoading() {
    return <PropertyDetailLoadingState />
}

// ============================================================================
// 3. PAGE LOADER COMPONENTS
// ============================================================================

import {
    PageLoaderProvider,
    ProgressBar,
    ContentLoader,
    OverlayLoader
} from '@/components/ui/page-loader'

// Usage: Wrap entire app for global loading state
function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <PageLoaderProvider>
            <ProgressBar />
            {children}
        </PageLoaderProvider>
    )
}

// Usage: Content loader with fallback
function PropertyCard({ isLoading, property }: any) {
    return (
        <ContentLoader
            isLoading={isLoading}
            fallback={<PropertyCardSkeleton />}
        >
            {/* Your actual content here */}
            <div>{property.title}</div>
        </ContentLoader>
    )
}

// Usage: Overlay loader for async operations
function SubmitForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    return (
        <>
            <OverlayLoader isVisible={isSubmitting} />
            <form onSubmit={async () => {
                setIsSubmitting(true)
                // Do async work
                setIsSubmitting(false)
            }}>
                {/* Form fields */}
            </form>
        </>
    )
}

// ============================================================================
// 4. SEARCH PAGE INTEGRATION
// ============================================================================

// In app/search/search-client.tsx:
import { SearchResultsSkeleton } from '@/components/ui/skeleton'

function SearchClient({ properties, user }: any) {
    const [isInitializing, setIsInitializing] = useState(true)

    useEffect(() => {
        setIsInitializing(false)
    }, [])

    const filteredProperties = useMemo(() => {
        // ... filtering logic
        return filtered
    }, [properties])

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isInitializing ? (
                <SearchResultsSkeleton count={8} />
            ) : (
                filteredProperties.map(property => (
                    <PropertyCardListing key={property.id} property={property} />
                ))
            )}
        </div>
    )
}

// ============================================================================
// 5. PROPERTY CARD INTEGRATION
// ============================================================================

// In components/properties/property-card-listing.tsx:
import { PropertyCardSkeleton } from '@/components/ui/skeleton'

function PropertyCardWithLoading({ property, isLoading }: any) {
    if (isLoading) {
        return <PropertyCardSkeleton />
    }

    return (
        <div className="rounded-2xl overflow-hidden bg-white border border-slate-100">
            <img src={property.main_image_url} alt={property.title} />
            <div className="p-4">
                <h3>{property.title}</h3>
                <p>{property.location}</p>
                <div className="flex justify-between">
                    <span>${property.price}</span>
                    <span>{property.rating}</span>
                </div>
            </div>
        </div>
    )
}

// ============================================================================
// 6. PROPERTY DETAIL PAGE INTEGRATION
// ============================================================================

// In app/properties/[id]/page.tsx:
import { PropertyDetailSkeleton } from '@/components/ui/skeleton'
import { ContentLoader } from '@/components/ui/page-loader'

async function PropertyDetailPage({ params }: any) {
    const [isLoading, setIsLoading] = useState(true)
    const [property, setProperty] = useState(null)

    useEffect(() => {
        async function fetchProperty() {
            setIsLoading(true)
            try {
                const data = await fetch(`/api/properties/${params.id}`)
                setProperty(await data.json())
            } finally {
                setIsLoading(false)
            }
        }
        fetchProperty()
    }, [params.id])

    return (
        <ContentLoader
            isLoading={isLoading}
            fallback={<PropertyDetailSkeleton />}
        >
            {property && (
                <div>
                    <img src={property.main_image_url} />
                    <h1>{property.title}</h1>
                    <p>{property.description}</p>
                    {/* More property details */}
                </div>
            )}
        </ContentLoader>
    )
}

// ============================================================================
// 7. BOOKING WIDGET INTEGRATION
// ============================================================================

// In components/booking/booking-section.tsx:
import { BookingWidgetSkeleton } from '@/components/ui/skeleton'

function BookingSection({ propertyId, isLoading }: any) {
    return (
        <div className="sticky top-6">
            {isLoading ? (
                <BookingWidgetSkeleton />
            ) : (
                <BookingWidget propertyId={propertyId} />
            )}
        </div>
    )
}

// ============================================================================
// 8. MAP VIEW LOADING STATE
// ============================================================================

// In components/site/map-view.tsx:
import { MapSkeleton } from '@/components/ui/skeleton'

function MapViewWithLoading({ isLoading, properties }: any) {
    if (isLoading) {
        return <MapSkeleton />
    }

    return (
        <MapView properties={properties} />
    )
}

// ============================================================================
// 9. FILTERED SKELETON LIST
// ============================================================================

// Use SkeletonList for dynamic list sizes:
function DynamicPropertyList({ properties, isLoading }: any) {
    return (
        <div>
            {isLoading ? (
                <SkeletonList count={6} variant="card" />
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {properties.map(property => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            )}
        </div>
    )
}

// ============================================================================
// 10. ADVANCED: COMBINED LOADING PATTERNS
// ============================================================================

// Pattern: Loading + Error State
function SmartPropertyList({ propertyId }: any) {
    const [state, setState] = useState<'loading' | 'error' | 'success'>('loading')
    const [properties, setProperties] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchProperties()
            .then(data => {
                setProperties(data)
                setState('success')
            })
            .catch(err => {
                setError(err.message)
                setState('error')
            })
    }, [propertyId])

    return (
        <div>
            {state === 'loading' && <SearchResultsSkeleton count={8} />}
            {state === 'error' && (
                <div className="text-red-500">Error: {error}</div>
            )}
            {state === 'success' && (
                <div className="grid grid-cols-3 gap-4">
                    {properties.map(property => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            )}
        </div>
    )
}

// Pattern: Progressive Loading
function ProgressivePropertyLoad() {
    const [properties, setProperties] = useState<any[]>([])
    const [isLoadingMore, setIsLoadingMore] = useState(false)

    const handleLoadMore = async () => {
        setIsLoadingMore(true)
        const moreProperties = await fetchMoreProperties()
        setProperties([...properties, ...moreProperties])
        setIsLoadingMore(false)
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                {properties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                ))}
            </div>

            {isLoadingMore && <SearchResultsSkeleton count={3} />}

            <button onClick={handleLoadMore} disabled={isLoadingMore}>
                {isLoadingMore ? 'Loading...' : 'Load More'}
            </button>
        </div>
    )
}

// ============================================================================
// STYLING NOTES
// ============================================================================

/*
 * Tailwind Classes Used:
 * - animate-pulse: Fade in/out animation
 * - Custom animation keyframes in components (slideInUp, fadeIn, wave, bounce, shimmer)
 * 
 * Color Scheme:
 * - Primary: #0B3D6F (Dark Blue)
 * - Accent: #F17720 (Orange)
 * - Skeleton: slate-200 to slate-300 gradient
 * 
 * Responsive Breakpoints:
 * - sm: 640px
 * - md: 768px
 * - lg: 1024px
 * - xl: 1280px
 */

// ============================================================================
// PERFORMANCE TIPS
// ============================================================================

/*
 * 1. Use SkeletonList for large dynamic lists
 * 2. Wrap skeleton components in error boundaries
 * 3. Set timeout for loaders (prevent infinite loading state)
 * 4. Combine with Suspense for server components
 * 5. Use ContentLoader for smooth transitions
 * 6. Memoize skeleton components to prevent re-renders
 * 7. Use InlineLoader for small async operations
 * 8. Implement progressive loading for large datasets
 */
