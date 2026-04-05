# Website UI/UX Design Plan — Zero-Touch Growth OS

## For: Stitch in Antigravity (Frontend Build)
## Project: NMIMS INNOVATHON 2026, Challenge 1

---

## 1. Design Philosophy

This is NOT a generic SaaS dashboard. This is a **premium growth operating system** — it should feel like the user has an entire marketing agency in their browser. The design must communicate:

- **Intelligence**: The system *thinks* for you — every screen should feel alive, responsive, anticipatory
- **Trust**: Indian SMB owners need to feel this is professional, not a hobby project
- **Delight**: Micro-interactions, smooth transitions, and visual polish that makes users go "whoa"
- **Simplicity**: Despite powerful features, every screen has ONE clear purpose and ONE clear action

### Design References (Mood)
- **Linear.app** — clean, dark-mode-optional, buttery smooth animations
- **Vercel Dashboard** — minimal, information-dense without clutter
- **Stripe Atlas** — step-by-step wizard flows, progressive disclosure
- **Framer** — 3D elements, scroll-triggered animations, creative energy

---

## 2. Color System

### Primary Palette — "Electric Sunrise"
A light base with vibrant accents. The theme should feel **energetic, modern, trustworthy**.

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background (Primary) | Warm White | `#FAFAF8` | Page backgrounds, cards |
| Background (Secondary) | Soft Cream | `#F5F3EF` | Section backgrounds, alternating rows |
| Surface | Pure White | `#FFFFFF` | Cards, modals, elevated elements |
| Text (Primary) | Deep Charcoal | `#1A1A2E` | Headlines, body text |
| Text (Secondary) | Warm Grey | `#6B7280` | Descriptions, labels, timestamps |
| Text (Muted) | Light Grey | `#9CA3AF` | Placeholders, disabled states |

### Accent Colors — Vibrant & Purposeful
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary Accent | Electric Indigo | `#4F46E5` | CTAs, primary buttons, active nav, links |
| Primary Hover | Deep Indigo | `#4338CA` | Button hover states |
| Secondary Accent | Coral Orange | `#F97316` | Notifications, important badges, AI indicators |
| Success | Emerald | `#10B981` | Positive metrics, published status, growth indicators |
| Warning | Amber | `#F59E0B` | Pending states, scheduling alerts |
| Error | Rose | `#EF4444` | Errors, decline metrics, failed states |
| AI Glow | Violet | `#8B5CF6` | AI-generated content indicators, magic sparkle accents |

### Gradient Accents (for hero sections, feature cards, CTAs)
```css
/* Primary gradient — hero sections, major CTAs */
background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%);

/* AI indicator gradient — pulse on AI-generated elements */  
background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%);

/* Warm success gradient — growth metrics, positive charts */
background: linear-gradient(135deg, #10B981 0%, #34D399 100%);

/* Sunset gradient — festival/occasion cards */
background: linear-gradient(135deg, #F97316 0%, #F59E0B 50%, #EAB308 100%);
```

### Dark Mode (Optional — toggle in settings)
| Role | Hex |
|------|-----|
| Background | `#0F0F1A` |
| Surface | `#1A1A2E` |
| Border | `#2D2D44` |
| Text Primary | `#F1F5F9` |
| Text Secondary | `#94A3B8` |

---

## 3. Typography

| Role | Font | Weight | Size | Line Height |
|------|------|--------|------|-------------|
| Display / Hero | **Inter** | 800 (ExtraBold) | 48-72px | 1.1 |
| Page Heading (H1) | **Inter** | 700 (Bold) | 32-36px | 1.2 |
| Section Heading (H2) | **Inter** | 600 (SemiBold) | 24-28px | 1.3 |
| Card Title (H3) | **Inter** | 600 (SemiBold) | 18-20px | 1.4 |
| Body | **Inter** | 400 (Regular) | 15-16px | 1.6 |
| Small / Labels | **Inter** | 500 (Medium) | 12-13px | 1.5 |
| Code / Metrics | **JetBrains Mono** | 400 | 14px | 1.5 |
| AI-Generated Text | **Inter** | 400 Italic | 15px | 1.6 |

