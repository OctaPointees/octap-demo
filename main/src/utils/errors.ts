import { ApiError } from "../services/mock/http";

/** Field-level validation errors returned by the (mock) API, if any. */
export function fieldErrorsOf(error: unknown): Record<string, string> {
  return error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {};
}

/** Top-level message to show when the error isn't tied to a field. */
export function formErrorOf(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError && error.fieldErrors) return null;
  return error instanceof Error ? error.message : "Something went wrong";
}
