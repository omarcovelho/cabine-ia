/** Prefix API-relative paths for Vite dev proxy (`/api` → Nest on :3000). */
export function toApiUrl(path: string): string {
  if (path.startsWith('/api/')) {
    return path;
  }
  if (path.startsWith('/')) {
    return `/api${path}`;
  }
  return `/api/${path}`;
}
