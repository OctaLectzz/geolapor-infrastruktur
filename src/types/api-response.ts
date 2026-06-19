/**
 * Standard API response envelope used by all internal API routes.
 *
 * Every API handler must return this shape so clients can rely on
 * a consistent contract for success checks, payload access, and
 * user-facing messages.
 */
export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string
}
