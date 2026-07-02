import { ApiError } from "@/types/api";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  ACCOUNT_LOCKED: "Your account has been locked. Contact your administrator.",
  ACCOUNT_DISABLED: "This account has been disabled.",
  PASSWORD_EXPIRED: "Your password has expired. Reset your password to continue.",
  MFA_INVALID_CODE: "Invalid verification code. Please try again.",
  MFA_EXPIRED: "Verification session expired. Sign in again.",
  MFA_LOCKED: "Too many attempts. Try again in 15 minutes.",
  TOKEN_EXPIRED: "Your session has expired. Sign in again.",
  TOKEN_INVALID: "Your session is invalid. Sign in again.",
  RESET_TOKEN_EXPIRED: "This reset link has expired. Request a new one.",
  RESET_TOKEN_INVALID: "This reset link is invalid. Request a new one.",
  NETWORK_ERROR: "Unable to connect. Check your internet connection and try again.",
};

export function mapAuthError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code && AUTH_ERROR_MESSAGES[error.code]) {
      return AUTH_ERROR_MESSAGES[error.code];
    }
    if (error.status === 401) {
      return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS;
    }
    if (error.status === 429) {
      return "Too many attempts. Please wait a moment and try again.";
    }
    if (error.status >= 500) {
      return "Something went wrong on our end. Please try again later.";
    }
    return error.message || "Unable to complete this action.";
  }
  if (error instanceof TypeError) {
    return AUTH_ERROR_MESSAGES.NETWORK_ERROR;
  }
  return "An unexpected error occurred. Please try again.";
}
