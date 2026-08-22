package com.project.daisyDonation.common.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.project.daisyDonation.auth.entity.Role;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private static final String CLAIM_USER_ID = "userId";
    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_ORGANIZATION_ID = "organizationId";
    private static final String CLAIM_TOKEN_TYPE = "tokenType";

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateTenantToken(Long userId, String email, Role role, Long organizationId) {
        return issueToken(userId, email, role, organizationId, TokenType.TENANT);
    }

    public String generatePlatformToken(Long userId, String email, Role role) {
        return issueToken(userId, email, role, null, TokenType.PLATFORM);
    }

    public String generateImpersonationToken(Long userId, String email, Long organizationId) {
        return issueToken(userId, email, Role.SUPER_ADMIN, organizationId, TokenType.IMPERSONATION);
    }

    public String generateToken(Long userId, String email, Role role, Long organizationId) {
        if (organizationId == null && role == Role.SUPER_ADMIN) {
            return generatePlatformToken(userId, email, role);
        }
        return generateTenantToken(userId, email, role, organizationId);
    }

    public TokenType resolveTokenType(Claims claims) {
        String raw = claims.get(CLAIM_TOKEN_TYPE, String.class);
        if (raw != null && !raw.isBlank()) {
            try {
                return TokenType.valueOf(raw);
            } catch (IllegalArgumentException ignored) {
                return null;
            }
        }
        return claims.get(CLAIM_ORGANIZATION_ID) != null ? TokenType.TENANT : TokenType.PLATFORM;
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token, String email) {
        Claims claims = parseClaims(token);
        return email.equals(claims.getSubject()) && claims.getExpiration().after(new Date());
    }

    private String issueToken(Long userId, String email, Role role, Long organizationId, TokenType tokenType) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        var builder = Jwts.builder()
                .subject(email)
                .claim(CLAIM_USER_ID, userId)
                .claim(CLAIM_ROLE, role.name())
                .claim(CLAIM_TOKEN_TYPE, tokenType.name())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey);

        if (organizationId != null) {
            builder.claim(CLAIM_ORGANIZATION_ID, organizationId);
        }

        return builder.compact();
    }
}
