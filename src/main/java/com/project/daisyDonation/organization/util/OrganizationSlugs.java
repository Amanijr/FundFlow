package com.project.daisyDonation.organization.util;

import java.util.Locale;
import java.util.UUID;

import com.project.daisyDonation.organization.repository.OrganizationRepository;

public final class OrganizationSlugs {

    private static final int MAX_SLUG_LENGTH = 100;
    private static final int MAX_SUFFIX_ATTEMPTS = 999;

    private OrganizationSlugs() {
    }

    public static String normalize(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value
                .toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }

    public static String resolveUnique(
            OrganizationRepository organizationRepository,
            String requestedSlug,
            String organizationName) {
        String base = normalize(requestedSlug != null && !requestedSlug.isBlank()
                ? requestedSlug
                : organizationName);

        if (base.isEmpty()) {
            base = "organization";
        }

        base = trimBaseForSuffix(base);

        String candidate = base;
        int suffix = 2;

        while (organizationRepository.existsBySlugAndDeletedFalse(candidate)) {
            candidate = base + "-" + suffix;
            suffix++;
            if (suffix > MAX_SUFFIX_ATTEMPTS) {
                candidate = base + "-" + UUID.randomUUID().toString().substring(0, 8);
                if (!organizationRepository.existsBySlugAndDeletedFalse(candidate)) {
                    return candidate;
                }
            }
        }

        return candidate;
    }

    private static String trimBaseForSuffix(String base) {
        if (base.length() <= MAX_SLUG_LENGTH - 4) {
            return base;
        }
        return base.substring(0, MAX_SLUG_LENGTH - 4).replaceAll("-+$", "");
    }
}
