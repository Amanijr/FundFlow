package com.project.daisyDonation.grant;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class GrantsProgramsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String accessToken;
    private Long fundId;
    private Long programId;
    private Long grantId;
    private int fiscalYear;

    @BeforeEach
    void seedOrganization() throws Exception {
        fiscalYear = LocalDate.now().getYear();
        long suffix = System.nanoTime();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "organization": {
                                    "name": "Grant NGO",
                                    "slug": "grant-ngo-%d",
                                    "type": "NGO",
                                    "email": "grant@ngo-%d.org"
                                  },
                                  "email": "grant@ngo-%d.org",
                                  "password": "password123",
                                  "firstName": "Grant",
                                  "lastName": "Lead"
                                }
                                """.formatted(suffix, suffix, suffix)))
                .andExpect(status().isCreated())
                .andReturn();

        accessToken = com.jayway.jsonpath.JsonPath.read(
                result.getResponse().getContentAsString(), "$.data.accessToken");

        mockMvc.perform(post("/api/v1/accounting/initialize")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isCreated());

        MvcResult fundResult = mockMvc.perform(post("/api/v1/funds")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Grant Fund",
                                  "code": "GRT-%d",
                                  "type": "RESTRICTED",
                                  "openingBalance": 20000.00
                                }
                                """.formatted(suffix % 10000)))
                .andExpect(status().isCreated())
                .andReturn();

        fundId = ((Number) com.jayway.jsonpath.JsonPath.read(
                fundResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        MvcResult programResult = mockMvc.perform(post("/api/v1/programs")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Youth Education",
                                  "code": "PRG-%d",
                                  "description": "Education outreach",
                                  "status": "ACTIVE",
                                  "fundId": %d
                                }
                                """.formatted(suffix % 10000, fundId)))
                .andExpect(status().isCreated())
                .andReturn();

        programId = ((Number) com.jayway.jsonpath.JsonPath.read(
                programResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        MvcResult grantResult = mockMvc.perform(post("/api/v1/grants")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Education Foundation Grant",
                                  "grantCode": "GR-%d",
                                  "funderName": "Education Foundation",
                                  "awardedAmount": 10000.00,
                                  "startDate": "%d-01-01",
                                  "endDate": "%d-12-31",
                                  "restrictionType": "FULLY_RESTRICTED",
                                  "restrictionNotes": "Funds for program delivery only",
                                  "programId": %d,
                                  "fundId": %d
                                }
                                """.formatted(suffix % 10000, fiscalYear, fiscalYear + 1, programId, fundId)))
                .andExpect(status().isCreated())
                .andReturn();

        grantId = ((Number) com.jayway.jsonpath.JsonPath.read(
                grantResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/grants/" + grantId + "/activate")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    void grantUtilizationTracksProgramExpenses() throws Exception {
        Long expenseId = createApprovedExpense(1500.00);
        payExpense(expenseId);

        mockMvc.perform(get("/api/v1/grants/" + grantId + "/utilization")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.awardedAmount").value(10000.00))
                .andExpect(jsonPath("$.data.spentAmount").value(1500.00))
                .andExpect(jsonPath("$.data.remainingBalance").value(8500.00))
                .andExpect(jsonPath("$.data.usagePercent").value(15.00))
                .andExpect(jsonPath("$.data.complianceStatus").value("COMPLIANT"));
    }

    @Test
    void programDashboardAndBudgetReflectGrantActivity() throws Exception {
        Long budgetId = createAndActivateProgramBudget();
        Long expenseId = createApprovedExpense(800.00);
        payExpense(expenseId);

        mockMvc.perform(get("/api/v1/programs/" + programId + "/dashboard")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.grantCount").value(1))
                .andExpect(jsonPath("$.data.totalAwarded").value(10000.00))
                .andExpect(jsonPath("$.data.totalSpent").value(800.00))
                .andExpect(jsonPath("$.data.activeBudgetId").value(budgetId))
                .andExpect(jsonPath("$.data.activeBudgetAmount").value(3000.00));

        mockMvc.perform(get("/api/v1/budgets/" + budgetId + "/variance")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.scopeType").value("PROGRAM"))
                .andExpect(jsonPath("$.data.totalBudget").value(3000.00))
                .andExpect(jsonPath("$.data.totalActual").value(800.00));
    }

    private Long createAndActivateProgramBudget() throws Exception {
        MvcResult budgetResult = mockMvc.perform(post("/api/v1/budgets")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Youth Program Budget",
                                  "fiscalYear": %d,
                                  "startDate": "%d-01-01",
                                  "endDate": "%d-12-31",
                                  "scopeType": "PROGRAM",
                                  "programId": %d
                                }
                                """.formatted(fiscalYear, fiscalYear, fiscalYear, programId)))
                .andExpect(status().isCreated())
                .andReturn();

        Long budgetId = ((Number) com.jayway.jsonpath.JsonPath.read(
                budgetResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/lines")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "category": "PROGRAM",
                                  "amount": 3000.00,
                                  "description": "Program delivery costs"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/approve")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/activate")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        return budgetId;
    }

    private Long createApprovedExpense(double amount) throws Exception {
        MvcResult expenseResult = mockMvc.perform(post("/api/v1/expenses")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Program supplies",
                                  "amount": %.2f,
                                  "category": "PROGRAM",
                                  "expenseType": "REQUEST",
                                  "fundId": %d,
                                  "programId": %d,
                                  "grantId": %d
                                }
                                """.formatted(amount, fundId, programId, grantId)))
                .andExpect(status().isCreated())
                .andReturn();

        Long expenseId = ((Number) com.jayway.jsonpath.JsonPath.read(
                expenseResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/expenses/" + expenseId + "/submit")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/expenses/" + expenseId + "/approve")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        return expenseId;
    }

    private void payExpense(Long expenseId) throws Exception {
        mockMvc.perform(post("/api/v1/expenses/" + expenseId + "/pay")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "paymentMethod": "BANK_TRANSFER",
                                  "paymentReference": "GRANT-PAY-1",
                                  "paidAt": "%s"
                                }
                                """.formatted(LocalDateTime.now().toString())))
                .andExpect(status().isOk());
    }
}
