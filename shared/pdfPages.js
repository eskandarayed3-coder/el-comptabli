export const MAX_OCR_PDF_PAGES = 4;

// For long documents, capture the beginning plus the final summary page while
// preserving page order and a hard provider-cost ceiling.
export function selectPdfPages(totalPages, maxPages = MAX_OCR_PDF_PAGES) {
  const total = Number(totalPages);
  const max = Number(maxPages);
  if (!Number.isInteger(total) || total < 1 || !Number.isInteger(max) || max < 1) return [];
  if (total <= max) return Array.from({ length: total }, (_, index) => index + 1);
  if (max === 1) return [1];
  return [...Array.from({ length: max - 1 }, (_, index) => index + 1), total];
}
