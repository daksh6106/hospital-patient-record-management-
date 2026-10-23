---
name: Clinical Clarity
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#40484c'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#70787d'
  outline-variant: '#bfc8cd'
  surface-tint: '#1e667f'
  primary: '#004357'
  on-primary: '#ffffff'
  primary-container: '#0d5c75'
  on-primary-container: '#93d3ef'
  inverse-primary: '#90cfec'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#004641'
  on-tertiary: '#ffffff'
  tertiary-container: '#006059'
  on-tertiary-container: '#83d9cf'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bde9ff'
  primary-fixed-dim: '#90cfec'
  on-primary-fixed: '#001f2a'
  on-primary-fixed-variant: '#004d64'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#9cf2e8'
  tertiary-fixed-dim: '#80d5cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#00504a'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  headline-xl:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Manrope
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  metric-display:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.03em
  metric-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an uncompromisingly clear, calm, and high-efficiency interface for hospital clinicians, nursing staff, and patient administration specialists. It balances clinical precision with an empathetic, non-fatiguing visual environment built for prolonged screen shifts, high-stress emergency transitions, and complex chart audits.

The aesthetic philosophy fuses **Minimalism** with subtle **Tonal Layering**:
- **High-legibility hierarchy:** Immediate scan-ability for life-critical patient statuses, vitals, lab results, and triage levels.
- **Cognitive decompression:** Sterile pure whites are avoided in favor of calm, clinical slates and mist-tinted neutrals to prevent ocular strain under harsh hospital fluorescent lighting.
- **Quiet authority:** Restrained visual chrome lets diagnostic data, patient timelines, and clinical notes take precedence without visual competition.

## Colors

The palette delivers visual stability, clinical legitimacy, and strict visual ergonomics across critical status tiers.

### Functional Palette Structure
- **Primary Clinical Slate (`#0D5C75`):** Anchors primary patient actions, navigation bars, and definitive confirmations. Conveys institutional trust and calm authority.
- **Medical Cyan (`#0284C7`):** Directs clinician attention to interactive focal points, active tab selections, primary hyperlinks, and real-time biometric telemetry highlights.
- **Clinical Teal (`#0F766E`):** Serves administrative verifications, positive patient outcomes, and normal baseline indicators.
- **Slate Neutral (`#475569`):** Grounds typography, muted metadata, structural dividing rules, and patient table scaffolding.

### Status Tiers (Patient Triaging)
- **Critical (`#DC2626` / Light Tint `#FEF2F2`):** Reserved exclusively for unstable vitals, code events, immediate allergies, and urgent contraindications. Never diluted or used decoratively.
- **Observation (`#D97706` / Light Tint `#FFFBEB`):** Flags pending lab clearances, step-down monitoring, or borderline telemetry shifts.
- **Admitted (`#0284C7` / Light Tint `#F0F9FF`):** Denotes active inpatient beds, assigned care teams, and scheduled dosing.
- **Discharged (`#059669` / Light Tint `#ECFDF5`):** Identifies finalized charts, outpatient handoffs, and resolved encounters.

## Typography

The typographic strategy pairs **Manrope** for authoritative, humanized structural headings, **Inter** for neutral, utilitarian diagnostic body copy, and **JetBrains Mono** for numerical telemetry, medical dosages, ICD-10 billing codes, and timestamp tracking.

- **Numerals & Metrics:** JetBrains Mono ensures strict vertical tabular alignment across lab result grids, vital sign panels, and medication titration schedules.
- **Reading Comfort:** Body text line heights are deliberately relaxed (1.45–1.5x) to maintain fast comprehension when reading longitudinal medical notes and multi-column pathology reports.
- **Mobile Grace:** Large titles downscale sharply on compact tablet and handheld devices to prioritize the vertical viewport for immediate patient safety data.

## Layout & Spacing

A disciplined 8-point base grid governs layout density to accommodate data-heavy patient monitors, multi-patient ward overviews, and focused single-patient charts.

### Grid & Canvas Structure
- **Desktop (1024px and up):** A fluid 12-column layout with a fixed persistent patient banner or master rail. Employs `gutter-desktop` (1.5rem / 24px) and `margin-desktop` (2rem / 32px) to maximize parallel visual review of vitals, notes, and MAR (Medication Administration Record).
- **Tablet (768px – 1023px):** An 8-column layout with 1rem gutters and 1.5rem margins. Secondary diagnostic panels collapse into interactive slide-over drawers.
- **Mobile (< 768px):** A 4-column layout prioritizing single-stream clinical task completion (e.g., bedside vitals entry, barcode patient verification). Side rails collapse into a standardized clinical bottom sheet or app bar.

