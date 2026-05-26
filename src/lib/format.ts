/** Shared formatting helpers for the admin panel. */

/** Whole-dollar USD value (e.g. priceDiyUsd = 49 -> "$49.00"). */
export function formatUsd(dollars?: number | null) {
  if (dollars === undefined || dollars === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
}

/** USD value stored in cents (e.g. amountUsdCents = 4900 -> "$49.00"). */
export function formatUsdCents(cents?: number | null) {
  if (cents === undefined || cents === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatBytes(bytes?: number | null) {
  if (bytes === undefined || bytes === null || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

/** Generate a URL-safe slug from a title. */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Pull a human-readable message off an axios/unknown error. */
export function errorMessage(err: unknown, fallback = "Something went wrong") {
  const e = err as
    | { response?: { data?: { message?: string } }; message?: string }
    | undefined;
  return e?.response?.data?.message || e?.message || fallback;
}
