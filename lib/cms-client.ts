/**
 * CMS client – pobiera treść z lokalnego API lub zewnętrznego CMS
 * Użycie: getContentByKey('hero.title') → string | null
 */

const CMS_API_URL =
  process.env.NEXT_PUBLIC_CMS_API_URL ||
  (typeof window === 'undefined' ? 'http://localhost:3000' : '');

export async function getContentByKey(key: string, locale = 'pl'): Promise<string | null> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/content?key=${encodeURIComponent(key)}&locale=${locale}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.value ?? null;
  } catch {
    return null;
  }
}

export async function getContentByPage(slug: string, locale = 'pl'): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/content?page=${encodeURIComponent(slug)}&locale=${locale}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return {} as Record<string, string>;
    const data = await res.json();
    if (Array.isArray(data)) {
      return Object.fromEntries(data.map((c: { key: string; value: string }) => [c.key, c.value]));
    }
    return {} as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
}

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/settings`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return {} as Record<string, string>;
    const data = await res.json();
    if (Array.isArray(data)) {
      return Object.fromEntries(data.map((s: { key: string; value: string }) => [s.key, s.value]));
    }
    return {} as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
}

export async function getGallery(category?: string): Promise<{ id: string; url: string; alt: string; category: string }[]> {
  try {
    const url = category
      ? `${CMS_API_URL}/api/gallery?category=${encodeURIComponent(category)}`
      : `${CMS_API_URL}/api/gallery`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
