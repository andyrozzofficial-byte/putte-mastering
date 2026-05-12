/**
 * Whole USD amounts stored as integers in the database (e.g. 60, 80).
 * Use this for all customer-facing price strings — do not mix with other currencies.
 */
export function formatPrice(amount: number): string {
  const n = Math.trunc(amount);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}
