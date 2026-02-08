# Mobile Performance & Optimization Guide

## Core Web Vitals for Mobile

### Target Metrics
```
LCP (Largest Contentful Paint):  < 2.5s (mobile)
FID (First Input Delay):         < 100ms
CLS (Cumulative Layout Shift):   < 0.1
FCP (First Contentful Paint):    < 1.8s
TTFB (Time to First Byte):       < 600ms
```

## Image Optimization

### WebP Format with Fallback
```tsx
<picture>
    <source srcSet="image.webp" type="image/webp" />
    <source srcSet="image.jpg" type="image/jpeg" />
    <img 
        src="image.jpg" 
        alt="Description"
        loading="lazy"
        className="w-full object-cover"
    />
</picture>
```

### Responsive Images with srcSet
```tsx
<img
    className="w-full object-cover aspect-video"
    src="image-medium.jpg"
    srcSet="
        image-small.jpg 320w,
        image-medium.jpg 640w,
        image-large.jpg 1280w,
        image-xlarge.jpg 1920w
    "
    sizes="
        (max-width: 640px) 100vw,
        (max-width: 1024px) 50vw,
        33vw
    "
    loading="lazy"
    decoding="async"
/>
```

### Next.js Image Component
```tsx
import Image from 'next/image'

<Image
    src="/property.jpg"
    alt="Property"
    width={400}
    height={300}
    sizes="(max-width: 640px) 100vw, 50vw"
    priority={isVisible}
    placeholder="blur"
    blurDataURL={blurHash}
/>
```

### Image Compression Targets
```
Mobile (< 640px):   Max 50KB per image
Tablet (640-1024):  Max 100KB per image
Desktop (> 1024):   Max 200KB per image

Format priorities:
1. WebP (best compression)
2. JPEG (good compression, wide support)
3. PNG (lossless, only when needed)
4. SVG (scalable graphics only)
```

## Code Splitting by Device

### Dynamic Imports
```tsx
import dynamic from 'next/dynamic'

// Load only on desktop
const DesktopMapView = dynamic(
    () => import('@/components/desktop-map-view'),
    { ssr: false }
)

// Load only on mobile
const MobileMapView = dynamic(
    () => import('@/components/mobile-map-view'),
    { ssr: false }
)

export default function MapView() {
    return (
        <>
            <div className="hidden md:block">
                <DesktopMapView />
            </div>
            <div className="md:hidden">
                <MobileMapView />
            </div>
        </>
    )
}
```

### Bundle Size Analysis
```bash
# Analyze bundle size
npm run build

# Check for unused dependencies
npm list --depth=0

# Tree-shake unused code
npm prune --production
```

## CSS Optimization

### Critical CSS
```css
/* Inline critical CSS (< 14KB) */
/* Include in <head> for FCP */

/* High priority: */
- Layout system (grid, flexbox)
- Typography (font sizes)
- Navigation (header, footer)
- Above-the-fold styles

/* Lazy load: */
- Animations
- Hover states
- Below-the-fold styles
```

### CSS-in-JS vs Tailwind (Mobile Performance)
```tsx
// ✅ GOOD: Tailwind (CSS is static, pre-compiled)
<div className="flex gap-4 p-4">

// ❌ AVOID: Styled Components on mobile
// (Adds JavaScript overhead)
const StyledDiv = styled.div`
    display: flex;
    gap: 1rem;
    padding: 1rem;
`
```

### CSS Media Queries (Don't Repeat)
```css
/* ❌ AVOID: Duplicate breakpoints */
@media (max-width: 640px) { ... }
@media (max-width: 640px) { ... }

/* ✅ GOOD: Combine related rules */
@media (max-width: 640px) {
    .card { ... }
    .header { ... }
    .footer { ... }
}
```

## JavaScript Optimization

### Lazy Load Interactive Features
```tsx
import { lazy, Suspense } from 'react'

const LiveChat = lazy(() => import('@/components/live-chat'))
const BookingWidget = lazy(() => import('@/components/booking-widget'))

export default function Page() {
    return (
        <>
            <MainContent />
            <Suspense fallback={null}>
                <LiveChat />
                <BookingWidget />
            </Suspense>
        </>
    )
}
```

### Defer Non-Critical JavaScript
```tsx
{/* Load analytics after interaction */}
useEffect(() => {
    const timer = setTimeout(() => {
        loadScript('analytics.js')
    }, 3000)
    
    return () => clearTimeout(timer)
}, [])
```

