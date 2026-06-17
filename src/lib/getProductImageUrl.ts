export function getProductImageUrl(
  imageUrl: string | null | undefined,
): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
}
