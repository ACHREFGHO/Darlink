# Mobile Optimization Quick Reference Guide

## File Structure Created

```
Documentation Files:
├── RESPONSIVE_DESIGN_SYSTEM.md      (Device breakpoints, layouts, spacing)
├── MOBILE_PERFORMANCE_GUIDE.md      (Core Web Vitals, optimization, monitoring)
├── MOBILE_TESTING_GUIDE.md          (Device testing, QA procedures, automation)
├── MOBILE_ACCESSIBILITY_GUIDE.md    (WCAG compliance, inclusive design)
└── MOBILE_OPTIMIZATION_QUICK_REFERENCE.md (This file)

Component Files:
├── components/mobile/mobile-components.tsx (13 mobile-optimized components)
└── app/search/search-client.tsx (Updated with responsive layouts)
```

## Quick Start: Implementing Mobile Features

### 1. Responsive Layout
```tsx
// Mobile-first approach
<div className="
    p-4 text-base              // Mobile defaults
    md:p-6 md:text-lg          // Tablet/Desktop
    lg:p-8 lg:text-xl          // Large desktop
">
    Responsive content
</div>
```

### 2. Touch-Friendly Button
```tsx
import { MobileTouchButton } from '@/components/mobile/mobile-components'

// Simple usage
<MobileTouchButton 
    onClick={handleClick}
    variant="primary"
>
    Tap me
</MobileTouchButton>

// With icon
<MobileTouchButton icon={Heart}>
    Save property
</MobileTouchButton>
```

### 3. Mobile Navigation
```tsx
import { MobileBottomNav, MobileNavTab } from '@/components/mobile/mobile-components'

<MobileBottomNav>
    <MobileNavTab icon={Search} label="Explore" isActive />
    <MobileNavTab icon={MapIcon} label="Map" />
    <MobileNavTab icon={Heart} label="Saved" />
    <MobileNavTab icon={User} label="Profile" />
</MobileBottomNav>
```

### 4. Safe Area Support
```tsx
// For bottom navigation (notch/home indicator)
<div style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
    {/* Content moves above home indicator */}
</div>

// For content padding
<div className="safe-bottom">
    {/* CSS class handles safe area */}
</div>
```

### 5. Responsive Images
```tsx
import Image from 'next/image'

<Image
    src="/property.jpg"
    alt="Property"
    width={400}
    height={300}
    sizes="(max-width: 640px) 100vw, 50vw"
    loading="lazy"
    priority={isVisible}
/>
```

## Performance Quick Wins

### ✅ Do These (Easy Wins)
```tsx
1. // Lazy load images
   <img loading="lazy" src="..." />

2. // Code split heavy components
   const HeavyComponent = dynamic(() => import('./heavy'))

3. // Use Next.js Image component
   <Image src="..." sizes="..." loading="lazy" />

4. // Enable CSS minification
   // Already enabled in next.config.ts

5. // Defer non-critical scripts
   <script src="analytics.js" defer></script>
```

### ❌ Avoid These (Performance Killers)
```tsx
1. // Large uncompressed images
   ❌ src="photo.jpg"  (2MB)
   ✅ src="photo.webp" (200KB)

2. // Loading all components upfront
   ❌ import All from './all-components'
   ✅ const All = dynamic(() => import('./all-components'))

3. // Unoptimized fonts
   ❌ @import multiple Google Fonts
   ✅ Use system fonts or variable fonts

4. // Bloated libraries
   ❌ import _ from 'lodash'           (70KB)
   ✅ import { map } from 'lodash-es'  (10KB)

5. // No image optimization
   ❌ srcSet not used
   ✅ Responsive images with srcSet/sizes
```

## Responsive Design Breakpoints

```
Device Type          Width Range      Class Prefix
─────────────────────────────────────────────────
Mobile (portrait)    < 640px         (no prefix / sm:)
Tablet (landscape)   640px - 1024px  md:
Desktop              > 1024px        lg: / xl:
```

### Quick Examples
```tsx
// Hide on mobile, show on tablet+
<div className="hidden md:block">
    Desktop only
</div>

// Show on mobile, hide on tablet+
<div className="md:hidden">
    Mobile only
</div>

// Different layouts
<div className="
    grid grid-cols-1       // 1 column on mobile
    md:grid-cols-2         // 2 columns on tablet
    lg:grid-cols-4         // 4 columns on desktop
">
```

