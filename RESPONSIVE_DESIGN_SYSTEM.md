# Mobile-First Responsive Design System - Complete Reference

## Architecture Overview

### Device Breakpoints
```
Mobile:    < 640px   (xs, sm)
Tablet:    640-1024  (md, lg)
Desktop:   > 1024px  (xl, 2xl)
```

### Tailwind Breakpoints Used
```css
sm:  640px   /* Extra small devices */
md:  768px   /* Tablets */
lg:  1024px  /* Large tablets */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

## Mobile-First Strategy

### Base (Mobile) Styles
```tsx
<div className="p-4 text-base font-semibold">
    {/* Mobile-optimized by default */}
</div>
```

### Progressive Enhancement (Desktop)
```tsx
<div className="p-4 text-base font-semibold md:p-8 md:text-lg">
    {/* Enhanced on larger screens */}
</div>
```

### Desktop-Only (Hide on Mobile)
```tsx
<div className="hidden md:block">
    {/* Only shown on tablets and up */}
</div>
```

## Component Sizing Guidelines

### Touch Targets (Mobile-First)
```
Minimum:    44px × 44px  (WCAG AA)
Recommended: 48px × 48px (Apple HIG)
Generous:   56px × 56px  (Better UX)

Examples:
- Button heights: min-h-11 (44px) or min-h-12 (48px)
- Icon sizes: w-5 h-5 (20px) inside touch target
- Tap areas: Always include padding
```

### Spacing Scale
```
Mobile:  gap-2 gap-3 gap-4 (8px, 12px, 16px)
Tablet:  gap-4 gap-6 gap-8 (16px, 24px, 32px)
Desktop: gap-6 gap-8 gap-12 (24px, 32px, 48px)
```

### Typography Scale
```
Mobile:
- Display: text-3xl (30px)
- Heading: text-xl (20px)
- Body:    text-base (16px)
- Small:   text-sm (14px)
- Tiny:    text-xs (12px)

Desktop:
- Display: text-5xl (48px)
- Heading: text-3xl (30px)
- Body:    text-lg (18px)
- Small:   text-base (16px)
```

## Layout Patterns

### Single Column (Mobile)
```tsx
<div className="space-y-4">
    {items.map(item => <Card key={item.id} item={item} />)}
</div>
```

### Two Column (Tablet)
```tsx
<div className="md:grid md:grid-cols-2 md:gap-6 space-y-4 md:space-y-0">
    {items.map(item => <Card key={item.id} item={item} />)}
</div>
```

### Four Column (Desktop)
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {items.map(item => <Card key={item.id} item={item} />)}
</div>
```

## Navigation Patterns

### Mobile Bottom Navigation
```tsx
{/* Always visible on mobile */}
<nav className="md:hidden fixed bottom-0 w-full">
    {/* 4-5 main tabs */}
</nav>
```

### Tablet/Desktop Top Navigation
```tsx
{/* Show on medium screens and up */}
<nav className="hidden md:flex">
    {/* Full navigation */}
</nav>
```

### Hamburger Menu (Optional)
```tsx
{/* Use for secondary nav on mobile */}
<button className="md:hidden">
    <Menu />
</button>
```

## Image Optimization

### Responsive Image Sizing
```tsx
<img
    className="w-full object-cover aspect-video"
    src="small.jpg"
    srcSet="
        small.jpg 320w,
        medium.jpg 640w,
        large.jpg 1280w
    "
    loading="lazy"
/>
```

### Picture Element (Format-based)
```tsx
<picture>
    <source media="(max-width: 640px)" srcSet="mobile.webp" type="image/webp" />
    <source media="(max-width: 1024px)" srcSet="tablet.webp" type="image/webp" />
    <img src="desktop.jpg" alt="Description" className="w-full" />
</picture>
```

## Form Optimization for Mobile

### Large Inputs
```tsx
<input
    className="w-full px-4 py-3 text-base rounded-lg"
    type="text"
    placeholder="Type here..."
/>
```

### Focus States
```tsx
<input
    className="
        w-full px-4 py-3 text-base rounded-lg
        border-2 border-slate-200
        focus:border-[#0B3D6F] focus:outline-none
    "
/>
```

### Mobile Keyboard Types
```tsx
{/* Email */}
<input type="email" />

{/* Phone */}
<input type="tel" />

{/* Date */}
<input type="date" />

{/* Number */}
<input type="number" />

{/* Search */}
<input type="search" />
```

## Safe Area Support (Notch/Home Indicator)

### CSS Environment Variables
```css
env(safe-area-inset-top)    /* iPhone notch space */
env(safe-area-inset-bottom) /* Home indicator space */
env(safe-area-inset-left)   /* Side notches */
env(safe-area-inset-right)  /* Side notches */
```

### Implementation
```tsx
<div
    className="pb-6"
    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
>
    {/* Content respects notch/home indicator */}
</div>
```

### Bottom Navigation Example
```tsx
<nav
    className="fixed bottom-0 w-full bg-white border-t"
    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
>
    {/* Nav items */}
</nav>

{/* Padding for nav + safe area */}
<div className="pb-24" />
```

## Orientation Handling

### Portrait (Default)
```css
/* Most mobile content */
```

### Landscape Mode
```tsx
<div className="
    h-screen landscape:h-[100dvh] /* Dynamic viewport height */
">
    {/* Adjust for landscape */}
</div>
```

## Touch & Interaction Optimization

### No Tap Delay
```css
/* Already handled by modern browsers */
/* No need for FastClick library */
```

