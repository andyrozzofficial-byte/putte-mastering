import { NextResponse } from "next/server";

/** Standard error shape for API routes (always JSON). */
export function apiJsonError(message: string, status = 400) {
  return NextResponse.json({ success: false as const, error: message }, { status });
}

/** Standard success shape for API routes (always JSON). */
export function apiJsonSuccess<T extends Record<string, unknown>>(data: T) {
  return NextResponse.json({ success: true as const, ...data });
}
