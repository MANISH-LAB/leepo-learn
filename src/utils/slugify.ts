/**
 * Convert a string to a URL-friendly slug
 * Example: "Engineering Mathematics I" -> "engineering-mathematics-i"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Generate a unique slug by appending a counter if needed
 */
export function generateUniqueSlug(title: string, existingSlugs: string[]): string {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Build hierarchical URL path from slugs
 * Example: buildPath('cse', 'mathematics', 'calculus', 'derivatives')
 * Returns: '/cse/mathematics/calculus/derivatives'
 */
export function buildCoursePath(
  degreeSlug?: string,
  subjectSlug?: string,
  chapterSlug?: string,
  topicSlug?: string
): string {
  const parts = ['/courses'];

  if (degreeSlug) parts.push(degreeSlug);
  if (subjectSlug) parts.push(subjectSlug);
  if (chapterSlug) parts.push(chapterSlug);
  if (topicSlug) parts.push(topicSlug);

  return parts.join('/');
}

/**
 * Parse course path to extract slugs
 * Example: '/courses/cse/mathematics/calculus/derivatives'
 * Returns: { degreeSlug: 'cse', subjectSlug: 'mathematics', ... }
 */
export function parseCoursePath(pathname: string): {
  degreeSlug?: string;
  subjectSlug?: string;
  chapterSlug?: string;
  topicSlug?: string;
} {
  const parts = pathname.split('/').filter(Boolean);

  // Remove 'courses' from the beginning
  if (parts[0] === 'courses') {
    parts.shift();
  }

  return {
    degreeSlug: parts[0],
    subjectSlug: parts[1],
    chapterSlug: parts[2],
    topicSlug: parts[3],
  };
}
