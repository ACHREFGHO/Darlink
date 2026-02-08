# Mobile Testing & QA Comprehensive Guide

## Device Testing Matrix

### iOS Devices to Test
```
iPhone Models:
- iPhone SE (375×667)      - Smallest screen
- iPhone 14 (390×844)      - Current standard
- iPhone 14 Pro (390×932)  - With notch
- iPhone 14 Plus (428×926) - Larger device
- iPad (768×1024)          - Tablet orientation
- iPad Pro (1024×1366)     - Large tablet

iOS Versions:
- iOS 15 (older devices)
- iOS 16 (current)
- iOS 17 (latest)
```

### Android Devices to Test
```
Common Devices:
- Pixel 6 (412×915)        - Standard Android
- Pixel 7 (412×915)        - Recent Google
- Samsung S23 (360×800)    - Smaller OLED
- Samsung S23+ (440×936)   - Larger device
- OnePlus 11 (412×915)     - Mid-range
- Motorola G13 (720×1600)  - Large budget device

Android Versions:
- Android 12 (older)
- Android 13 (current)
- Android 14 (latest)
```

### Foldable Devices (Future)
```
Samsung Galaxy Z Fold:  720×1920 (unfolded: 1768×2208)
Samsung Galaxy Z Flip:  720×1520 (unfolded: 2636×1440)
Microsoft Surface Duo:  540×720 (each pane)
```

## Chrome DevTools Mobile Testing

### Responsive Design Mode
```
Steps:
1. Open DevTools (F12)
2. Click responsive design mode (Ctrl+Shift+M)
3. Select device from dropdown
4. Or enter custom size: width × height
5. Test portrait & landscape
6. Check touch simulation (Ctrl+Shift+M)
```

### Network Throttling
```
Presets:
- No throttling      → Fiber
- GPRS              → Slow 2G
- Regular 2G        → 2G
- Good 3G           → 3G
- Regular 4G (LTE)  → 4G
- Fast 4G           → Broadband

Custom Settings:
- Download: kbps
- Upload: kbps
- Latency: ms (round trip)
```

### CPU Throttling
```
Presets:
- No throttling  → Desktop
- 2x slowdown    → Mid-range phone
- 4x slowdown    → Budget phone

Test animations:
1. Enable CPU throttling
2. Check FPS (target: 60fps)
3. Look for jank/stuttering
4. Monitor frame time
```

### Device Emulation
```
Sensor Simulation:
- Geolocation      → Test location features
- Orientation      → Portrait/landscape
- Touch            → Enable touch events
- Accelerometer    → Motion detection
- Gyroscope        → Rotation sensors
```

## Performance Profiling

### Lighthouse Audit
```
Steps:
1. Open DevTools
2. Go to Lighthouse tab
3. Select "Mobile"
4. Click "Analyze page load"
5. Review metrics:
   - Performance (target: 90+)
   - Accessibility (target: 90+)
   - Best Practices (target: 90+)
   - SEO (target: 90+)
```

### Core Web Vitals Measurement
```
LCP (Largest Contentful Paint):
- Good:   ≤ 2.5s
- Needs:  2.5s - 4.0s
- Poor:   > 4.0s

FID (First Input Delay):
- Good:   ≤ 100ms
- Needs:  100ms - 300ms
- Poor:   > 300ms

CLS (Cumulative Layout Shift):
- Good:   ≤ 0.1
- Needs:  0.1 - 0.25
- Poor:   > 0.25
```

### Performance API
```tsx
// Measure custom metrics
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        console.log('Performance Entry:', {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
        })
    }
})

observer.observe({ entryTypes: ['measure', 'navigation'] })

// Mark custom operations
performance.mark('operation-start')
// ... operation code ...
performance.mark('operation-end')
performance.measure('operation', 'operation-start', 'operation-end')
```

## Touch Testing

