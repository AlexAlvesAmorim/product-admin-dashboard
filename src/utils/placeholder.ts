// Inline SVG placeholder for locally created products.
// The add/edit form has no image upload, and hotlinking a random external
// image would be a worse dependency than a self-contained data URI.
export const PLACEHOLDER_THUMBNAIL =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#e4e4e7"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#71717a">No image</text></svg>`,
  );
