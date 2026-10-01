import colors from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';

/**
 * Theming: colours resolve through CSS variables, so `data-theme="light"` re-skins any subtree.
 *  - App.jsx keeps the top bar + sidebar on `data-theme="dark"` and applies the chosen theme to the main window only.
 *  - Semantic tokens (page, surface, inset, raised, panel, ink, fg…) cover surfaces, borders and text.
 *  - Accent palettes keep their names; the shades used as text (200–400) and as dark tints (900–950)
 *    flip to readable equivalents in light mode. Mid shades (500–800) are identical in both themes.
 *  - Dark values equal Tailwind's defaults, so dark mode renders exactly as before.
 */
const HUES = [
  'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
  'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
];
const ACCENT_SHADES = { 100: '800', 200: '800', 300: '700', 400: '600', 900: '100', 950: '100' };
// Slate flips end to end: dark fills become light fills, light text becomes dark text
const SLATE_FLIP = { 50: '950', 100: '900', 200: '900', 300: '800', 400: '700', 500: '600', 600: '400', 700: '300', 800: '200', 900: '100', 950: '50' };

const channels = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};
const ref = (name) => `rgb(var(${name}) / <alpha-value>)`;

const themed = {};   // tailwind colour config
const dark = {};     // :root variables
const light = {};    // [data-theme="light"] variables

for (const hue of HUES) {
  themed[hue] = {};
  for (const [shade, lightShade] of Object.entries(ACCENT_SHADES)) {
    const v = `--c-${hue}-${shade}`;
    themed[hue][shade] = ref(v);
    dark[v] = channels(colors[hue][shade]);
    light[v] = channels(colors[hue][lightShade]);
  }
}
themed.slate = {};
for (const [shade, flipped] of Object.entries(SLATE_FLIP)) {
  const v = `--c-slate-${shade}`;
  themed.slate[shade] = ref(v);
  dark[v] = channels(colors.slate[shade]);
  light[v] = channels(colors.slate[flipped]);
}

const TOKENS = {
  //          dark          light
  page:    ['7 11 20',    '211 218 228'],
  panel:   ['14 21 38',   '224 229 237'],
  surface: ['16 23 38',   '234 238 244'],
  raised:  ['19 28 51',   '228 233 240'],
  inset:   ['11 15 25',   '218 224 233'],
  ink:     ['255 255 255', '10 15 28'],   // "white with alpha" overlays: borders, hover fills
  fg:      ['255 255 255', '8 12 24'],
  fg2:     ['203 213 225', '24 32 48'],
  fg3:     ['148 163 184', '44 55 74'],
  fg4:     ['100 116 139', '71 82 100'],
};
const tokenColors = {};
for (const [name, [d, l]] of Object.entries(TOKENS)) {
  tokenColors[name] = ref(`--${name}`);
  dark[`--${name}`] = d;
  light[`--${name}`] = l;
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ...themed,
        ...tokenColors,
        onbright: '#020617', // dark text that sits on bright accent fills; identical in both themes
        nexus: {
          bg: '#0a0e17',
          card: '#111726',
          'card-hover': '#161f33',
          border: 'rgba(255, 255, 255, 0.08)',
          cyan: '#00f2fe',
          teal: '#059669',
          pink: '#ec4899',
          orange: '#f97316',
          purple: '#8b5cf6',
          green: '#22c55e',
        },
      },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ':root, [data-theme="dark"]': { ...dark },
        '[data-theme="light"]': { ...light },
      });
    }),
  ],
};