### Swipe Gestures
```
1. Horizontal Swipe
   - Start: x=100, y=300
   - End:   x=400, y=300
   - Duration: 300ms

2. Vertical Swipe
   - Start: x=200, y=100
   - End:   x=200, y=400
   - Duration: 300ms

3. Pinch Zoom
   - Two fingers apart
   - Zoom in: fingers closer
   - Zoom out: fingers apart
   - Duration: 500ms
```

### Touch Target Validation
```
Checklist:
- [ ] Button height ≥ 44px
- [ ] Button width ≥ 44px
- [ ] Spacing between buttons ≥ 8px
- [ ] Icon properly centered
- [ ] Tap feedback instant (< 100ms)
- [ ] Visual feedback on press
- [ ] Accessible text label
- [ ] Works with thumb reach
```

## Orientation Testing

### Portrait Mode
```
Typical layout:
- Full width card
- Single column
- Bottom navigation
- Horizontal scroll for secondary items
```

### Landscape Mode
```
Typical layout:
- 2-3 columns
- Reduced padding
- Top navigation preferred
- Adjust header height
```

### Test Transitions
```tsx
// Orientation change handling
useEffect(() => {
    const handleOrientationChange = () => {
        const isPortrait = window.innerHeight > window.innerWidth
        setOrientation(isPortrait ? 'portrait' : 'landscape')
    }
    
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)
    
    return () => {
        window.removeEventListener('orientationchange', handleOrientationChange)
        window.removeEventListener('resize', handleOrientationChange)
    }
}, [])
```

## Safe Area Testing

### Devices with Notches
```
Test List:
- iPhone 12-15 Pro Max   → Top notch
- iPhone XS Max          → Top notch
- iPhone X               → Top notch
- Pixel 6 Pro            → Top hole punch
- OnePlus 11 Pro         → Top hole punch
- Samsung S23 Ultra      → Top hole punch
```

### Test Checklist
```
- [ ] Content visible above notch
- [ ] Bottom padding for home indicator
- [ ] Nav buttons not hidden by notch
- [ ] Safe area CSS variables applied
- [ ] No cutoff text or buttons
- [ ] Landscape mode tested
- [ ] Fullscreen apps (YouTube) tested
```

### Safe Area Verification
```tsx
// Check computed safe area values
useEffect(() => {
    const safeTop = getComputedStyle(document.documentElement)
        .getPropertyValue('safe-area-inset-top')
    const safeBottom = getComputedStyle(document.documentElement)
        .getPropertyValue('safe-area-inset-bottom')
    
    console.log('Safe areas:', { safeTop, safeBottom })
}, [])
```

## Network Testing

### Slow Network Simulation
```
Chrome DevTools → Network:
1. Click throttling dropdown
2. Select custom profile
3. Set: 50 kbps down, 20 kbps up
4. Latency: 400ms
5. Reload page
6. Check visual feedback
```

### Offline Testing
```
Steps:
1. DevTools → Network tab
2. Check "Offline" checkbox
3. Reload page
4. Test offline functionality:
   - Service worker activation
   - Cached content loading
   - Offline message display
   - Error handling
```

### Test Different Connection Types
```
3G Network:
- Speed: 1-3 Mbps
- Latency: 100-300ms
- Test: Images, heavy scripts

4G/LTE Network:
- Speed: 5-20 Mbps
- Latency: 50-100ms
- Test: Video, large payloads

5G Network (Future):
- Speed: 100+ Mbps
- Latency: 20-50ms
- Test: Streaming, real-time features
```

## Accessibility Testing

### Mobile Accessibility Checklist
```
Touch:
- [ ] Touch targets ≥ 44pt
- [ ] Touch spacing ≥ 8pt
- [ ] No hover-only actions
- [ ] Double-tap zoom enabled

Text:
- [ ] Font size ≥ 12px (16px preferred)
- [ ] Line height ≥ 1.5
- [ ] Contrast ratio ≥ 4.5:1
- [ ] Text scalable to 200%

Interaction:
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] Error messages clear
- [ ] Confirmation for destructive actions
```

