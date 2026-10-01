/** Darkens an accent hex in the light theme so inline-coloured text stays readable (no-op in dark). */
export const tone = (hex) => `color-mix(in srgb, ${hex}, rgb(var(--fg)) var(--tone-mix))`;
