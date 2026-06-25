package com.project.daisyDonation.budget;

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
class BudgetingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String accessToken;
    private Long fundId;
    private int fiscalYear;

    @BeforeEach
    void registerOrganization() throws Exception {
        fiscalYear = LocalDate.now().getYear();
        long suffix = System.nanoTime();
        String registerPayload = """
                {
                  "organization": {
                    "name": "Budget NGO",
                    "slug": "budget-ngo-%d",
                    "type": "NGO",
                    "email": "budget@ngo-%d.org"
                  },
                  "email": "budget@ngo-%d.org",
                  "password": "password123",
                  "firstName": "Budget",
                  "lastName": "Manager"
                }
                """.formatted(suffix, suffix, suffix);

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
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
                                  "name": "General Fund",
                                  "code": "GEN-%d",
                                  "type": "UNRESTRICTED",
                                  "openingBalance": 10000.00
                                }
                                """.formatted(suffix % 10000)))
                .andExpect(status().isCreated())
                .andReturn();

        fundId = ((Number) com.jayway.jsonpath.JsonPath.read(
                fundResult.getResponse().getContentAsString(), "$.data.id")).longValue();
    }

    @Test
    void annualBudgetVarianceTracksPaidExpenses() throws Exception {
        Long budgetId = createAndActivateAnnualBudget();

        Long expenseId = createApprovedExpense("Office rent", 500.00, "OPERATIONS", null);
        payExpense(expenseId, "BUD-001");

        mockMvc.perform(get("/api/v1/budgets/" + budgetId + "/variance")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalBudget").value(5000.00))
                .andExpect(jsonPath("$.data.totalActual").value(500.00))
                .andExpect(jsonPath("$.data.totalVariance").value(4500.00));

        mockMvc.perform(get("/api/v1/reports/budget")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalBudget").value(5000.00))
                .andExpect(jsonPath("$.data.totalActual").value(500.00));
    }

    @Test
    void departmentBudgetVarianceFiltersByDepartment() throws Exception {
        String departmentBudgetPayload = """
                {
                  "name": "Admin Department Budget %d",
                  "fiscalYear": %d,
                  "startDate": "%d-01-01",
                  "endDate": "%d-12-31",
                  "scopeType": "DEPARTMENT",
                  "department": "Administration"
                }
                """.formatted(System.nanoTime(), fiscalYear, fiscalYear, fiscalYear);

        MvcResult budgetResult = mockMvc.perform(post("/api/v1/budgets")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(departmentBudgetPayload))
                .andExpect(status().isCreated())
                .andReturn();

        Long budgetId = ((Number) com.jayway.jsonpath.JsonPath.read(
                budgetResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/lines")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "category": "ADMINISTRATIVE",
                                  "amount": 2000.00,
                                  "description": "Admin overhead"
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/approve")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/activate")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        Long expenseId = createApprovedExpense("Admin supplies", 300.00, "ADMINISTRATIVE", "Administration");
        payExpense(expenseId, "BUD-DEPT-1");

        mockMvc.perform(get("/api/v1/budgets/" + budgetId + "/variance")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.scopeType").value("DEPARTMENT"))
                .andExpect(jsonPath("$.data.totalBudget").value(2000.00))
                .andExpect(jsonPath("$.data.totalActual").value(300.00))
                .andExpect(jsonPath("$.data.lines[0].department").value("Administration"));
    }

    private Long createAndActivateAnnualBudget() throws Exception {
        String budgetPayload = """
                {
                  "name": "Annual Budget %d",
                  "fiscalYear": %d,
                  "startDate": "%d-01-01",
                  "endDate": "%d-12-31",
                  "scopeType": "ORGANIZATION"
                }
                """.formatted(System.nanoTime(), fiscalYear, fiscalYear, fiscalYear);

        MvcResult budgetResult = mockMvc.perform(post("/api/v1/budgets")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(budgetPayload))
                .andExpect(status().isCreated())
                .andReturn();

        Long budgetId = ((Number) com.jayway.jsonpath.JsonPath.read(
                budgetResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/budgets/" + budgetId + "/lines")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "category": "OPERATIONS",
                                  "amount": 5000.00,
                                  "description": "Operating costs"
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

    private Long createApprovedExpense(String title, double amount, String category, String department) throws Exception {
        String departmentField = department != null
                ? ", \"department\": \"" + department + "\""
                : "";

        MvcResult expenseResult = mockMvc.perform(post("/api/v1/expenses")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "%s",
                                  "amount": %.2f,
                                  "category": "%s",
                                  "expenseType": "REQUEST",
                                  "fundId": %d%s
                                }
                                """.formatted(title, amount, category, fundId, departmentField)))
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

    private void payExpense(Long expenseId, String reference) throws Exception {
        mockMvc.perform(post("/api/v1/expenses/" + expenseId + "/pay")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "paymentMethod": "CASH",
                                  "paymentReference": "%s",
                                  "paidAt": "%s"
                                }
                                """.formatted(reference, LocalDateTime.now().toString())))
                .andExpect(status().isOk());
    }
}
