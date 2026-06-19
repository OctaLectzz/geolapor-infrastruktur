import { NextResponse } from 'next/server'

import type { ApiResponse } from '@/types/api-response'

/**
 * Build a success API response.
 *
 * @param data    - The payload to return to the client.
 * @param message - A human-readable success description (use translation keys
 *                  when the caller is constructing user-facing text).
 * @param status  - HTTP status code (defaults to 200).
 */
export function successResponse<T>(data: T, message: string, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json<ApiResponse<T>>({ success: true, data, message }, { status })
}

/**
 * Build an error API response.
 *
 * @param message - A safe, user-facing error description. Never expose
 *                  internal stack traces or database error details.
 * @param status  - HTTP status code (defaults to 400).
 */
export function errorResponse(message: string, status: number = 400): NextResponse<ApiResponse<null>> {
  return NextResponse.json<ApiResponse<null>>({ success: false, data: null, message }, { status })
}
