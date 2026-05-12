export function isTestMode(): boolean {
  const v = process.env.NEXT_PUBLIC_TEST_MODE?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

