// Indian-locale formatters used across the app.

/** Formats a number as Indian rupees with lakh / crore suffixes. */
export function formatPrice(amount: number | string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (!isFinite(n)) return "—";
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

/** Formats area in square feet. */
export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString("en-IN")} sqft`;
}

/** Pretty-prints a property type or other UPPER_SNAKE enum. */
export function humanise(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
