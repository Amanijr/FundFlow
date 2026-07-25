package com.project.daisyDonation.common.service;

import com.project.daisyDonation.auth.entity.Role;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.organization.entity.Organization;

public final class PlatformAccess {

    private PlatformAccess() {
    }

    public static boolean isSuperAdmin(UserPrincipal principal) {
        return principal != null && principal.getRole() == Role.SUPER_ADMIN;
    }

    public static void requireSuperAdmin(UserPrincipal principal) {
        if (!isSuperAdmin(principal)) {
            throw new BadRequestException("This feature is only available for platform super administrators");
        }
    }

    public static void requireSuperAdmin(Organization organization, UserPrincipal principal) {
        requireSuperAdmin(principal);
        if (organization == null) {
            throw new BadRequestException("Organization is required");
        }
    }
}
