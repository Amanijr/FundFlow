package com.project.daisyDonation.organization.entity;

/**
 * FundFlow organization types for civil society and education tenants.
 * Legacy CHURCH / RELIGIOUS_INSTITUTION values were migrated to COMMUNITY_ORGANIZATION (Flyway V21).
 */
public enum OrganizationType {
    NGO,
    FOUNDATION,
    CHARITY,
    COMMUNITY_ORGANIZATION,
    SCHOOL
}