### Screen Reader Testing
```
iOS (VoiceOver):
1. Settings → Accessibility → VoiceOver
2. Swipe right = next element
3. Swipe left = previous element
4. Double tap = activate
5. Two-finger Z = undo

Android (TalkBack):
1. Settings → Accessibility → TalkBack
2. Tap and hold = read from here
3. Swipe right = next element
4. Swipe left = previous element
5. Double tap = activate
```

## Connectivity Testing

### 3G/4G Network Issues
```
Common Problems:
- High latency (200-400ms)
- Variable speeds
- Intermittent drops
- High packet loss

Solutions:
- Compress images aggressively
- Minimize HTTP requests
- Use service workers for caching
- Show loading indicators
- Retry failed requests
- Queue offline actions
```

### WiFi Issues
```
Test Scenarios:
- Connect/disconnect repeatedly
- Move between WiFi networks
- Low signal strength
- High congestion
- Timeout handling
```

## User Interaction Testing

### Input Field Testing
```
Test Cases:
- [ ] Type with keyboard (all orientations)
- [ ] Autocomplete suggestions work
- [ ] Password field masks text
- [ ] Number inputs show numeric keyboard
- [ ] Email inputs show @ key
- [ ] Date inputs show date picker
- [ ] Textarea scrolls properly
- [ ] Auto-focus doesn't prevent zoom
```

### Form Submission
```
Test Cases:
- [ ] Submit button visible on keyboard
- [ ] Loading state shown
- [ ] Success/error feedback
- [ ] Form re-fillable after error
- [ ] Submission prevents double-submit
- [ ] Works with pre-filled data (autofill)
```

### Navigation Testing
```
Test Cases:
- [ ] Back button (device) works
- [ ] Links open in same/new tab correctly
- [ ] Tab bar highlights current section
- [ ] Deep linking works
- [ ] History preserved on back
- [ ] Page scroll position restored
```

## Real Device Testing

### Physical Device Testing Checklist
```
Before Testing:
- [ ] Clear browser cache
- [ ] Clear app cache
- [ ] Restart device
- [ ] Check device date/time
- [ ] Connect to WiFi and 4G
- [ ] Test with both orientations

During Testing:
- [ ] Touch all interactive elements
- [ ] Test slow swiping (intentional)
- [ ] Test fast swiping (flick)
- [ ] Test pinch zoom
- [ ] Rotate device during interaction
- [ ] Put device to sleep/wake
- [ ] Test during calls
- [ ] Simulate low battery
```

### Screenshots & Recording
```
iOS Screenshot:
- Power + Volume Up buttons simultaneously
- Saved to Photos

Android Screenshot:
- Power + Volume Down buttons simultaneously
- Saved to Gallery

Screen Recording:
iOS: Control Center → Record Screen
Android: Settings → Developer → Screen Recording
```

## Automated Testing

### Playwright Mobile Testing
```typescript
import { chromium, devices } from 'playwright'

const test = async () => {
    const browser = await chromium.launch()
    const context = await browser.createContext({
        ...devices['iPhone 12'],
        locale: 'en-US',
        geolocation: { latitude: 40.7128, longitude: -74.0060 },
        permissions: ['geolocation']
    })
    
    const page = await context.newPage()
    await page.goto('https://yoursite.com')
    
    // Test touch interaction
    await page.tap('button')
    
    // Test gesture
    await page.touchscreen.tap(100, 200)
    
    await browser.close()
}
```

### Cypress Mobile Testing
```typescript
describe('Mobile User Flow', () => {
    beforeEach(() => {
        cy.viewport('iphone-x')
    })
    
    it('should load property on mobile', () => {
        cy.visit('/properties/123')
        cy.get('[data-cy=property-card]').should('be.visible')
        cy.get('[data-cy=favorite-btn]').click()
        cy.contains('Added to favorites').should('be.visible')
    })
})
```

