---
name: LGS Educator Console
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  metric-stat:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-compact: 1rem
  margin: 2rem
  margin-compact: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style
The design system reflects an analytical, authoritative, yet motivating educational management interface tailored for middle school teachers, academic mentors, and institutional directors guiding students through the High School Entrance System (LGS). 

The emotional tone balances institutional trust, clarity under high-stakes academic pressure, and pedagogical empowerment. Teachers must immediately perceive clarity in complex datasets (net scores, subject deficiencies, percentile bands) without cognitive overload.

The visual direction follows **Corporate / Modern Precision**:
- Crisp, clinical structure with intentional negative space.
- Data density paired with micro-hierarchy (clear metric groupings, subtle dividers, tabular alignment).
- Soft functional feedback states: quiet neutrals for structural shells, dynamic accents for actionable academic interventions (green for target mastery, amber for topic deficits, deep indigo for navigational anchors).

## Colors
The palette leverages a clinical slate structure with purposeful, high-contrast semantic accents to ensure critical student analytics can be scanned instantly.

- **Primary (`#0F172A`, `#1E293B`):** Deep Navy/Midnight Slate used for sidebars, persistent app headers, high-level headers, and high-impact structural anchors.
- **Secondary (`#4F46E5`, `#3B82F6`):** Vibrant Royal Indigo & Electric Cobalt utilized for primary calls-to-action, trend lines, active tab selections, and selected filter states.
- **Tertiary / Success (`#10B981`):** Emerald tone reserved for target attainment, positive net changes (+Δ), high mastery tiers, and approved study plans.
- **Warning (`#F59E0B`):** Warm Amber allocated to MEB outcome gaps, incomplete assignments, and borderline high school percentile predictions.
- **Critical (`#EF4444`):** Rose/Crimson strictly applied to persistent misconceptions, wrong-answer patterns, and sharp performance drops.
- **Canvas & Surfaces:** Cool off-white background (`#F8FAFC`) to minimize glare during extended grading sessions, paired with pure white cards (`#FFFFFF`) framed by precise hairline borders (`#E2E8F0`).

## Typography
The system enforces a dual-type architecture:
- **Headlines & Metric Display (Plus Jakarta Sans):** Selected for its crisp geometric contours, high legibility in numeric scoring, and authoritative presence in report titles.
- **Body & Functional Data (Inter):** Implemented for high tabular density, student rosters, filter parameters, and microcopy. Features strict open counters to prevent fatigue during data scanning.

Numeric figures (Net calculations, Percentiles, Exam Counts) should explicitly enable tabular figures (`font-variant-numeric: tabular-nums`) across table rows and statistical badges to prevent jitter across re-renders and sorting.

## Layout & Spacing
The layout follows a structured desktop-first fluid grid optimized for high-resolution monitors (1440px baseline):

- **Shell Structure:** A persistent, collapsible 260px navigation rail on the left, an auxiliary sticky contextual sidebar on the far right (320px, used for student quick profiles or filter facets), and a central fluid dashboard canvas.
- **Grid Setup:** 12-column grid system with 24px (`1.5rem`) gutters and 32px (`2rem`) outer canvas padding. For high-density reporting views (MEB Outcome Matrix), gutter collapses to 16px (`1rem`).
- **Spatial Alignment:** Internal card components strictly observe standard padding increments: 16px (`space-md`) for compact widgets and list items; 24px (`space-lg`) for analytical chart cards and assessment summaries.
- **Reflow Rules:** On tablet or downscaled desktop windows (<1200px), secondary filter rails collapse into slide-over panels, and stat grids fold from a 4-column span into a 2x2 matrix.

## Elevation & Depth
This design system rejects heavy, muddy drop shadows in favor of low-contrast outlines and sharp, ambient surface delineation:

- **Surface Level 0 (Base Canvas):** `#F8FAFC` (Cool Off-White) creates a gentle background plane that reduces blue-light glare during night analysis.
- **Surface Level 1 (Analytical Cards & Sheets):** Pure `#FFFFFF` resting on Level 0, framed with a 1px continuous hairline stroke in `#E2E8F0`. 
- **Shadow Philosophy:** Minimal and diffused. Standard cards employ a subtle resting elevation: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`.
- **Surface Level 2 (Floating Modals, Flyout Filters, Popovers):** Pure `#FFFFFF` elevated via `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)` combined with an ambient `#CBD5E1` border stroke.
- **Overlays:** Translucent dark slate curtain (`#0F172A` at 40% opacity) with a subtle 4px backdrop blur to focus teacher attention on critical parent reporting modals or high school preference editors.

