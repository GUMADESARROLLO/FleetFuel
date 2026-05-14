export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('data:')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const encoded = encodeURIComponent(path);
  return `/api/image-proxy?path=${encoded}`;
}
