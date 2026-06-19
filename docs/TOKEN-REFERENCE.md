# YAYA Attendance — Design Token Reference
**Palette:** Gold & Noir  |  **Version:** 1.0

---

## How to use

Import `tokens.css` once at app root:
```css
/* app/globals.css */
@import './tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

In components, use CSS variables directly or via Tailwind classes:
```tsx
// CSS variable
<div style={{ background: 'var(--bg-brand)' }} />

// Tailwind (after merging tailwind.tokens.js into tailwind.config.ts)
<div className="bg-brand text-text-on-brand" />
```

---

## Color tokens

### Backgrounds
| Token | Value | Use |
|---|---|---|
| `--bg-page` | `#F8F4EE` | App shell, page background |
| `--bg-surface` | `#FFFFFF` | Cards, inputs, modals |
| `--bg-surface-alt` | `#F4F6F8` | Zebra rows, sub-panels |
| `--bg-brand` | `#0D1B2A` | Header, sidebar, nav bar |
| `--bg-brand-hover` | `#162436` | Header interactive hover |
| `--bg-accent` | `#C9A84C` | Primary CTA button bg |
| `--bg-accent-hover` | `#D4B96A` | CTA hover state |
| `--bg-success` | `#EAF5EF` | Present badge, confirmation bg |
| `--bg-error` | `#FDECEA` | Absent badge, error state bg |
| `--bg-overlay` | `rgba(13,27,42,0.55)` | Modal scrim |

### Text
| Token | Value | Use |
|---|---|---|
| `--text-primary` | `#0D1B2A` | Headlines, body copy, inputs |
| `--text-secondary` | `#5A6A7A` | Labels, captions, table headers |
| `--text-tertiary` | `#8B9AAD` | Placeholder, disabled state |
| `--text-on-brand` | `#FFFFFF` | Any text on navy surfaces |
| `--text-on-accent` | `#0D1B2A` | Text on gold button |
| `--text-accent` | `#8B6914` | Gold text on light backgrounds |
| `--text-success` | `#2D6A4F` | Present status, positive delta |
| `--text-error` | `#C0392B` | Absent, closed session, errors |
| `--text-link` | `#A67E1A` | Inline links |

### Borders
| Token | Value | Use |
|---|---|---|
| `--border-default` | `#DDE3EA` | Input, card borders |
| `--border-subtle` | `rgba(13,27,42,0.08)` | Faint table dividers |
| `--border-strong` | `#2A3F57` | Emphasis borders |
| `--border-accent` | `#C9A84C` | Focus ring color, active states |
| `--border-success` | `#2D6A4F` | Success-state borders |
| `--border-error` | `#C0392B` | Error-state borders |

---

## Typography

### Font families
| Token | Stack | Use |
|---|---|---|
| `--font-display` | Fraunces, Georgia, serif | Welcome screens, confirmation name, hero moments only |
| `--font-body` | Manrope, system-ui, sans-serif | All UI — labels, inputs, tables, buttons, body copy |
| `--font-mono` | JetBrains Mono, Fira Code, mono | Codes, tokens (rare) |

### Type scale
| Token | Size | Use |
|---|---|---|
| `--text-xs` | 11px | Timestamps, micro-labels, badge text |
| `--text-sm` | 12px | Table cells, captions, tag text |
| `--text-base` | 14px | Body copy, input values, button labels |
| `--text-md` | 16px | Primary body, field labels |
| `--text-lg` | 18px | Section headings, card titles |
| `--text-xl` | 22px | Page titles (admin) |
| `--text-2xl` | 28px | Confirmation name ("Welcome back, Emeka") |
| `--text-3xl` | 36px | Hero moments (use sparingly) |

### Weights
| Token | Value | Use |
|---|---|---|
| `--weight-regular` | 400 | Body copy, input values |
| `--weight-medium` | 500 | Labels, headings, button text |
| `--weight-semibold` | 600 | Badge text, uppercase micro-labels |

---

## Spacing (4px base unit)
`--space-1` = 4px · `--space-2` = 8px · `--space-3` = 12px · `--space-4` = 16px  
`--space-5` = 20px · `--space-6` = 24px · `--space-8` = 32px · `--space-10` = 40px  
`--space-12` = 48px · `--space-16` = 64px

---

## Border radius
| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 4px | Badges, small pills |
| `--radius-md` | 8px | Inputs, buttons, small cards |
| `--radius-lg` | 12px | Cards, panels |
| `--radius-xl` | 16px | Modal bottom sheets |
| `--radius-2xl` | 24px | Phone-style frames, large surfaces |
| `--radius-full` | 9999px | Pills, avatars, dot indicators |

---

## Component tokens (quick reference)

### Check-in header
```
bg: --header-bg (#0D1B2A)
logo dot: --header-logo-bg (#C9A84C) on --header-logo-text (#0D1B2A)
text: --header-text (#FFFFFF)
muted text: --header-text-muted (rgba white 50%)
```

### Primary CTA button
```
bg: --btn-primary-bg (#C9A84C)
bg hover: --btn-primary-bg-hover (#D4B96A)
text: --btn-primary-text (#0D1B2A)
radius: --btn-primary-radius (8px)
font: --font-body, --weight-semibold
```

### Inputs
```
bg: --input-bg (#FFFFFF)
border default: --input-border (#DDE3EA)
border focus: --input-border-focus (#C9A84C)
border error: --input-border-error (#C0392B)
focus ring: --focus-ring (0 0 0 3px rgba(201,168,76,0.35))
```

### Department pills
```
default: bg #FFFFFF, border #DDE3EA, text #5A6A7A
active: bg #0D1B2A, border #0D1B2A, text #FFFFFF
```

### Confirmation halo (signature element)
```
outer ring: rgba(201,168,76,0.22)
inner ring: rgba(201,168,76,0.44)
check circle bg: #0D1B2A
check icon: #C9A84C
name font: --font-display, --weight-regular, --text-2xl
```

### Status badges
```
Present: bg #EAF5EF, text #2D6A4F
Absent:  bg #FDECEA, text #C0392B
```

### Admin sidebar
```
bg: #0D1B2A
inactive item text: rgba(255,255,255,0.55)
active item bg: rgba(201,168,76,0.15)
active item text: #D4B96A
```

---

## Google Fonts import

Add to `app/layout.tsx` or `_document.tsx`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;1,300;1,400&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet" />
```

---

## Tailwind config integration

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import yaTokens from './yaya-design-tokens/tailwind.tokens'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      ...yaTokens,
    },
  },
  plugins: [],
}

export default config
```
