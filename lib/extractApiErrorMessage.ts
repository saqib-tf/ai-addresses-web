import { ErrorMessageDto } from "@/models/ErrorMessageDto";
import type { AxiosError } from "axios";

/**
 * Extracts a user-friendly error message from an AxiosError or unknown error.
 * If the error is an API error with ErrorMessageDto, returns its message and detail.
 * Otherwise, returns a generic or fallback message.
 */
export function extractApiErrorMessage(
  err: unknown,
  fallback = "An unexpected error occurred."
): string {
  const axiosErr = err as AxiosError;
  if (axiosErr && axiosErr.response && axiosErr.response.data) {
    const data = axiosErr.response.data;
    if (typeof data === "object" && data !== null && "message" in data) {
      const errorDto = data as ErrorMessageDto;
      let msg = errorDto.message;
      if (errorDto.detail) msg += `: ${errorDto.detail}`;
      return msg;
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