### Reduce JavaScript Size
```
Targets:
- Main bundle:      < 100KB (gzip)
- Total JS:         < 250KB (gzip)
- Per route:        < 50KB (gzip)

Strategies:
1. Remove unused dependencies
2. Tree-shake unused code
3. Minify and compress
4. Code split at route level
5. Use smaller alternatives
   - lodash → lodash-es
   - moment → date-fns
   - axios → fetch
```

## Font Optimization

### System Fonts (Fastest)
```tsx
{/* No custom font = fastest load */}
<style>{`
    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
`}</style>
```

### Web Fonts with Optimization
```tsx
{/* Variable fonts (combine multiple weights/styles) */}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap')

{/* Specific weights only (fewer requests) */}
@font-face {
    font-family: 'Custom';
    src: url('font-400.woff2') format('woff2');
    font-weight: 400;
}
```

### Font Loading Strategy
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

/* Fallback while loading */
body {
    font-family: system-ui, sans-serif;
}

/* Use custom font when available */
body.fonts-loaded {
    font-family: 'Inter', sans-serif;
}
```

## Network Optimization

### Detect Connection Speed
```tsx
const useNetworkOptimization = () => {
    const [isSlowNetwork, setIsSlowNetwork] = useState(false)
    
    useEffect(() => {
        const connection = navigator.connection
        if (!connection) return
        
        const updateConnection = () => {
            const slowTypes = ['4g', 'slow-2g', '2g', '3g']
            const isSlow = slowTypes.includes(connection.effectiveType)
            setIsSlowNetwork(isSlow)
        }
        
        updateConnection()
        connection.addEventListener('change', updateConnection)
        return () => connection.removeEventListener('change', updateConnection)
    }, [])
    
    return { isSlowNetwork }
}
```

### Adaptive Image Loading
```tsx
const AdaptiveImage = ({ src, ...props }) => {
    const [isSlowNetwork, setIsSlowNetwork] = useState(false)
    
    useEffect(() => {
        const slowConnection = 
            navigator.connection?.effectiveType?.includes('2g|3g')
        setIsSlowNetwork(slowConnection)
    }, [])
    
    const imageSrc = isSlowNetwork 
        ? src.replace('.jpg', '-small.jpg')
        : src
    
    return <img src={imageSrc} loading="lazy" {...props} />
}
```

## Caching Strategy

### Service Worker (PWA)
```tsx
// next.config.ts
export default {
    swcMinify: true,
    productionBrowserSourceMaps: false,
}

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered'))
        .catch(err => console.log('SW registration failed'))
}
```

### HTTP Caching Headers
```
Recommended:
- Images: 1 year (immutable)
- CSS/JS: 1 month
- HTML: No-cache (check for updates)
- API: Vary by endpoint (5min-1hour)
```

### Browser Cache Control
```tsx
// Cache images indefinitely
<img 
    src="/logo.png"
    alt="Logo"
    decoding="async"
    referrerPolicy="no-referrer"
/>

// Revalidate frequently changing data
const { data } = useSWR(
    '/api/properties',
    fetch,
    {
        revalidateOnFocus: false,
        dedupingInterval: 5000,
    }
)
```

## Rendering Optimization

### Server-Side Rendering (SSR)
```tsx
// next.config.ts
export default {
    nextScriptWorkers: true,
    swcMinify: true,
    reactStrictMode: true,
}
```

### Static Generation (Recommended for Mobile)
```tsx
// Generate at build time (fastest)
export const revalidate = 3600 // Revalidate hourly

export default function PropertyPage() {
    return <div>Static content</div>
}
```

### Incremental Static Regeneration (ISR)
```tsx
export const revalidate = 300 // Revalidate every 5 minutes

export async function generateStaticParams() {
    const properties = await fetchPropertyIds()
    return properties.map(prop => ({ id: prop.id }))
}
```

## Database Query Optimization

### N+1 Query Prevention
```tsx
// ❌ AVOID: Multiple queries per item
properties.map(prop => {
    const reviews = await fetchReviews(prop.id) // N queries!
})

// ✅ GOOD: Batch fetch
const reviewsByProperty = await fetchReviewsForMultiple(
    properties.map(p => p.id)
)
```

### Query Pagination
```tsx
// Mobile users expect fast initial load
// Don't load 1000 results at once

const [page, setPage] = useState(1)
const pageSize = 20

const { data } = useSWR(
    `/api/properties?page=${page}&limit=${pageSize}`,
    fetch
)
```

## Mobile-Specific Performance Tips

### 1. Viewport Configuration
```html
<meta 
    name="viewport" 
    content="width=device-width, initial-scale=1, viewport-fit=cover, minimum-scale=1, maximum-scale=5"
/>
```

### 2. Remove Render-Blocking Resources
```tsx
{/* Async load non-critical scripts */}
<script src="analytics.js" async></script>