## Touch Target Sizing

```
Minimum:    44×44 pixels (WCAG AA)
Recommended: 48×48 pixels
Generous:   56×56 pixels

Tailwind classes:
min-h-11 min-w-11   // 44×44px
min-h-12 min-w-12   // 48×48px

Padding formula:
button_size = icon_size + (padding × 2)
48px = 20px icon + (14px padding × 2)
```

## Color Contrast Requirements

```
WCAG AA (Minimum):
- Normal text:     4.5:1
- Large text:      3:1
- UI Components:   3:1

WCAG AAA (Enhanced):
- Normal text:     7:1
- Large text:      4.5:1

Test: Use WebAIM Contrast Checker
```

## Safe Area (Notch) Support

### Affected Devices
```
iPhone 12-15 Pro Max  → Top notch
iPhone X/XS Max       → Top notch
Pixel 6 Pro           → Top hole-punch
OnePlus 11 Pro        → Top hole-punch
iPad Pro (gen 3+)     → Top notch (landscape)
```

### Implementation
```tsx
// Bottom navigation with safe area
<nav 
    className="fixed bottom-0 w-full"
    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
>
    {/* Nav items */}
</nav>

// CSS Alternative
.nav {
    padding-bottom: env(safe-area-inset-bottom);
}

// All safe area variables
- safe-area-inset-top       (iPhone notch)
- safe-area-inset-bottom    (Home indicator)
- safe-area-inset-left      (Side notch)
- safe-area-inset-right     (Side notch)
```

## Mobile Components Available

### From `components/mobile/mobile-components.tsx`

| Component | Purpose | Mobile |
|-----------|---------|--------|
| MobileNavTab | Bottom nav item | Yes |
| MobileBottomNav | Complete bottom nav | Yes |
| MobileHeader | Sticky header with back | Yes |
| MobileFilterSheet | Bottom sheet filters | Yes |
| MobileAccordion | Expandable sections | Yes |
| MobileTouchButton | 48px+ button | Yes |
| MobileCard | Optimized card spacing | Yes |
| MobileInput | Large input field | Yes |
| MobileSelect | Touch-friendly dropdown | Yes |
| MobileCardList | Snap-scroll carousel | Yes |
| MobileDrawer | Side drawer nav | Yes |
| MobileSafeArea | Notch wrapper | Yes |
| MobileHapticButton | Button with vibration | Yes |

### Usage Example
```tsx
import {
    MobileHeader,
    MobileBottomNav,
    MobileNavTab,
    MobileTouchButton,
    MobileCard,
} from '@/components/mobile/mobile-components'

export default function SearchPage() {
    return (
        <>
            <MobileHeader title="Search Properties" onBack={() => router.back()} />
            
            <div className="pb-24">
                {properties.map(prop => (
                    <MobileCard key={prop.id}>
                        <h3>{prop.name}</h3>
                        <p>{prop.price}</p>
                        <MobileTouchButton>View</MobileTouchButton>
                    </MobileCard>
                ))}
            </div>
            
            <MobileBottomNav>
                <MobileNavTab icon={Search} label="Explore" isActive />
                <MobileNavTab icon={Heart} label="Saved" />
            </MobileBottomNav>
        </>
    )
}
```

## Network Optimization

### Image Sizes by Speed
```
Fast 4G (5-20 Mbps):
- Hero image: up to 200KB
- Card images: up to 100KB
- Thumbnails: up to 50KB

3G (1-3 Mbps):
- Hero image: 50-100KB
- Card images: 30-50KB
- Thumbnails: 10-20KB

Custom Breakpoints:
const isSlowNetwork = 
    navigator.connection?.effectiveType?.includes('2g|3g')
```

## Testing Checklist

### Before Launch
```
□ Load time < 3 seconds
□ LCP < 2.5 seconds
□ FID < 100ms
□ CLS < 0.1
□ All touch targets 44px+
□ Safe area respected (notch)
□ Works on 4G and 3G
□ Touch events responsive
□ No horizontal scroll
□ Text readable (16px base)
□ Images lazy loaded
□ Lighthouse ≥ 85 (mobile)
```

