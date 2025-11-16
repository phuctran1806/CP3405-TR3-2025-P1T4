import { API_BASE_URL } from '@/api/config';

export function resolveAssetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:/i.test(path)) return path;
  const normalized = path.replace(/^\/+/, '');
  return `${API_BASE_URL}/${normalized}`;
}