## Shapes
A balanced medium roundedness (`0.5rem` / `8px`) anchors the operational feel, projecting modern polish without appearing childlike or frivolous.

- **Standard Elements (`rounded-md` / 8px):** Primary form controls, input wrappers, buttons, dropdown menus, and standard analytical card frames.
- **Sub-components & Micro-indicators (`rounded-sm` / 4px):** MEB outcome heat map tiles, tag pills, progress segment indicators, and table cell chips.
- **Containers & Parent Modals (`rounded-lg` / 16px):** Dialog boxes, full-bleed chart containers, and modal presentation layers.
- **Pills / Radii 9999px:** Strictly reserved for student status indicators (e.g., "Hedef Üstü", "Risk Grubu"), WhatsApp direct integration triggers, and quick-filter toggle tags.

## Components

### Metric Cards (Stat Cards)
- Structurally unified with a 1px border (`#E2E8F0`), `#FFFFFF` background, and 20px padding.
- Top row: Subdued category title (`label-md`, `#64748B`) paired with a functional contextual icon on a soft tinted base (e.g., 10% opacity primary).
- Center: Raw statistical value in `metric-stat` (`Plus Jakarta Sans 32px Bold`, `#0F172A`).
- Bottom row: Trajectory indicator displaying net difference (+1.75 Net / -0.40 Net) with directional arrow indicators using `#10B981` (growth) or `#EF4444` (drop), accompanied by descriptive cohort baseline text (`body-sm`).

### Class Net Trend Graphs
- Chart canvas encapsulated within standard cards, equipped with segmented time-range toggles (Son 3 Deneme, 5 Deneme, Genel).
- High-contrast polyline curves featuring Indigo (`#4F46E5`) for class aggregate and dashed Slate (`#94A3B8`) for general school/national benchmark.
- Data tooltips: Styled as inverted midnight containers (`#0F172A`, text `#FFFFFF`, 8px rounded) displaying exact LGS net breakdowns across branches (Türkçe, Matematik, Fen).

### MEB Outcome Heatmap (Kazanım Matrisi)
- A high-density grid mapping subjects across student rosters.
- Individual tiles utilize a stepped chromatic scale based on mastery percentage:
  - 0–40% (Kritik Eksik): `#FEE2E2` text `#991B1B`
  - 41–70% (Geliştirilmeli): `#FEF3C7` text `#92400E`
  - 71–100% (Kazanıldı): `#D1FAE5` text `#065F46`
- Interactive hover shows exam frequency and specific question numbers linked directly to the mistake gallery.

### Mistake Gallery Cards (Yanlış Soru Kartları)
- Dedicated card preview for visual question inspection. Includes thumbnail preview of scanned paper/digital question with high-contrast cropping.
- Meta chips: Subject, Specific Kazanım code (e.g., `M.8.1.1.3 - Üslü İfadeler`), and cohort error rate (e.g., "Sınıfın %68'i bu soruda yanıldı").
- Quick-action footer: One-click "Benzer Soru Üret" or "Ödev Havuzuna Ekle".

### Action & Communication Triggers
- **WhatsApp Share Button:** Tinted Emerald accent (`#10B981` at 10% fill, `#047857` label/icon), morphing to solid `#10B981` on hover. Pre-formats dynamic student performance briefs for instant parental dispatch.
- **Direct Link Copying:** Flat neutral ghost button with icon feedback; upon click, transitions to green checkmark confirmation with zero layout jump.

### High School Preference Filters & Probability Bars
- Multi-faceted filter system with multi-select dropdowns for city, district, school type (Fen Lisesi, Anadolu Lisesi), and yuzdelik dilim bands.
- **Probability Bar (LGS Yerleşme Olasılığı):** A segmented progress component:
  - Safe Range (Yeşil): Student's current percentile is well above the school's historical cutoff.
  - Target Range (Sarı/Kehribar): 0.5% - 1.5% margin needed.
  - Reach Range (Kırmızı/Gül Kurusu): Deficit requires significant net lift.
- Accompanied by inline calculated required net deltas (e.g., "+2 Matematik Neti Gerekiyor").

### Form Controls & Inputs
- Height standardized at 40px for desktop operational efficiency.
- Border `#CBD5E1`, transitioning to 2px focus ring in `#4F46E5` with `#EEF2FF` focus offset.
- Checkboxes and radios adhere to standard rounded forms with solid indigo check fills.