## Browser Compatibility

### iOS Safari
```
Current Versions:
- iOS 17: Full support
- iOS 16: Good support
- iOS 15: Most features
- iOS 14: Test carefully

Known Issues:
- -webkit prefixes sometimes needed
- Fixed positioning quirky with notch
- Video autoplay restricted
- Permission dialogs different
```

### Chrome Android
```
Versions to Test:
- Chrome 120+: Current
- Chrome 119: Previous
- Chrome 118: Older devices

Known Issues:
- Some CSS grid issues
- Autocomplete behavior different
- Gesture conflicts with page scrolling
```

### Samsung Internet
```
Test On:
- Samsung devices (Galaxy S series)
- Different from Chrome
- Some custom features

Known Issues:
- Slightly different CSS rendering
- WebGL performance varies
- Bluetooth API differences
```

## QA Testing Template

### Test Case Format
```
Test Case: [Feature]
Device: [iPhone 14 / Pixel 6 / etc]
OS Version: [iOS 17 / Android 14 / etc]
Browser: [Safari / Chrome / etc]
Network: [WiFi / 4G / 3G]

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Status: [PASS / FAIL]

Screenshots: [Attach if failed]
```

### Bug Report Template
```
Title: [Brief description]
Severity: [Critical / High / Medium / Low]
Device: [iPhone 14 Pro]
OS: [iOS 17]
Browser: [Safari]
Network: [4G]
Reproduction Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected: [What should happen]
Actual: [What happened]
Screenshots: [Attach]
```

## Performance Benchmarking

### Baseline Metrics
```
Establish baseline on:
- iPhone 14 (current standard)
- Pixel 6 (Android standard)
- iPad (tablet)

Track:
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- TTI (Time to Interactive)
```

### Regression Testing
```
After each release:
1. Run Lighthouse (Mobile)
2. Compare to baseline
3. Flag any regressions
4. Investigate slowdowns
5. Document improvements
```

## Continuous Testing

### Set Up Automated Tests
```bash
# Run tests on commit
npm test -- --coverage

# Run Lighthouse CI
npm install -g @lhci/cli@
lhci autorun

# Test across devices
npm run test:mobile
```

## Mobile QA Checklist

### Core Functionality
- [ ] Load time < 3 seconds
- [ ] All pages load completely
- [ ] All buttons/links work
- [ ] Forms submit successfully
- [ ] Images load properly
- [ ] Text is readable
- [ ] No console errors

### Responsive Design
- [ ] Mobile layout (< 640px)
- [ ] Tablet layout (640-1024px)
- [ ] Desktop layout (> 1024px)
- [ ] Portrait orientation works
- [ ] Landscape orientation works
- [ ] Notch/safe area respected

### Touch Interaction
- [ ] Touch targets ≥ 44px
- [ ] No accidental taps
- [ ] Swipe gestures work
- [ ] Scroll is smooth (60fps)
- [ ] Double-tap zoom disabled
- [ ] Pinch zoom works
- [ ] Long-press shows context menu

### Performance
- [ ] Lighthouse ≥ 85 (mobile)
- [ ] FCP < 2.0s
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Images lazy-loaded

### Accessibility
- [ ] Screen reader works
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast adequate
- [ ] Touch targets accessible
- [ ] Alt text on images
- [ ] Form labels present

### Network
- [ ] Works on 4G
- [ ] Works on 3G
- [ ] Offline functionality works
- [ ] Errors handled gracefully
- [ ] Retry logic works
- [ ] No blank screens

### Cross-Browser
- [ ] Safari iOS
- [ ] Chrome Android
- [ ] Samsung Internet
- [ ] Firefox Mobile
- [ ] Edge Mobile

---

**Test thoroughly on real devices for best results!** 📱✅
