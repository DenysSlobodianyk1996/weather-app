/** Reads a CSS custom property from :root, e.g. cssVar('--color-accent'). Canvas code uses it to share the theme. */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
