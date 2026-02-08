# Mobile Accessibility & Inclusive Design Guide

## Mobile Accessibility Standards

### WCAG 2.1 Mobile Compliance

#### Level A (Essential)
```
✅ Text Alternatives (1.1.1)
- Alt text on all meaningful images
- Descriptive link text (not "click here")
- Captions for audio/video

✅ Keyboard Accessible (2.1.1)
- Accessible keyboard navigation
- Visible focus indicators
- Logical tab order

✅ Distinguish Colors (1.4.1)
- Don't rely on color alone
- Use patterns/icons with colors
- 4.5:1 contrast for text

✅ Resize Text (1.4.4)
- Allow 200% zoom
- Text reflows without scrolling
- No fixed widths blocking zoom
```

#### Level AA (Recommended for Mobile)
```
✅ Enhanced Contrast (1.4.3)
- 4.5:1 for normal text
- 3:1 for large text (18pt+)
- 3:1 for graphics/UI components

✅ Focus Visible (2.4.7)
- Clear focus indicator
- Minimum 3px visible area
- Contrast with background

✅ Touch Target Size (2.5.5)
- Minimum 44×44 CSS pixels
- Adequate spacing (8px)
- No overlap with other targets

✅ Motion Accessibility (2.3.3)
- Respect prefers-reduced-motion
- No content flashing 3+ times/sec
```

#### Level AAA (Gold Standard)
```
✅ Enhanced Contrast (1.4.6)
- 7:1 for normal text
- 4.5:1 for large text

✅ Sign Language (1.2.6)
- Signed interpretation of video
- For critical content only

✅ Extended Audio Description (1.2.7)
- Additional audio descriptions
- For complex visual information
```

## Touch Accessibility

### Touch Target Design
```
Minimum Size: 44×44 CSS pixels
Recommended: 48×48 CSS pixels
Generous: 56×56 CSS pixels

Formula:
touch_target = icon (16-24px) + padding (10-16px each side)

Examples:
- 20px icon + 12px padding = 44px target ✅
- 16px icon + 14px padding = 44px target ✅
- 24px icon + 10px padding = 44px target ✅
```

### Implementation
```tsx
{/* ✅ GOOD: Adequate touch target */}
<button className="p-3 min-h-11 min-w-11 rounded-lg">
    <Heart className="w-6 h-6" />
</button>

{/* ❌ AVOID: Too small */}
<button className="p-1 rounded">
    <Heart className="w-4 h-4" />
</button>

{/* Padding reference: 12px (p-3) */}
{/* Icon: 24px (h-6 w-6) */}
{/* Total: 24 + 12 + 12 = 48px */}
```

### Spacing Between Targets
```
Minimum Gap: 8px
Recommended: 12-16px

Visual example:
|  Target 1  | 8px |  Target 2  |
```

## Color & Contrast

### Contrast Requirements
```
WCAG AA (Recommended):
- Text vs background: 4.5:1
- Large text (18pt+): 3:1
- UI components: 3:1
- Graphics: 3:1

WCAG AAA (Advanced):
- Text vs background: 7:1
- Large text: 4.5:1
```

### Accessible Color Palette
```
✅ GOOD Pairs (4.5:1+ contrast)
- #0B3D6F (Dark Blue) on #FFFFFF (White)
- #1F2937 (Dark Gray) on #F3F4F6 (Light Gray)
- #FFFFFF (White) on #0B3D6F (Dark Blue)
- #059669 (Green) on #FFFFFF (White)
- #DC2626 (Red) on #FFFFFF (White)

❌ POOR Pairs (< 3:1 contrast)
- #FF6699 (Pink) on #FFB3CC (Light Pink)
- #99CCFF (Light Blue) on #FFFFFF (White)
- #CCCCCC (Light Gray) on #FFFFFF (White)
```

### Check Contrast
```
Online Tools:
- WebAIM Contrast Checker
- Coolors.co Contrast
- Accessible Colors (WCAG)
- Contrast Ratio (by Lea Verou)

Browser Tools:
Chrome DevTools → Inspect → Computed Styles
→ Check color/contrast ratio automatically
```

