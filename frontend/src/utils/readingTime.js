/**
 * Calculate estimated reading time for a given text.
 * @param {string} content
 * @param {number} wordsPerMinute - default 230 wpm
 * @returns {string}
 */
export function readingTime(content, wordsPerMinute = 230) {
  if (!content) return "1 min read";
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
