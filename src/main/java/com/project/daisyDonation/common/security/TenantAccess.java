package com.project.daisyDonation.common.security;

import com.project.daisyDonation.auth.entity.Role;
import com.project.daisyDonation.common.exception.UnauthorizedException;

public final class TenantAccess {

    private TenantAccess() {
    }

    public static Long requireOrganizationId(UserPrincipal principal) {
        Long organizationId = TenantContext.getOrganizationId();
        if (organizationId == null) {
            organizationId = principal.getOrganizationId();
        }

        if (organizationId == null) {
            if (principal.getRole() == Role.SUPER_ADMIN) {
                throw new UnauthorizedException(
                        "Organization context is required. Provide the X-Organization-Id header.");
            }
            throw new UnauthorizedException("Organization context is required");
        }

        return organizationId;
    }
}