### Rhythm Principles
- Component padding strictly adheres to the `space-*` scale.
- High-density data tables utilize `space-xs` and `space-sm` for vertical cell padding to maximize visible rows per screen, counterbalanced by generous horizontal `space-md` separation between columns.

## Elevation & Depth

This design system avoids heavy drop shadows to prevent visual grime in multi-layered, data-dense layouts. Visual hierarchy relies on **Tonal Layers** combined with **Low-Contrast Outlines**.

### Surface Layers
- **Canvas Base (`#F8FAFC`):** The foundational substrate of the application.
- **Surface Level 1 (`#FFFFFF`):** Work surfaces, patient record cards, and primary data tables. Outlined with a fine, low-contrast border (`1px solid #E2E8F0`).
- **Surface Level 2 (`#F1F5F9`):** Sub-sections, disabled inputs, nested metadata boxes, and table column header backgrounds.
- **Surface Overlay (`#FFFFFF`):** High-priority clinical alerts, drug interaction modals, and prescription dropdowns. Uses a featherweight ambient shadow: `0 4px 20px -2px rgba(15, 23, 42, 0.08)`, bounded by a `1px solid #CBD5E1` border.

### Critical Focus & Highlighting
Elevations are never used solely for decoration. Interactive states, focused table rows, and selected patient cards rise visually through subtle contrast shifts (e.g., active left borders in `#0284C7` or `#0D5C75`) rather than deep dramatic drop shadows.

## Shapes

The design system adopts a **Soft (`1`)** roundedness profile:
- **Base Components (Inputs, Buttons, Badges):** `0.25rem` (4px). Instills a disciplined, clinical precision that maximizes usable layout space.
- **Containers & Data Cards (`rounded-lg`):** `0.5rem` (8px). Softens large structural containers, bed cards, and modal windows without appearing playful.
- **Modals & Drawers (`rounded-xl`):** `0.75rem` (12px). Delivers a measured, modern perimeter for overlay surfaces.

Pill shapes are strictly reserved for status indicator tags, triage badges, and micro-metric counters to differentiate dynamic states from interactive rectilineal controls.

## Components

### Status Badges
- Pill-shaped (`rounded-full`), compact height (`22px`), uppercase `label-sm` tracking with high legibility.
- **Critical:** Light crimson fill (`#FEF2F2`), solid crimson text (`#991B1B`), subtle border (`#F87171`). Includes a mandatory solid dot indicator (`#DC2626`).
- **Observation:** Warm amber fill (`#FFFBEB`), amber text (`#92400E`), border (`#FCD34D`).
- **Admitted:** Clinical cyan tint fill (`#F0F9FF`), rich cyan text (`#075985`), border (`#7DD3FC`).
- **Discharged:** Soft emerald fill (`#ECFDF5`), emerald text (`#065F46`), border (`#6EE7B7`).

### Buttons
- **Primary:** Solid `#0D5C75` fill, `#FFFFFF` text, `0.25rem` radius. Hover shifts to `#0A475B`. Focus ring shows a distinct 2px outer outline in `#0284C7` with 2px offset.
- **Secondary:** Surface `#FFFFFF`, border `1px solid #CBD5E1`, text `#334155`. Hover shifts to `#F8FAFC` and border `#94A3B8`.
- **Destructive/Emergency:** Solid `#DC2626` fill, `#FFFFFF` text. Used exclusively for discharge overrides, code calls, and clinical order revocations.

### Form Inputs & Selects
- Height: 36px (dense clinical desktop) or 44px (touch tablet).
- Background `#FFFFFF`, border `1px solid #CBD5E1`, placeholder `#94A3B8`.
- Focus state: Border transition to `#0284C7` with a clean `0 0 0 3px rgba(2, 132, 199, 0.15)` focus glow.
- Inline validation displays clear icons with error copy directly below the respective field using `body-sm`.

### Data Tables & Patient Lists
- Header cells: `label-md`, background `#F8FAFC`, uppercase lettering, border-bottom `1px solid #E2E8F0`.
- Data rows: Alternate row hover with `#F1F5F9`. Border bottom `1px solid #F1F5F9`.
- Critical condition alerts within tables highlight the entire row's left edge with a `4px solid #DC2626` bar.

### Patient Card & Bed Overview
- Encapsulated in `rounded-lg` containers with `1px solid #E2E8F0`.
- Top-level header contains Patient Full Name (`Manrope`, `headline-sm`), MRN (Medical Record Number in `JetBrains Mono`), age/sex, and status pill badge anchored right.
- Embedded telemetry blocks show vital signs in `JetBrains Mono` with paired small semantic labels (`metric-label`).

### Clinical Alert Banners
- Flush rectangular banners with a `4px` left highlight bar matching the severity color.
- Always include an unambiguous clinical icon (e.g., warning triangle, shield, info circle) followed by actionable imperative instructions.