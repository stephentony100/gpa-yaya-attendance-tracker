/**
 * YAYA Attendance — Tailwind Theme Config
 * Palette: Gold & Noir
 * Version: 1.0
 *
 * Extends Tailwind's default theme so every token in tokens.css
 * is usable as a Tailwind class (e.g. bg-brand, text-accent, etc.)
 *
 * Usage: merge this into the `theme.extend` block of tailwind.config.ts
 */

const tokens = {
  colors: {
    // ── Raw palette ──────────────────────────────────────────────
    navy: {
      50:  '#EBF0F6',
      100: '#C8D6E5',
      200: '#9AAFC6',
      600: '#2A3F57',
      700: '#1E2F44',
      800: '#162436',
      900: '#0D1B2A',  // primary brand
      950: '#060D14',
    },
    gold: {
      50:  '#FAF5E4',
      100: '#F5ECCC',
      200: '#EDD99A',
      400: '#D4B96A',
      500: '#C9A84C',  // crown gold accent
      600: '#A67E1A',
      700: '#8B6914',  // gold text on light
    },
    parchment: '#F8F4EE',

    // ── Semantic aliases ─────────────────────────────────────────
    // Use these in components — not raw navy/gold above.

    brand:   '#0D1B2A',   // bg-brand, text-brand
    accent:  '#C9A84C',   // bg-accent, text-accent
    success: '#2D6A4F',
    error:   '#C0392B',
    warning: '#D97706',

    // Surfaces
    page:        '#F8F4EE',
    surface:     '#FFFFFF',
    'surface-alt': '#F4F6F8',

    // Text
    'text-primary':   '#0D1B2A',
    'text-secondary': '#5A6A7A',
    'text-tertiary':  '#8B9AAD',
    'text-on-brand':  '#FFFFFF',
    'text-on-accent': '#0D1B2A',
    'text-accent':    '#8B6914',
    'text-success':   '#2D6A4F',
    'text-error':     '#C0392B',
    'text-link':      '#A67E1A',

    // Borders
    'border-default': '#DDE3EA',
    'border-accent':  '#C9A84C',
    'border-success': '#2D6A4F',
    'border-error':   '#C0392B',
  },

  fontFamily: {
    display: ['Fraunces', 'Georgia', 'serif'],
    body:    ['Manrope', 'system-ui', 'sans-serif'],
    mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
  },

  fontSize: {
    'xs':   ['0.6875rem', { lineHeight: '1rem' }],       // 11px
    'sm':   ['0.75rem',   { lineHeight: '1.125rem' }],   // 12px
    'base': ['0.875rem',  { lineHeight: '1.375rem' }],   // 14px
    'md':   ['1rem',      { lineHeight: '1.5rem' }],     // 16px
    'lg':   ['1.125rem',  { lineHeight: '1.625rem' }],   // 18px
    'xl':   ['1.375rem',  { lineHeight: '1.75rem' }],    // 22px
    '2xl':  ['1.75rem',   { lineHeight: '2.125rem' }],   // 28px
    '3xl':  ['2.25rem',   { lineHeight: '2.75rem' }],    // 36px
  },

  fontWeight: {
    regular:  '400',
    medium:   '500',
    semibold: '600',
  },

  letterSpacing: {
    tight:  '-0.01em',
    normal:  '0',
    wide:    '0.04em',
    wider:   '0.08em',
  },

  spacing: {
    // Tailwind's default scale is kept; these add named aliases.
    '1':  '0.25rem',   //  4px
    '2':  '0.5rem',    //  8px
    '3':  '0.75rem',   // 12px
    '4':  '1rem',      // 16px
    '5':  '1.25rem',   // 20px
    '6':  '1.5rem',    // 24px
    '8':  '2rem',      // 32px
    '10': '2.5rem',    // 40px
    '12': '3rem',      // 48px
    '16': '4rem',      // 64px
  },

  borderRadius: {
    'sm':   '4px',
    'md':   '8px',
    'lg':   '12px',
    'xl':   '16px',
    '2xl':  '24px',
    'full': '9999px',
  },

  boxShadow: {
    'none': 'none',
    'sm':   '0 1px 3px rgba(13, 27, 42, 0.08)',
    'md':   '0 4px 12px rgba(13, 27, 42, 0.10)',
    'focus': '0 0 0 3px rgba(201, 168, 76, 0.35)',
    'focus-error': '0 0 0 3px rgba(192, 57, 43, 0.25)',
  },

  transitionDuration: {
    fast:  '100ms',
    base:  '175ms',
    slow:  '300ms',
  },

  transitionTimingFunction: {
    base:   'ease',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  zIndex: {
    base:     '0',
    raised:   '10',
    dropdown: '100',
    modal:    '200',
    toast:    '300',
  },
};

module.exports = tokens;
