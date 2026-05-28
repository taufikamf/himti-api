/**
 * Generates a URL-friendly slug from a string
 * @param text The text to convert to a slug
 * @returns The slug
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Ensures a slug is unique by appending a number if necessary
 * @param slug The base slug
 * @param existingSlug Function to check if a slug already exists
 * @returns A unique slug
 */
export async function ensureUniqueSlug(
  slug: string,
  existingSlug: (slug: string) => Promise<boolean>
): Promise<string> {
  let uniqueSlug = slug;
  let counter = 0;
  
  while (await existingSlug(uniqueSlug)) {
    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }
  
  return uniqueSlug;
} 