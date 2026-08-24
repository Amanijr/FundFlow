package com.project.daisyDonation.common.security;

import java.io.IOException;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String authHeader = request.getHeader("Authorization");

        if (TokenTypeValidator.isPublicPath(path)
                || authHeader == null
                || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            try {
                String token = authHeader.substring(7);
                Claims claims = jwtService.parseClaims(token);
                String email = claims.getSubject();

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    if (jwtService.isTokenValid(token, email)) {
                        TokenType tokenType = jwtService.resolveTokenType(claims);
                        if (!TokenTypeValidator.allows(tokenType, path)) {
                            filterChain.doFilter(request, response);
                            return;
                        }

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);

                        Long organizationId = claims.get("organizationId", Long.class);
                        if (organizationId != null) {
                            TenantContext.setOrganizationId(organizationId);
                        } else if (userDetails instanceof UserPrincipal principal
                                && principal.getRole() == com.project.daisyDonation.auth.entity.Role.SUPER_ADMIN) {
                            String orgHeader = request.getHeader("X-Organization-Id");
                            if (orgHeader != null && !orgHeader.isBlank()) {
                                TenantContext.setOrganizationId(Long.parseLong(orgHeader.trim()));
                            }
                        }
                    }
                }
            } catch (Exception ignored) {
                SecurityContextHolder.clearContext();
            }

            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