## Text Accessibility

### Font Sizing
```
Mobile Minimum: 12px
Mobile Recommended: 14-16px (base)
iOS Safari: 16px (prevents auto-zoom on focus)

Scale:
- Tiny:     12px
- Small:    14px
- Base:     16px (standard)
- Large:    18px+
- Heading:  20px+
- Display:  24px+
```

### Line Height (Leading)
```
Minimum: 1.5 (1.5x font size)
Recommended: 1.6-1.8
Large text: 1.5x minimum

Examples:
- 16px text × 1.5 = 24px line height
- 14px text × 1.6 = 22.4px line height
- 18px text × 1.8 = 32.4px line height
```

### Letter Spacing
```
Normal: 0 (default)
Improved Readability: 0.05em - 0.1em

Example in CSS:
p {
    line-height: 1.6;
    letter-spacing: 0.05em;
}
```

### Text Truncation (Avoid on Mobile)
```
❌ AVOID on mobile:
text-overflow: ellipsis
overflow: hidden
white-space: nowrap

✅ DO instead:
- Allow text to wrap
- Use dynamic font sizes
- Truncate only if necessary
- Show full text on tap

Implementation:
<p className="line-clamp-3">
    {longText}
</p>
```

## Keyboard Navigation

### Mobile Keyboard Support
```
iOS Safari:
- Soft keyboard appears on input focus
- Tab key navigation available
- Back/Next buttons on keyboard

Chrome Android:
- Soft keyboard auto-shows
- Tab/Enter navigation
- Dismiss keyboard to see form

Focus Order:
1. Should match visual left-to-right
2. Should match top-to-bottom
3. Should skip hidden elements
4. Should have logical grouping
```

### Keyboard Testing
```tsx
// Test with physical keyboard on mobile
// Or use DevTools to simulate

// Check focus order:
1. Press Tab (next element)
2. Press Shift+Tab (previous element)
3. Verify visible focus indicator
4. Verify logical order
5. Verify no focus traps

// Focus indicator must:
- Be visible (contrast ≥ 3:1)
- Have minimum 2px width
- Not be hidden by overflow
```

### Skip Links (For Keyboard Users)
```tsx
{/* Skip to main content */}
<a 
    href="#main-content"
    className="
        absolute -top-40
        focus:top-0
        bg-blue-600 text-white px-4 py-2
        z-50
    "
>
    Skip to main content
</a>

{/* Mark main content */}
<main id="main-content">
    {/* Page content */}
</main>
```

## Screen Reader Accessibility

### ARIA Labels
```tsx
{/* Icon-only button needs label */}
<button aria-label="Add to favorites">
    <Heart className="w-6 h-6" />
</button>

{/* Form input needs label */}
<label htmlFor="location">Location</label>
<input id="location" type="text" />

{/* Image needs alt text */}
<img src="property.jpg" alt="Beach house in Malibu" />

{/* List needs role */}
<div role="list">
    {items.map(item => (
        <div key={item.id} role="listitem">{item.name}</div>
    ))}
</div>
```

### Semantic HTML
```tsx
{/* ✅ GOOD: Semantic HTML */}
<header>Navigation</header>
<nav>Links</nav>
<main>Content</main>
<section>Group</section>
<article>News</article>
<aside>Sidebar</aside>
<footer>Copyright</footer>

{/* ❌ AVOID: Non-semantic */}
<div className="header">Navigation</div>
<div className="nav">Links</div>
<div className="main">Content</div>
```

### ARIA Roles
```tsx
{/* Custom button needs role */}
<div 
    role="button"
    tabIndex="0"
    onClick={handleClick}
    onKeyDown={e => e.key === 'Enter' && handleClick()}
>
    Click me
</div>

{/* Tabs need role */}
<div role="tablist">
    <button role="tab" aria-selected="true">Tab 1</button>
    <button role="tab" aria-selected="false">Tab 2</button>
</div>

{/* Modal needs role */}
<div 
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="modal-title"
>
    <h2 id="modal-title">Confirm</h2>
</div>
```