### Haptic Feedback
```tsx
const triggerHaptic = () => {
    if (navigator.vibrate) {
        navigator.vibrate(20) // 20ms vibration
    }
}
```

### Preventing Zoom on Input Focus
```tsx
<input
    type="text"
    inputMode="text"
    /* iOS still zooms at < 16px font, so use 16px minimum */
    className="text-base"
/>
```

### Touch Event Handling
```tsx
<button
    onTouchStart={() => setIsPressed(true)}
    onTouchEnd={() => setIsPressed(false)}
    onClick={handleClick}
>
    Tap me
</button>
```

## Performance Optimization for Mobile

### Code Splitting
```tsx
// Load heavy components on desktop only
const DesktopComponent = dynamic(
    () => import('./DesktopComponent'),
    { ssr: false }
)

// Mobile-specific components
import { MobileHeader } from '@/components/mobile'
```

### Network Optimization
```tsx
// Detect connection speed
const isSlowConnection = 
    navigator.connection?.effectiveType === '4g'

// Reduce image quality or size
const imageSrc = isSlowConnection 
    ? 'low-quality.jpg' 
    : 'high-quality.jpg'
```

### Viewport Meta Tag
```html
<meta 
    name="viewport" 
    content="width=device-width, initial-scale=1, viewport-fit=cover"
/>
```

### CSS Media Queries
```css
/* Prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
    /* Dark styles */
}

/* High contrast */
@media (prefers-contrast: more) {
    /* Higher contrast */
}
```

## Scrolling Optimization

### Smooth Scrolling
```tsx
<div className="
    overflow-x-auto
    snap-x snap-mandatory
    scroll-smooth
">
    {/* Snap scroll on horizontal scroll */}
</div>
```

### Virtual Scrolling (Large Lists)
```tsx
import { FixedSizeList } from 'react-window'

<FixedSizeList
    height={600}
    itemCount={1000}
    itemSize={80}
    width='100%'
>
    {Row}
</FixedSizeList>
```

## Gesture Support

### Pull to Refresh (Optional)
```tsx
const handlePullToRefresh = useSwipeDown(() => {
    refetchData()
})
```

### Swipe Navigation (Optional)
```tsx
const handleSwipe = useSwipe({
    onLeft: () => goToNext(),
    onRight: () => goToPrevious(),
})
```

## Testing Mobile Responsiveness

### Responsive Design Mode
```
Chrome DevTools:
1. Ctrl+Shift+M (or Cmd+Shift+M on Mac)
2. Select device from dropdown
3. Test different orientations
4. Check touch simulation
5. Test network throttling
```

### Common Device Sizes to Test
```
iPhone SE:      375×667
iPhone 14:      390×844
Pixel 6:        412×915
iPad:           768×1024
iPad Pro:       1024×1366
Surface Duo:    540×720 (each pane)
Foldable:       Varies (test both states)
```

### Performance Testing
```
Metrics to check:
- LCP: < 2.5s (mobile), < 4.0s (slow)
- FID: < 100ms (mobile), < 300ms (slow)
- CLS: < 0.1 (stable)
- Page Load: < 3s on 4G
```

## Accessibility on Mobile

### Touch Target Size
```css
/* Minimum 44px × 44px (WCAG 2.1 Level AAA) */
min-height: 44px;
min-width: 44px;
```

### Text Sizing
```css
/* Minimum 12px, readable at 16px */
font-size: 16px; /* Prevents auto-zoom on iOS */
line-height: 1.5;
```

### Color Contrast
```css
/* WCAG AA: 4.5:1 for text */
/* WCAG AAA: 7:1 for text */
color: #0B3D6F;
background-color: #FFFFFF;
```

## Common Issues & Solutions

### Issue: Text Too Small
**Solution:**
```tsx
{/* Mobile: 14-16px, Desktop: 16-18px */}
className="text-sm md:text-base"
```

### Issue: Touch Targets Too Small
**Solution:**
```tsx
{/* Ensure minimum 44-48px */}
className="p-3 md:p-2" {/* Mobile has more padding */}
```

### Issue: Layout Shift on Load
**Solution:**
```tsx
{/* Fixed dimensions on images */}
<img className="w-full aspect-square" src="..." />
```

### Issue: Slow on Mobile Network
**Solution:**
```tsx
{/* Lazy load heavy images */}
<img loading="lazy" src="..." />
{/* Code split desktop components */}
{/* Optimize bundle size */}
```

### Issue: Safe Area Not Respected
**Solution:**
```tsx
<div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
    {/* Content moved above notch/home indicator */}
</div>
```

## Quick Reference Checklist

### Mobile Layout Essentials
- [ ] Single column layout (mobile)
- [ ] 2-3 column (tablet)
- [ ] 3-4 column (desktop)
- [ ] Full-width on mobile
- [ ] Max-width on desktop
- [ ] Proper gutters
- [ ] Safe area padding

### Touch/Interaction
- [ ] 44-48px touch targets
- [ ] No 300ms delay
- [ ] Active/focus states visible
- [ ] Haptic feedback
- [ ] Loading states shown
- [ ] Error messages clear

### Performance
- [ ] Images lazy loaded
- [ ] Images responsive (srcSet)
- [ ] Code splitting by device
- [ ] Minimal JavaScript
- [ ] 16px base font (no zoom)
- [ ] Fast LCP/FID

### Accessibility
- [ ] Keyboard navigation
- [ ] Touch target 44px+
- [ ] High contrast (4.5:1)
- [ ] Proper heading hierarchy
- [ ] Alt text on images
- [ ] ARIA labels

---

**All components ready for production!** 📱✨
