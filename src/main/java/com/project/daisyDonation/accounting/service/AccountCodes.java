package com.project.daisyDonation.accounting.service;

/**
 * Stable ledger codes used by automatic posting. Names/descriptions vary by organization type,
 * but these codes must remain present so donation and expense journals can post.
 */
public final class AccountCodes {

    public static final String CASH = "1000";
    public static final String BANK = "1010";
    public static final String MOBILE_MONEY = "1020";
    public static final String IN_KIND_CONTRIBUTIONS = "1200";
    public static final String DONATION_REVENUE = "4000";
    public static final String TITHE_REVENUE = "4010";
    public static final String OFFERING_REVENUE = "4020";
    public static final String BUILDING_REVENUE = "4030";
    public static final String OPERATIONS_EXPENSE = "5100";
    public static final String PROGRAM_EXPENSE = "5200";
    public static final String ADMINISTRATIVE_EXPENSE = "5300";
    public static final String FUNDRAISING_EXPENSE = "5400";
    public static final String MISCELLANEOUS_EXPENSE = "5900";

    private AccountCodes() {
    }
}
