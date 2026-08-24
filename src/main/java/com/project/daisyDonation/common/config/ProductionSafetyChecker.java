package com.project.daisyDonation.common.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Profile("prod")
@Order(0)
@Slf4j
public class ProductionSafetyChecker implements ApplicationRunner {

    private static final List<String> FORBIDDEN_SECRET_FRAGMENTS = List.of(
            "change-me",
            "replace-with",
            "replace-bootstrap",
            "local-dev");

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.platform.bootstrap-secret}")
    private String bootstrapSecret;

    @Value("${app.dev.seed-enabled}")
    private boolean seedEnabled;

    @Value("${app.cors.allowed-origins}")
    private String corsOrigins;

    @Override
    public void run(ApplicationArguments args) {
        if (seedEnabled) {
            throw new IllegalStateException(
                    "Production profile cannot run with demo seed enabled (app.dev.seed-enabled=true).");
        }
        validateSecret("JWT_SECRET", jwtSecret, 32);
        validateSecret("PLATFORM_BOOTSTRAP_SECRET", bootstrapSecret, 16);
        if (corsOrigins == null || corsOrigins.isBlank()) {
            throw new IllegalStateException("Production profile requires CORS_ALLOWED_ORIGINS.");
        }
        log.info("Production profile active: demo seed disabled, Swagger disabled, secrets validated.");
    }

    private void validateSecret(String name, String value, int minLength) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Production profile requires " + name + " to be set.");
        }
        if (value.length() < minLength) {
            throw new IllegalStateException(name + " must be at least " + minLength + " characters.");
        }
        String lower = value.toLowerCase();
        for (String fragment : FORBIDDEN_SECRET_FRAGMENTS) {
            if (lower.contains(fragment)) {
                throw new IllegalStateException(
                        name + " still looks like a sample/dev value. Set a unique production secret.");
            }
        }
    }
}