**Why Inter**: Supreme legibility, free, variable font (one file, all weights), great for data-heavy dashboards.

---

## 4. Page-by-Page Design Specification

### 4.1 Landing Page (/)
**Purpose**: First impression. Convert visitor to sign-up. Communicate "AI-powered growth system" in 5 seconds.

**Hero Section (100vh)**
- Full viewport height, light cream background
- Large 3D floating element: a stylized dashboard preview floating at a slight angle with a soft shadow (use CSS transforms + perspective)
- Animated gradient text for the headline: "Your AI Marketing Team. Zero Cost."
- Subtitle: "The autonomous growth OS that replaces your social media manager, content creator, and ad optimizer — for free."
- Two CTAs: [Get Started Free] (primary gradient button with hover glow) | [Watch Demo] (ghost button)
- Floating decorative elements: small abstract shapes (circles, rounded rectangles) slowly orbiting the hero with parallax on scroll
- Subtle grid pattern in the background (like Linear's site) — low opacity dotted grid

**Scroll Animation Sequence (on scroll down)**
1. **"How It Works" section** — 3 steps, each revealed on scroll with staggered fade-in + slide-up:
   - Step 1: "Tell Us About Your Business" — illustration of form filling, icon: building
   - Step 2: "AI Creates Your Strategy" — illustration of calendar generating, icon: sparkles
   - Step 3: "Grow on Autopilot" — illustration of metrics going up, icon: rocket
   - Each step card has a subtle 3D tilt on hover (CSS perspective transform)

2. **Feature showcase** — horizontal scroll section (pinned on scroll):
   - 4 feature cards slide in horizontally as user scrolls vertically
   - Each card: icon + title + one-line description + mini screenshot/mockup
   - Cards: Business Intelligence | Weekly Planner | Creative Studio | Ad Optimizer

3. **Live demo metrics** — animated counter section:
   - "500+ Business Profiles Analyzed" (counter animates up on scroll into view)
   - "10,000+ Creatives Generated"
   - "95% Time Saved vs Manual Marketing"
   - Numbers should count up smoothly (use Framer Motion or GSAP)

4. **Testimonial / Use Case section**:
   - 3 cards showing sample Indian SMB use cases: "Sharma Bakery", "FitZone Gym", "Priya's Boutique"
   - Each card shows: business photo, generated calendar preview, sample creative
   - Cards have a glass-morphism effect (backdrop-blur, semi-transparent white)

5. **CTA Section** — dark section with gradient text:
   - "Stop Managing. Start Growing."
   - [Create Your Growth Plan — Free] button with animated gradient border

6. **Footer** — minimal, dark:
   - Built for NMIMS INNOVATHON 2026
   - Tech stack badges (Next.js, Gemini, Firebase, Vercel)
   - GitHub link

### 4.2 Onboarding / Business Setup (/onboard)
**Purpose**: Collect business info in a delightful, step-by-step wizard. Should feel like a conversation, not a form.

**Layout**: Centered card (max-width 640px), step indicator at top, progress bar

**Step 1 — "What's your business?"**
- Input: Business name (text, large)
- Input: Website URL (optional, text with URL validation)
- Input: Industry (searchable dropdown with icons — bakery, restaurant, salon, gym, etc.)
- Transition: slide-left on "Continue"

**Step 2 — "Who are your customers?"**
- Input: Target audience (multi-select tags: Families, Young Adults, Professionals, Students, Seniors, etc.)
- Input: Location / City (text with autocomplete)
- Input: Business tone (radio pills: Professional, Friendly, Casual, Luxurious, Playful)
- Visual: Tone preview — show a sample caption in the selected tone

**Step 3 — "Your brand identity"**
- Input: Brand colors (2 color pickers with hex input, defaults pre-filled)
- Input: Logo upload (drag & drop area with preview)
- Input: Products/Services (tag input — user types and presses enter to add)
- Visual: Live preview card showing business name in their brand colors

**Step 4 — "Analyzing your business..."**
- Full-screen loading state with animated AI analysis visualization
- Show progress steps appearing one by one:
  - "Scanning website..." (if URL provided)
  - "Analyzing industry trends..."
  - "Building competitor landscape..."
  - "Generating business profile..."
- Each step has a checkmark animation on completion
- Transition to results page after ~10-15 seconds (actual API call + artificial delay for UX)

**Step 5 — "Your Business Profile" (results)**
- Beautiful card showing AI-generated business profile:
  - Business summary (2-3 sentences)
  - Industry insights
  - Target audience analysis
  - Competitor positioning
  - Recommended content pillars (3-5 topics)
- User can edit/refine any field
- CTA: [Generate My Growth Plan →]

### 4.3 Dashboard (/dashboard)
**Purpose**: Command center. At a glance: this week's plan, recent performance, upcoming actions.

**Top Bar**
- Business name + logo (left)
- Quick actions: [+ New Post] [Generate Creative] (right)
- Notification bell with badge count
- User avatar dropdown

**Layout**: 12-column grid, responsive

**Row 1 — Quick Stats (4 cards)**
- This Week's Posts: 5/7 scheduled (circular progress ring)
- Engagement Rate: 4.2% (with +0.3% green arrow)
- Upcoming Festival: "Diwali (12 days away)" with festive icon
- AI Credits Used: 45/100 (progress bar)
- Each card: white surface, subtle shadow, icon with color background circle

**Row 2 — Weekly Calendar (spans 8 cols) + AI Insights (spans 4 cols)**
- Calendar: 7-day horizontal strip, each day is a card
  - Shows scheduled posts as colored dots (blue = post, orange = festival, green = carousel)
  - Click to expand day → see post details
  - Empty days have a subtle "+" button to add content
  - Today highlighted with primary accent border
- AI Insights panel:
  - "Trending in your industry: [topic]"
  - "Suggested: Create a Diwali campaign this week"
  - "Your best posting time: 6:30 PM IST"
  - Each insight has an action button

**Row 3 — Recent Creatives (spans 12 cols)**
- Horizontal scrollable gallery of recently generated creatives
- Each creative: thumbnail + type badge (Post, Festival, Carousel, Banner)
- Hover: scale up slightly + show "View" / "Edit" / "Download" actions
- [See All Creatives →] link

**Row 4 — Performance Overview (spans 8 cols) + Upcoming (spans 4 cols)**
- Performance: Line chart (Recharts) showing engagement over last 30 days
  - Toggle: Likes | Comments | Shares | Reach
  - Smooth curve lines, gradient fill under the line
  - Tooltip on hover showing exact numbers
- Upcoming panel:
  - Next 3 scheduled posts with time, platform icon, status
  - Next festival/occasion with countdown

### 4.4 Weekly Planner (/planner)
**Purpose**: View and edit the AI-generated 7-day content calendar.

**Layout**: Full-width calendar view

**Calendar View (default)**
- 7 columns (Mon-Sun), each column is a day
- Each day card contains:
  - Date + day name
  - Festival/occasion badge (if applicable — "Diwali", "Saturday Sale", etc.)
  - Scheduled content items as mini-cards:
    - Post type icon + color (blue post, orange festival, green carousel, purple banner)
    - Title/headline preview (1 line, truncated)
    - Platform icons (Instagram, Facebook, LinkedIn, Twitter)
    - Time
    - Status pill: Draft | Scheduled | Published | Failed
  - [+ Add Post] button at bottom of each day
- Drag & drop: Move posts between days by dragging
- Click on any post mini-card → opens detail sidebar

**Detail Sidebar (slides in from right)**
- Post preview (image if creative, text if caption)
- Full caption text
- Hashtags
- Scheduled time (editable)
- Platform selection (toggle checkboxes)
- [Edit] [Delete] [Publish Now] actions
- AI suggestions: "Try adding a CTA" or "This performs best at 6 PM"

**AI Regenerate Bar (bottom, fixed)**
- "Not happy with this week? [Regenerate Week Plan]"
- Options: "Keep festival posts" checkbox, "Change focus to: [dropdown]"

### 4.5 Creative Studio (/studio)
**Purpose**: Generate, view, and manage all creative assets.

**Top Section — Generator**
- Tab bar: Post | Festival | Carousel | Banner | Captions
- Each tab opens a generation form:
  - Theme/topic input
  - Text inputs (headline, body, CTA)
  - Platform selector
  - [Generate] button with AI sparkle icon
- Generated results appear below in a grid
- Generation loading: skeleton cards with shimmer animation

**Gallery Section**
- Masonry grid of all generated creatives
- Filter bar: Type | Platform | Date
- Each creative card:
  - Image preview
  - Overlay on hover: source badge (Unsplash, AI Generated), dimensions
  - Actions: Download, Edit, Use in Post, Delete
  - Click → full-screen preview modal

### 4.6 Ad Performance (/ads)
**Purpose**: Mock ad dashboard showing simulated campaign performance.

**Layout**: Dashboard-style with charts

**Campaign Cards (top)**
- 3-4 mock campaigns: "Diwali Sale", "Grand Opening", "New Menu Launch"
- Each card: status pill (Active/Paused), budget, spend, results
- Click → detailed view

**Metrics Grid (2x3)**
- CTR: 3.2% (with trend arrow)
- CPC: Rs 4.50
- CPL: Rs 120
- ROAS: 4.2x
- Conversions: 156
- Impressions: 45,200
- Each metric card has a mini sparkline chart

**Charts Section**
- Performance over time (line chart)
- Audience breakdown (donut chart)
- Creative performance comparison (bar chart)
- AI Recommendations panel: "Increase budget on Campaign A by 20%", "Pause Campaign C — declining CTR"

### 4.7 Settings (/settings)
- Business profile editor
- Brand colors + logo
- API key management (for future integrations)
- Theme toggle (light/dark)
- Notification preferences

---

## 5. Animation & Interaction Specification

### Micro-Interactions
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Button hover | Scale 1.02 + shadow increase | 200ms | ease-out |
| Button click | Scale 0.98 (press down) | 100ms | ease-in |
| Card hover | translateY(-2px) + shadow | 200ms | ease-out |
| Page transition | Slide left + fade | 300ms | ease-in-out |
| Modal open | Scale 0.95→1 + fade in | 250ms | spring(1, 80, 10) |
| Modal close | Scale 1→0.95 + fade out | 200ms | ease-in |
| Toast notification | Slide down from top + fade | 300ms | spring |
| Skeleton shimmer | Linear gradient sweep | 1.5s loop | linear |
| Counter animate | Count up from 0 | 2s | ease-out |
| Chart draw | SVG path draw | 1s | ease-in-out |
| Tab switch | Content cross-fade | 200ms | ease |
| Dropdown open | ScaleY 0→1 from top | 200ms | ease-out |

### Scroll Animations (Landing Page)
- Use **Framer Motion** `useInView` + `motion.div` for scroll-triggered reveals
- Elements fade in + slide up 20px when entering viewport
- Stagger children by 100ms for list items
- Parallax on decorative elements: slower scroll speed (0.5x)
- Horizontal scroll section: use scroll progress to translate X

### 3D Elements
- Dashboard preview on landing page: CSS `perspective(1000px) rotateY(-5deg) rotateX(5deg)`
- Feature cards: subtle tilt on mouse hover using `onMouseMove` to calculate rotation
- Floating decorative shapes: CSS keyframe animations (slow orbit, 20-30s duration)

### Loading States
- Skeleton screens for all data-loading states (not spinners)
- AI generation: animated dots "Generating..." with violet pulse
- Page load: fade in from white (not FOUC)

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, bottom nav, stacked cards, hamburger menu |
| Tablet | 640-1024px | 2-column grid, sidebar collapses to hamburger |
| Desktop | 1024-1440px | Full layout, sidebar visible, 3-4 column grids |
| Wide | > 1440px | Max-width 1440px centered, increased padding |

---

## 7. Component Library (shadcn/ui base + custom)

### From shadcn/ui (install these)
- Button, Input, Select, Textarea, Dialog, Sheet (sidebar), Tabs, Badge, Avatar
- Card, Separator, Dropdown Menu, Tooltip, Calendar, Progress
- Toast, Alert, Skeleton, Switch, Checkbox, Radio Group

### Custom Components to Build
| Component | Description |
|-----------|-------------|
| `GlowButton` | Primary CTA with animated gradient border glow |
| `MetricCard` | Stat card with icon, value, trend arrow, sparkline |
| `AIIndicator` | Violet sparkle icon + "AI Generated" badge for AI content |
| `WeekStrip` | 7-day horizontal calendar strip component |
| `PostCard` | Mini card showing post preview (type, platform, time, status) |
| `CreativeGrid` | Masonry grid for creative gallery with lazy loading |
| `StepWizard` | Multi-step form wrapper with progress bar + transitions |
| `InsightCard` | AI insight with icon, text, action button |
| `PlatformBadge` | Instagram/Facebook/LinkedIn/Twitter icon badge |
| `FestivalBanner` | Colorful banner for upcoming festivals with countdown |
| `ChartCard` | Wrapper for Recharts with title, toggle, loading state |

---

## 8. Technical Implementation Notes

### Libraries
- **Next.js 14** (App Router) — pages, layouts, API routes
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — base component library
- **Framer Motion** — animations, page transitions, scroll effects
- **Recharts** — charts and data visualization
- **Lucide React** — icon set (consistent, clean)
- **next-themes** — dark mode toggle
- **react-hot-toast** — toast notifications

### Performance
- All images: next/image with lazy loading
- Route prefetching for navigation
- Skeleton screens, never raw loading spinners
- Code split per route (automatic with Next.js App Router)

### Folder Structure
```
src/
  app/
    page.tsx                    # Landing page
    layout.tsx                  # Root layout (fonts, theme provider)
    onboard/
      page.tsx                  # Onboarding wizard
    dashboard/
      page.tsx                  # Main dashboard
      layout.tsx                # Dashboard shell (sidebar + top bar)
    planner/
      page.tsx                  # Weekly planner
    studio/
      page.tsx                  # Creative studio
    ads/
      page.tsx                  # Ad performance
    settings/
      page.tsx                  # Settings
  components/
    ui/                         # shadcn/ui components
    landing/                    # Landing page sections
    onboarding/                 # Wizard steps
    dashboard/                  # Dashboard widgets
    planner/                    # Calendar components
    studio/                     # Creative generation UI
    shared/                     # Shared components (MetricCard, etc.)
  lib/
    gemini.ts                   # Gemini API client
    firebase.ts                 # Firebase config + helpers
    utils.ts                    # Utility functions
  hooks/                        # Custom React hooks
  styles/
    globals.css                 # Tailwind imports + custom CSS
```

---

## 9. Key Design Principles (for the builder)

1. **White space is your friend** — Don't cram. Let elements breathe. Generous padding (24-32px cards, 48-64px sections).

2. **Hierarchy through size, not decoration** — Big = important. Small = secondary. Don't use borders when spacing works.

3. **One primary action per screen** — Every page has ONE thing the user should do. Make it obvious with color and position.

4. **AI content feels magical** — Whenever AI generates something, add a subtle violet glow/pulse animation. The user should *feel* the AI working.

5. **Indian context** — Festival colors, Hindi-friendly layouts (but English UI), Indian SMB examples in sample data. Real Indian business names in demos.

6. **Progressive disclosure** — Don't show everything at once. Expand on click. Sidebar for details. Modals for actions.

7. **Consistency** — Same border radius (8px), same shadow levels (sm/md/lg), same animation timing. Never mix.

---

## 10. Sample Data for Demo

Prepare 3 demo businesses for the hackathon presentation:

1. **Sharma Bakery** — Bakery in Pune, warm tone, brand colors #FF6B00 + #1A1A2E
2. **FitZone Gym** — Fitness center in Mumbai, energetic tone, brand colors #10B981 + #1A1A2E
3. **Priya's Boutique** — Fashion store in Jaipur, elegant tone, brand colors #8B5CF6 + #F5F3EF

Each should have a full onboarding flow → generated business profile → weekly plan → sample creatives ready to show.