{/* Defer non-critical scripts */}
<script src="widgets.js" defer></script>

{/* Inline critical CSS only */}
<style>{criticalCSS}</style>
<link rel="stylesheet" href="styles.css" media="print" onLoad="this.media='all'" />
```

### 3. Prioritize Above-the-Fold
```tsx
{/* Mark images above fold as priority */}
<Image 
    src="hero.jpg" 
    priority
    {...props}
/>

{/* Lazy load below-fold images */}
<Image 
    src="section.jpg" 
    loading="lazy"
    {...props}
/>
```

### 4. Monitor Performance
```tsx
// Track Core Web Vitals
const reportWebVitals = (metric) => {
    // Send to analytics
    analytics.track('web_vital', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
    })
}
```

### 5. Handle Low Battery
```tsx
const useLowBatteryOptimizations = () => {
    useEffect(() => {
        if (!('getBattery' in navigator)) return
        
        navigator.getBattery?.().then(battery => {
            const optimizeForBattery = () => {
                if (battery.level < 0.2) {
                    // Disable animations, reduce updates
                    document.documentElement.style.setProperty(
                        '--disable-animations',
                        '1'
                    )
                }
            }
            
            battery.addEventListener('levelchange', optimizeForBattery)
        })
    }, [])
}
```

## Testing Performance

### Lighthouse Mobile Testing
```bash
# Run Lighthouse on mobile settings
npx lighthouse https://yoursite.com --preset=mobile

# Target scores:
# Performance:    > 90
# Accessibility:  > 90
# Best Practices: > 90
# SEO:           > 90
```

### Real Device Testing
```
Use services:
1. BrowserStack - Real devices
2. Sauce Labs - Mobile testing
3. Google PageSpeed Insights - Field data
4. WebPageTest - Waterfall charts
5. Chrome DevTools Lighthouse
```

### Field Performance Monitoring
```tsx
// Use real user monitoring (RUM)
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function reportWebVitals() {
    getCLS(console.log)
    getFID(console.log)
    getFCP(console.log)
    getLCP(console.log)
    getTTFB(console.log)
}
```

## Common Mobile Performance Issues

### Issue 1: Janky Scrolling
**Cause:** JavaScript blocking main thread
**Solution:**
```css
.scroll-container {
    -webkit-overflow-scrolling: touch;
    will-change: transform;
}
```

### Issue 2: Slow Page Load
**Cause:** Too much JavaScript
**Solution:**
```tsx
// Remove unused libraries
npm prune --production

// Code split by route
const LazyComponent = dynamic(() => import('./slow-component'))
```

### Issue 3: Images Not Loading
**Cause:** Network issue or missing compression
**Solution:**
```tsx
// Provide placeholder
<Image
    src="image.jpg"
    placeholder="blur"
    blurDataURL={blurHash}
    alt="Loading..."
/>
```

### Issue 4: Battery Drain
**Cause:** Excessive animations, constant polling
**Solution:**
```tsx
// Reduce animation frequency on low battery
const shouldAnimate = !isLowBattery
const transition = shouldAnimate ? 'all 0.3s' : 'none'
```

### Issue 5: Memory Overflow
**Cause:** Large lists not virtualized
**Solution:**
```tsx
import { FixedSizeList } from 'react-window'

<FixedSizeList
    height={600}
    itemCount={items.length}
    itemSize={80}
    width="100%"
>
    {({ index, style }) => (
        <div style={style}>{items[index]}</div>
    )}
</FixedSizeList>
```

## Mobile Performance Checklist

### Loading Optimization
- [ ] First paint under 1.8s
- [ ] LCP under 2.5s
- [ ] Images lazy loaded
- [ ] Code split by route
- [ ] Minimal main bundle
- [ ] Fonts optimized
- [ ] Third-party scripts deferred

### Runtime Performance
- [ ] No layout thrashing
- [ ] Smooth 60fps scrolling
- [ ] Long tasks under 50ms
- [ ] FID under 100ms
- [ ] CLS under 0.1
- [ ] No memory leaks

### Network Optimization
- [ ] Compression enabled (gzip/brotli)
- [ ] Caching headers set
- [ ] HTTP/2 enabled
- [ ] No unused HTTP requests
- [ ] Adaptive image loading
- [ ] Connection-aware loading

### Device Optimization
- [ ] Safe area respected
- [ ] Touch targets 44px+
- [ ] Viewport configured
- [ ] No pinch-zoom disabled
- [ ] 16px font minimum
- [ ] Battery optimizations

---

**Target: Mobile sites that feel native and load instantly!** ⚡📱
