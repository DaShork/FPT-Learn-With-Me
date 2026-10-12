// Fetch wrapper with version busting để admin cập nhật dữ liệu không bị cache.
const VERSION = Date.now();

export async function fetchJSON(url) {
  const sep = url.includes('?') ? '&' : '?';
  const res = await fetch(`${url}${sep}v=${VERSION}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} khi tải ${url}`);
  return res.json();
}

export async function fetchText(url) {
  const sep = url.includes('?') ? '&' : '?';
  const res = await fetch(`${url}${sep}v=${VERSION}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} khi tải ${url}`);
  return res.text();
}