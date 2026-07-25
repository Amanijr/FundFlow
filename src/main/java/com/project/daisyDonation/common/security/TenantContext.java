package com.project.daisyDonation.common.security;

public final class TenantContext {

    private static final ThreadLocal<Long> CURRENT_ORGANIZATION_ID = new ThreadLocal<>();

    private TenantContext() {
    }

    public static void setOrganizationId(Long organizationId) {
        CURRENT_ORGANIZATION_ID.set(organizationId);
    }

    public static Long getOrganizationId() {
        return CURRENT_ORGANIZATION_ID.get();
    }

    public static void clear() {
        CURRENT_ORGANIZATION_ID.remove();
    }
}
