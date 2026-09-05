# Sri Lankan Multilingual News Intelligence Platform
## UI Design System & Foundation Documentation (Phase R1)

**Version:** 1.0.0 (Phase R1)  
**Visual Theme:** "Editorial Intelligence Room"  
**Stack:** Next.js 16.3.3 + React 19 + Tailwind CSS v4

---

## 1. Color System & Semantic Tokens

Defined in `src/app/globals.css` via Tailwind CSS v4 `@theme inline` mapping:

| Token Category | Token Name | CSS Variable | Value / Hex | Usage Description |
| :--- | :--- | :--- | :--- | :--- |
| **Surfaces** | `bg-background` | `--background` | `#f8fafc` (slate-50) | Primary application background |
| | `bg-surface` | `--surface` | `#ffffff` | Primary panel and card background |
| | `bg-surface-muted` | `--surface-muted` | `#f1f5f9` (slate-100) | Secondary / muted surface background |
| | `bg-surface-elevated`| `--surface-elevated`| `#ffffff` | Elevated overlays and popovers |
| **Typography** | `text-foreground` | `--foreground` | `#020617` (slate-950) | High-contrast primary headings and text |
| | `text-foreground-secondary`| `--foreground-secondary`| `#475569` (slate-600) | Secondary body copy and labels |
| | `text-foreground-muted`| `--foreground-muted`| `#64748b` (slate-500) | Timestamps, metadata, captions |
| **Borders** | `border-border` | `--border` | `#e2e8f0` (slate-200) | Standard divider and card border |
| | `border-border-strong`| `--border-strong` | `#cbd5e1` (slate-300) | Input borders and high-contrast lines |
| **Brand (Slate Teal)**| `bg-brand`, `text-brand`| `--brand` | `#0f766e` (teal-700) | Primary branding, buttons, active tabs |
| | `bg-brand-hover` | `--brand-hover` | `#115e59` (teal-800) | Primary button hover state |
| | `bg-brand-soft` | `--brand-soft` | `#ccfbf1` (teal-100) | Highlight badges and soft pills |
| **Status: Success** | `text-success`, `bg-success-soft`| `--success` | `#15803d` / `#dcfce7` | Healthy ingestion, operational status |
| **Status: Warning** | `text-warning`, `bg-warning-soft`| `--warning` | `#b45309` / `#fef3c7` | Retry queue, processing delays |
| **Status: Danger** | `text-danger`, `bg-danger-soft` | `--danger` | `#b91c1c` / `#fee2e2` | Failed processing, errors, alerts |
| **Status: Info** | `text-info`, `bg-info-soft` | `--info` | `#0369a1` / `#e0f2fe` | System notifications, help tooltips |

---

## 2. Typography & Multilingual Strategy

- **Font Family Stack:** `Inter, "Noto Sans Sinhala", "Noto Sans Tamil", system-ui, sans-serif`
- **Sinhala & Tamil Script Support:** Script-aware line height (`line-height: 1.6`) applied via `:lang(si)`, `.lang-si`, `:lang(ta)`, `.lang-ta`, and `.script-aware-text` to prevent vertical glyph clipping.
- **Hierarchy Standard:**
  - `page-title` (32px–56px / font-extrabold / tracking-tight)
  - `page-intro` (16px / leading-relaxed / slate-600)
  - `eyebrow` (12px / uppercase tracking-widest / teal-700)
  - `SectionHeader` h2 (20px–24px / font-bold)

---

## 3. Container Primitives (`src/components/ui/container.tsx`)

| Primitive Name | Width Limit | Purpose |
| :--- | :--- | :--- |
| `ContainerReading` | `max-w-3xl` (768px) | Article detail signpost and long-form text |
| `ContainerContent` | `max-w-6xl` (1152px) | Standard public feeds, search, and personal pages |
| `ContainerWide` | `max-w-7xl` (1280px) | Story intelligence hubs and wide dashboards |
| `ContainerAdmin` | `max-w-7xl` (1280px) | Operational admin portal tables and analytics |
| `PageShell` | Variant-driven | Top-level container wrapper with standard gutters |

---

## 4. Reusable Primitives Component Index (`src/components/ui/`)

1. **`PageHeader`** (`src/components/ui/page-header.tsx`): Page title, eyebrow, intro, actions, and filter slot.
2. **`SectionHeader`** (`src/components/ui/section-header.tsx`): Section title, description, and action slot.
3. **`Surface`** (`src/components/ui/surface.tsx`): Panel and card background containers (`flat`, `elevated`, `muted`, `bordered`, `highlight`).
4. **`Button`** (`src/components/ui/button.tsx`): Standardized button variants (`primary`, `secondary`, `outline`, `ghost`, `danger`) and sizes (`sm`, `md`, `lg`).
5. **`FormControls`** (`src/components/ui/form-controls.tsx`): Reusable `Input`, `Select`, `Textarea`, `Checkbox`, and `FormField` wrappers.
6. **`StatusBadge`** (`src/components/ui/status-badge.tsx`): Status badges for `success`, `warning`, `danger`, `info`, `neutral`.
7. **`EmptyState`** (`src/components/ui/empty-state.tsx`): Zero-state card with title, description, icon, and action triggers.
8. **`ErrorState`** (`src/components/error-state.tsx`): Error panel supporting title, message, and optional `onRetry` callback.
9. **`Skeleton`** (`src/components/ui/skeleton.tsx`): Shimmer loading placeholders (`Skeleton`, `CardSkeleton`, `TableSkeleton`).
