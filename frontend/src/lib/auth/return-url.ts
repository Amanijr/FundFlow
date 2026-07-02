const BLOCKED_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password", "/mfa"];

export function isAllowedReturnUrl(url: string | null | undefined): url is string {
  if (!url || !url.startsWith("/") || url.startsWith("//")) {
    return false;
  }
  return !BLOCKED_PREFIXES.some((prefix) => url === prefix || url.startsWith(`${prefix}?`));
}

export function resolvePostLoginPath(returnUrl: string | null, defaultPath: string) {
  return isAllowedReturnUrl(returnUrl) ? returnUrl : defaultPath;
}
