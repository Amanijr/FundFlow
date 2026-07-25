package com.project.daisyDonation.common.service;

import java.util.Set;

import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.organization.entity.OrganizationType;

public final class VerticalAccess {

    private static final Set<OrganizationType> CHURCH_TYPES = Set.of(
            OrganizationType.CHURCH,
            OrganizationType.RELIGIOUS_INSTITUTION);

    private static final Set<OrganizationType> NGO_TYPES = Set.of(
            OrganizationType.NGO,
            OrganizationType.FOUNDATION,
            OrganizationType.CHARITY,
            OrganizationType.COMMUNITY_ORGANIZATION);

    private static final Set<OrganizationType> SCHOOL_TYPES = Set.of(
            OrganizationType.SCHOOL);

    private VerticalAccess() {
    }

    public static boolean isChurch(Organization organization) {
        return CHURCH_TYPES.contains(organization.getType());
    }

    public static boolean isNgo(Organization organization) {
        return NGO_TYPES.contains(organization.getType());
    }

    public static boolean isSchool(Organization organization) {
        return SCHOOL_TYPES.contains(organization.getType());
    }

    public static void requireChurch(Organization organization) {
        if (!CHURCH_TYPES.contains(organization.getType())) {
            throw new BadRequestException("This feature is only available for church organizations");
        }
    }

    public static void requireNgo(Organization organization) {
        if (!NGO_TYPES.contains(organization.getType())) {
            throw new BadRequestException("This feature is only available for NGO organizations");
        }
    }

    public static void requireSchool(Organization organization) {
        if (!SCHOOL_TYPES.contains(organization.getType())) {
            throw new BadRequestException("This feature is only available for school organizations");
        }
    }
}
