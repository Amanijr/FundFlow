package com.project.daisyDonation.common.security;

public final class TokenTypeValidator {

    private TokenTypeValidator() {
    }

    public static boolean isPublicPath(String path) {
        return path.startsWith("/api/v1/auth/login")
                || path.startsWith("/api/v1/auth/register")
                || path.startsWith("/api/v1/platform/bootstrap")
                || path.startsWith("/api/v1/platform/auth/login");
    }

    public static boolean isPlatformPath(String path) {
        return path.startsWith("/api/v1/platform/");
    }

    public static boolean allows(TokenType actual, String path) {
        if (actual == null) {
            return false;
        }
        if (isPlatformPath(path)) {
            return actual == TokenType.PLATFORM;
        }
        return actual == TokenType.TENANT || actual == TokenType.IMPERSONATION;
    }
}
