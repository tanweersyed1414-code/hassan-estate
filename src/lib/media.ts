/**
 * Resolve which image should be the card / hero "featured" image for a
 * property or project.
 *
 * The admin form sends a `featuredImage` URL alongside the full list of
 * image URLs. That `featuredImage` can be stale — e.g. when editing an
 * existing record, the form pre-fills it with the previously saved value,
 * and if the editor then removes that image and uploads a new one, the
 * stale URL would otherwise be persisted (and no longer point at any real
 * image). Only honour `featuredImage` when it is still one of the images
 * actually being saved; otherwise fall back to the first image.
 */
export function resolveFeaturedImage(featuredImage: string, imageUrls: string[]): string {
  if (featuredImage && imageUrls.includes(featuredImage)) return featuredImage;
  return imageUrls[0] ?? "";
}
