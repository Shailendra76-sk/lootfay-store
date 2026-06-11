/**
 * Generates a URL-friendly slug from a product title and ID.
 * Appending the ID guarantees uniqueness and prevents 404s if titles change.
 * Example: "Boat Airdopes 800", "123" -> "boat-airdopes-800-123"
 */
export function generateSlug(title: string, id: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
      .trim()
      .slice(0, 60) + // Limit length for SEO
    `-${id}`
  );
}

/**
 * Extracts the product ID from a generated slug.
 * Example: "boat-airdopes-800-123" -> "123"
 */
export function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split("-");
  return parts.length > 0 ? parts[parts.length - 1] : null;
}