### Accessibility
```
□ Touch targets ≥ 44×44px
□ Color contrast ≥ 4.5:1
□ Keyboard navigation works
□ Screen reader compatible
□ Focus indicators visible
□ No flashing content
□ Alt text on images
□ Form labels present
□ Error messages helpful
```

### Cross-Device Testing
```
Test Devices:
- iPhone 14 (390×844)
- iPhone SE (375×667)
- Pixel 6 (412×915)
- Samsung S23 (360×800)
- iPad (768×1024)

Orientations:
- Portrait (primary)
- Landscape (secondary)
```

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Text too small | Font < 16px | Use `text-base` minimum |
| Can't reach top | No header padding | Add `pt-16` after fixed header |
| Content hidden | No safe area padding | Add `env(safe-area-inset-*)` |
| Slow load | Large images | Use lazy loading + compression |
| Jank on scroll | Heavy JavaScript | Enable CSS transform animations |
| Zoom on input | Font < 16px | Use `text-base` on inputs |
| Buttons too small | Touch target < 44px | Add `p-3` minimum padding |
| Hard to scroll | No momentum scroll | Add `-webkit-overflow-scrolling: touch` |

## Performance Targets

```
Metrics (Mobile):
- FCP:   < 1.8s
- LCP:   < 2.5s
- FID:   < 100ms
- CLS:   < 0.1
- TTI:   < 3.8s

Bundle Size:
- Main JS:   < 100KB (gzip)
- Total CSS: < 30KB (gzip)
- Images:    < 50KB each (mobile)

Network:
- 4G Load: < 3 seconds
- 3G Load: < 5 seconds
- Offline: Cached content works
```

## Helpful Commands

```bash
# Check build size
npm run build
du -sh .next/

# Run Lighthouse
npx lighthouse https://yoursite.com --preset=mobile

# Test with network throttling
# Chrome DevTools → Network → Add custom profile
# Down: 400kbps, Up: 100kbps, Latency: 200ms

# Profile with DevTools
# Chrome → DevTools → Performance tab
# Record interaction → Check FPS/timing
```

## Resources & Links

### Documentation
- [RESPONSIVE_DESIGN_SYSTEM.md](./RESPONSIVE_DESIGN_SYSTEM.md)
- [MOBILE_PERFORMANCE_GUIDE.md](./MOBILE_PERFORMANCE_GUIDE.md)
- [MOBILE_TESTING_GUIDE.md](./MOBILE_TESTING_GUIDE.md)
- [MOBILE_ACCESSIBILITY_GUIDE.md](./MOBILE_ACCESSIBILITY_GUIDE.md)

### External Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [BrowserStack](https://www.browserstack.com/) - Real device testing
- [Responsively App](https://responsively.app/) - Multi-device testing

### Mobile Testing Devices
- iPhone 14 (390×844) - Current standard
- Pixel 6 (412×915) - Android standard
- iPad (768×1024) - Tablet reference

## Next Steps

### Phase 1: Immediate
1. ✅ Review mobile components library
2. ✅ Update search page layout
3. ✅ Add safe area support
4. ✅ Test on real devices

### Phase 2: Implementation
1. Wire MobileFilterSheet into filters
2. Optimize images for mobile
3. Implement infinite scroll
4. Add swipe gestures

### Phase 3: Polish
1. Run Lighthouse audit
2. Performance optimizations
3. Accessibility audit
4. Cross-browser testing

### Phase 4: Monitoring
1. Set up performance monitoring
2. Track Core Web Vitals
3. Monitor real user metrics
4. Continuous improvement

## Support & Questions

For questions about:
- **Components**: See [components/mobile/mobile-components.tsx](./components/mobile/mobile-components.tsx)
- **Responsive Design**: See [RESPONSIVE_DESIGN_SYSTEM.md](./RESPONSIVE_DESIGN_SYSTEM.md)
- **Performance**: See [MOBILE_PERFORMANCE_GUIDE.md](./MOBILE_PERFORMANCE_GUIDE.md)
- **Testing**: See [MOBILE_TESTING_GUIDE.md](./MOBILE_TESTING_GUIDE.md)
- **Accessibility**: See [MOBILE_ACCESSIBILITY_GUIDE.md](./MOBILE_ACCESSIBILITY_GUIDE.md)

---

**Mobile-optimized Darlink is ready to ship!** 🚀📱✨
