// ─── Chunking Configuration ─────────────────────────────

/** Maximum number of characters per chunk. */
const CHUNK_SIZE = 1000;

/** Number of overlapping characters between consecutive chunks. */
const CHUNK_OVERLAP = 200;

/**
 * Ordered list of separators to try when splitting text.
 * The splitter walks this list from most meaningful (paragraph break)
 * to least meaningful (single character) until it can produce chunks
 * that fit within CHUNK_SIZE.
 */
const SPLIT_SEPARATORS: readonly string[] = [
  "\n\n", // paragraph
  "\n",   // line break
  ". ",   // sentence (period)
  "! ",   // sentence (exclamation)
  "? ",   // sentence (question)
  " ",    // word
  "",     // character-level fallback
];

export { CHUNK_SIZE, CHUNK_OVERLAP, SPLIT_SEPARATORS };
