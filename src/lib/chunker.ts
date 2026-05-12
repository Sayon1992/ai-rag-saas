const CHUNK_SIZE = 1_500;   // characters
const CHUNK_OVERLAP = 200;  // characters

// Normalize common typographic glyphs to their ASCII equivalents for
// consistency across chunks. Postgres + UTF-8 handles any remaining Unicode
// natively — no destructive stripping needed.
function sanitize(text: string): string {
  return text
    .normalize('NFC')           // compose decomposed chars first (e + ´ → é)
    .replace(/[‘’‚‛′‵]/g, "'") // smart single quotes
    .replace(/[“”„‟″‶]/g, '"') // smart double quotes
    .replace(/[–—―]/g, '-')                   // en/em/horizontal dash
    .replace(/…/g, '...')                                // ellipsis
    .replace(/[•‣◦⁃]/g, '*')             // bullets
    .replace(/ /g, ' ');                                 // non-breaking space
}

export function chunkText(text: string): string[] {
  const normalized = sanitize(text).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (normalized.length <= CHUNK_SIZE) return [normalized];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = start + CHUNK_SIZE;

    if (end < normalized.length) {
      // Prefer splitting at paragraph boundary
      const paragraphBreak = normalized.lastIndexOf('\n\n', end);
      if (paragraphBreak > start + CHUNK_SIZE / 2) {
        end = paragraphBreak;
      } else {
        // Fall back to sentence boundary
        const sentenceBreak = normalized.lastIndexOf('. ', end);
        if (sentenceBreak > start + CHUNK_SIZE / 2) {
          end = sentenceBreak + 1;
        }
      }
    }

    chunks.push(normalized.slice(start, end).trim());
    start = end - CHUNK_OVERLAP;
  }

  return chunks.filter(c => c.length > 50);
}
