/**
 * Returns the official Steam vertical cover image (2:3 aspect ratio) if steam_appid is available,
 * otherwise falls back to the database-provided thumbnail link.
 */
export function getProductThumbnail(product) {
  if (product && product.steam_appid) {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${product.steam_appid}/library_600x900_2x.jpg`;
  }
  return product?.product_thumbnail_link;
}

/**
 * Returns an array of screenshot/asset URLs for the product.
 * If steam_appid is available, it filters and ensures the screenshots point to the official Steam CDN.
 * If no secondary screenshots are saved in the database but steam_appid is present, it generates
 * fallback landscape assets from Steam (capsule and header).
 */
export function getProductGallery(product) {
  if (!product) return [];

  // Filter secondary images from DB (excluding the vertical thumbnail)
  const dbSecondary = (product.product_images ?? [])
    .filter(img => img.link && img.link !== product.product_thumbnail_link)
    .map(img => img.link);

  if (product.steam_appid) {
    // If we have screenshots in DB, return them (they are already Steam URLs or custom)
    if (dbSecondary.length > 0) {
      return dbSecondary;
    }
    // Fallback horizontal assets from Steam if no screenshots are in DB
    return [
      `https://cdn.cloudflare.steamstatic.com/steam/apps/${product.steam_appid}/capsule_616x353.jpg`,
      `https://cdn.cloudflare.steamstatic.com/steam/apps/${product.steam_appid}/header.jpg`
    ];
  }

  return dbSecondary;
}
