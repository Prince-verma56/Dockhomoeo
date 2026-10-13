/**
 * Kebab-case slug, matching the backend's catalogue slugs:
 * "Dr. Reckeweg" → "dr-reckeweg", "Women's Health" → "womens-health".
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