### Announcing Content Changes
```tsx
{/* Use for dynamic content updates */}
<div role="status" aria-live="polite">
    {message}
</div>

{/* For urgent updates */}
<div role="alert" aria-live="assertive">
    {error}
</div>

{/* For off-screen updates */}
<div aria-live="polite" className="sr-only">
    {offscreenUpdate}
</div>
```

## Motion & Animation Accessibility

### Respecting prefers-reduced-motion
```tsx
{/* In CSS */}
@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}

{/* In JavaScript */}
const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
).matches

{/* In React */}
const useReducedMotion = () => {
    const [prefersReduced, setPrefersReduced] = useState(false)
    
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        setPrefersReduced(mediaQuery.matches)
        
        const listener = (e) => setPrefersReduced(e.matches)
        mediaQuery.addEventListener('change', listener)
        return () => mediaQuery.removeEventListener('change', listener)
    }, [])
    
    return prefersReduced
}

// Usage:
const prefersReduced = useReducedMotion()
return (
    <div 
        className={prefersReduced ? '' : 'animate-fade-in'}
    >
        Content
    </div>
)
```

### Animation Timing
```
Safe Durations:
- Quick feedback: 100-200ms
- Transitions: 200-300ms
- Page loads: 300-500ms
- Never exceed 2000ms

Avoid:
- Autoplaying videos
- Flashing content (≥ 3 flashes/sec)
- Parallax scrolling
- Bouncy animations
```

### Focus Visible with Animations
```tsx
{/* Show focus even with animations */}
button:focus-visible {
    outline: 3px solid #0B3D6F;
    outline-offset: 2px;
}

{/* Don't animate away focus */}
button:focus-visible {
    /* Keep outline visible */
    outline: 3px solid #0B3D6F;
    /* Don't use opacity: 0 or display: none */
}
```

## Form Accessibility

### Proper Form Structure
```tsx
{/* Always use label with input */}
<div className="mb-4">
    <label htmlFor="email" className="block font-semibold mb-2">
        Email Address
    </label>
    <input
        id="email"
        type="email"
        aria-describedby="email-hint"
        required
    />
    <p id="email-hint" className="text-sm text-gray-600">
        We'll never share your email
    </p>
</div>

{/* Validation messages */}
<input
    aria-invalid={hasError}
    aria-describedby={hasError ? "error-message" : undefined}
/>
{hasError && (
    <p id="error-message" className="text-red-600" role="alert">
        Please enter a valid email
    </p>
)}

{/* Required fields */}
<label htmlFor="name">
    Name <span aria-label="required">*</span>
</label>
<input id="name" required />
```

### Input Types & Mobile Keyboards
```tsx
{/* Email keyboard */}
<input type="email" aria-label="Email address" />

{/* Phone keyboard */}
<input type="tel" aria-label="Phone number" />

{/* Numeric keyboard */}
<input type="number" aria-label="Quantity" />

{/* Date picker */}
<input type="date" aria-label="Check-in date" />

{/* URL keyboard */}
<input type="url" aria-label="Website" />

{/* Time picker */}
<input type="time" aria-label="Arrival time" />

{/* Currency */}
<input 
    type="number" 
    inputMode="decimal"
    aria-label="Price"
/>

{/* Prevent auto-zoom (16px minimum) */}
<input 
    type="text" 
    className="text-base" 
    {/* 16px prevents Safari zoom on focus */}
/>
```

## Error Handling

### Accessible Error Messages
```tsx
{/* Bad: Just color change */}
<input 
    className={error ? 'border-red-500' : 'border-gray-300'}
/>

{/* Good: Error message + color + icon */}
<div>
    <label htmlFor="password">Password</label>
    <input 
        id="password"
        type="password"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "password-error" : undefined}
        className={`
            border-2 rounded-lg px-4 py-2
            ${error ? 'border-red-500' : 'border-gray-300'}
            focus:outline-none focus:border-blue-600
        `}
    />
    {error && (
        <p 
            id="password-error" 
            className="text-red-600 text-sm mt-1 flex items-center gap-1"
            role="alert"
        >
            <AlertCircle className="w-4 h-4" />
            {error}
        </p>
    )}
</div>

{/* Success message */}
<p 
    role="status" 
    aria-live="polite"
    className="text-green-600"
>
    {successMessage}
</p>
```

