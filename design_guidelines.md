# Stocktake Studio Design Guidelines

## Design Approach: Apple HIG-Inspired System
Following Apple's Human Interface Guidelines with clean, minimal design focused on touch-friendly productivity. The app prioritizes efficiency and usability over visual flourishes.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 200 100% 97% (near white background)
- Surface: 210 20% 95% (subtle gray cards)
- Cyan Accent: 180 100% 50% (vibrant cyan for CTAs)
- Text Primary: 220 25% 15% (deep charcoal)
- Text Secondary: 220 15% 45% (medium gray)

**Dark Mode:**
- Primary: 220 25% 12% (dark background)
- Surface: 220 20% 18% (elevated cards)
- Cyan Accent: 180 100% 60% (brighter cyan for contrast)
- Text Primary: 210 20% 90% (light text)
- Text Secondary: 220 15% 65% (muted text)

### B. Typography
- **Primary Font:** Inter (Google Fonts CDN)
- **Heading Scale:** text-xl (18px), text-2xl (24px), text-3xl (30px)
- **Body Text:** text-base (16px), text-sm (14px)
- **Weight Usage:** font-medium for headings, font-normal for body, font-semibold for emphasis

### C. Layout System
**Spacing Units:** Consistently use Tailwind units of 2, 4, 6, and 8
- **Micro spacing:** p-2, m-2 (8px)
- **Standard spacing:** p-4, m-4 (16px) 
- **Section spacing:** p-6, m-6 (24px)
- **Layout spacing:** p-8, m-8 (32px)

### D. Component Library

**Touch-Friendly Specifications:**
- **Minimum touch targets:** 44px (h-11, w-11)
- **Button heights:** h-12 for primary actions, h-10 for secondary
- **Card spacing:** p-6 for comfortable touch interaction
- **Input fields:** h-12 with focus:ring-2 focus:ring-cyan-500

**Department Grid:**
- Large cards (min-h-32) with rounded-xl corners
- Subtle shadows (shadow-sm) with hover:shadow-md
- Clear typography hierarchy with department name and item count

**Count Screen Layout:**
- Three-panel responsive grid (lg:grid-cols-3)
- Left panel: Navigation and search (space-y-4)
- Center panel: Entry form with large input fields
- Right panel: Scrollable entries table

**Navigation:**
- Hash-based routing with clear breadcrumbs
- Back buttons prominently placed (top-left)
- Menu drawer slides from right with backdrop blur

**Form Elements:**
- Large input fields (h-12) with clear labels
- Prominent scan button with camera icon
- Number inputs with + / - steppers for touch
- Clear visual feedback for form validation

**Data Display:**
- Clean tables with alternating row colors
- Sticky headers for long lists
- Touch-friendly row heights (h-12)

### E. Animations
**Minimal Approach:** Focus on functional transitions only
- **Page transitions:** Simple fade (200ms)
- **Drawer animations:** Slide with backdrop fade
- **Button feedback:** Subtle scale on press (active:scale-95)
- **Loading states:** Simple spinner, no elaborate animations

## Key Design Principles
1. **Touch-First:** All interactive elements sized for finger navigation
2. **Information Hierarchy:** Clear visual weight using typography and spacing
3. **Consistency:** Maintain Apple-style consistency in spacing, colors, and interactions
4. **Performance:** Lightweight approach with no heavy visual effects
5. **Accessibility:** High contrast ratios and consistent dark mode implementation

## Images
No hero images or decorative imagery. The app relies on clean typography, icons (Heroicons via CDN), and system emojis for visual elements. Focus remains on functional clarity rather than visual storytelling.