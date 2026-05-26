/**
 * Resolve an S3 storage key to a displayable URL.
 * - If the key is already an absolute URL, return it as-is.
 * - Otherwise prefix it with NEXT_PUBLIC_S3_PUBLIC_URL when configured.
 */
export function storageUrl(key?: string | null): string {
  if (!key) return "";
  if (/^https?:\/\//i.test(key)) return key;
  const base = process.env.NEXT_PUBLIC_S3_PUBLIC_URL?.replace(/\/$/, "");
  if (!base) return key;
  return `${base}/${key.replace(/^\//, "")}`;
}