## Content Accessibility

### Descriptive Headings
```tsx
{/* ❌ AVOID */}
<h1>Home</h1>
<h2>Read more</h2>

{/* ✅ GOOD */}
<h1>Featured Properties in Malibu</h1>
<h2>Latest Beach House Rentals</h2>
```

### Meaningful Link Text
```tsx
{/* ❌ AVOID */}
<a href="/about">Click here</a>
<a href="/contact">Learn more</a>

{/* ✅ GOOD */}
<a href="/about">Learn about our company</a>
<a href="/contact">Contact us for bookings</a>

{/* If must use vague text, add aria-label */}
<a href="/details" aria-label="View property details">
    More
</a>
```

### Lists and Structure
```tsx
{/* Use proper lists */}
<ul role="list">
    <li>Amenity 1</li>
    <li>Amenity 2</li>
    <li>Amenity 3</li>
</ul>

{/* Avoid divs for lists */}
{/* ❌ AVOID */}
<div>
    <div>Amenity 1</div>
    <div>Amenity 2</div>
</div>
```

## Video Accessibility

### Video Captions & Descriptions
```tsx
{/* Always include captions */}
<video controls>
    <source src="video.mp4" type="video/mp4" />
    <track 
        kind="captions" 
        src="captions-en.vtt" 
        srcLang="en"
        label="English"
    />
    <p>
        Video: Beautiful property tour
        <a href="transcript.txt">View transcript</a>
    </p>
</video>

{/* Provide audio description track */}
<video controls>
    <source src="video.mp4" type="video/mp4" />
    <track 
        kind="descriptions" 
        src="descriptions.vtt" 
        srcLang="en"
        label="English Audio Description"
    />
</video>
```

## Testing for Accessibility

### Screen Reader Testing
```
iOS VoiceOver:
1. Settings → Accessibility → VoiceOver → On
2. Swipe right = next element
3. Swipe left = previous element
4. Double-tap = activate
5. Two-finger swipe up = read all

Android TalkBack:
1. Settings → Accessibility → TalkBack → On
2. Tap and hold = read from here
3. Swipe right = next element
4. Swipe left = previous element
5. Double-tap = activate
```

### Automated Testing
```tsx
// Use jest-axe for accessibility tests
import { axe } from 'jest-axe'

test('Homepage has no accessibility issues', async () => {
    const { container } = render(<HomePage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
})
```

### Manual Testing Checklist
```
□ Page title unique and descriptive
□ Heading hierarchy (h1, h2, h3...) correct
□ Images have alt text
□ Links have descriptive text
□ Form labels associated with inputs
□ Error messages are descriptive
□ Focus order is logical
□ Focus indicators visible
□ Touch targets ≥ 44×44px
□ Color contrast ≥ 4.5:1
□ Text can resize to 200%
□ Animation respects prefers-reduced-motion
□ Keyboard navigation works
□ Screen reader announces all content
□ Mobile keyboard types appropriate
```

## Accessibility Checklist

### Perception (Can Users Perceive?)
- [ ] Images have alt text
- [ ] Videos have captions
- [ ] Audio has transcripts
- [ ] Color not sole distinguisher
- [ ] Contrast ≥ 4.5:1 (WCAG AA)

### Operability (Can Users Navigate?)
- [ ] Touch targets ≥ 44×44px
- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] No keyboard traps
- [ ] No seizure triggers

### Understandability (Do Users Understand?)
- [ ] Language is clear
- [ ] Headings are descriptive
- [ ] Instructions are explicit
- [ ] Error messages help
- [ ] Predictable behavior
- [ ] Consistent design

### Robustness (Works with Assistive Tech?)
- [ ] Semantic HTML used
- [ ] ARIA properly implemented
- [ ] Form labels associated
- [ ] Live regions announced
- [ ] No technology conflicts
- [ ] Passes automated checks

---

**Inclusive design benefits everyone!** 🤝♿📱
