package com.project.daisyDonation.reporting;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
class FinancialReportingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String accessToken;
    private Long fundId;

    @BeforeEach
    void seedFinancialActivity() throws Exception {
        long suffix = System.nanoTime();
        String registerPayload = """
                {
                  "organization": {
                    "name": "Reporting NGO",
                    "slug": "reporting-ngo-%d",
                    "type": "NGO",
                    "email": "report@ngo-%d.org"
                  },
                  "email": "report@ngo-%d.org",
                  "password": "password123",
                  "firstName": "Report",
                  "lastName": "Lead"
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

        String donorPayload = """
                {
                  "firstName": "Donor",
                  "lastName": "One",
                  "email": "donor-%d@example.com",
                  "phone": "+1555000%d"
                }
                """.formatted(suffix, suffix % 10000);

        MvcResult donorResult = mockMvc.perform(post("/api/v1/donors")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(donorPayload))
                .andExpect(status().isCreated())
                .andReturn();

        Long donorId = ((Number) com.jayway.jsonpath.JsonPath.read(
                donorResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        MvcResult donationResult = mockMvc.perform(post("/api/v1/donations")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "donorId": %d,
                                  "amount": 1000.00,
                                  "donationType": "ONE_TIME"
                                }
                                """.formatted(donorId)))
                .andExpect(status().isCreated())
                .andReturn();

        Long donationId = ((Number) com.jayway.jsonpath.JsonPath.read(
                donationResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/donations/" + donationId + "/payments/gateway")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"paymentMethod\":\"CARD\",\"simulateFailure\":false}"))
                .andExpect(status().isOk());

        MvcResult fundResult = mockMvc.perform(post("/api/v1/funds")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "General Fund",
                                  "code": "GEN-001",
                                  "type": "UNRESTRICTED",
                                  "openingBalance": 5000.00
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        fundId = ((Number) com.jayway.jsonpath.JsonPath.read(
                fundResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        MvcResult expenseResult = mockMvc.perform(post("/api/v1/expenses")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Supplies",
                                  "amount": 200.00,
                                  "category": "OPERATIONS",
                                  "expenseType": "REQUEST",
                                  "fundId": %d
                                }
                                """.formatted(fundId)))
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

        mockMvc.perform(post("/api/v1/expenses/" + expenseId + "/pay")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "paymentMethod": "CASH",
                                  "paymentReference": "RPT-001",
                                  "paidAt": "%s"
                                }
                                """.formatted(LocalDateTime.now().toString())))
                .andExpect(status().isOk());
    }

    @Test
    void incomeExpenditureReportReflectsDonationsAndExpenses() throws Exception {
        mockMvc.perform(get("/api/v1/reports/income-expenditure")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalRevenue").value(1000.00))
                .andExpect(jsonPath("$.data.totalExpenses").value(200.00))
                .andExpect(jsonPath("$.data.netSurplus").value(800.00));
    }

    @Test
    void balanceSheetBalancesAssetsAndNetAssets() throws Exception {
        mockMvc.perform(get("/api/v1/reports/balance-sheet")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalAssets").value(800.00))
                .andExpect(jsonPath("$.data.totalNetAssets").value(800.00))
                .andExpect(jsonPath("$.data.totalLiabilitiesAndNetAssets").value(800.00));
    }

    @Test
    void cashFlowReportShowsOperatingMovements() throws Exception {
        mockMvc.perform(get("/api/v1/reports/cash-flow")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.openingCash").value(0))
                .andExpect(jsonPath("$.data.cashInflows").value(1000.00))
                .andExpect(jsonPath("$.data.cashOutflows").value(200.00))
                .andExpect(jsonPath("$.data.closingCash").value(800.00));
    }

    @Test
    void fundReportShowsFundExpensesAndOperationalBalance() throws Exception {
        mockMvc.perform(get("/api/v1/reports/funds")
                        .header("Authorization", "Bearer " + accessToken)
                        .param("fundId", fundId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.funds[0].expenses").value(200.00))
                .andExpect(jsonPath("$.data.funds[0].operationalBalance").value(4800.00));
    }

    @Test
    void budgetReportShowsActualsWithZeroBudgetBaseline() throws Exception {
        mockMvc.perform(get("/api/v1/reports/budget")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalActual").value(200.00))
                .andExpect(jsonPath("$.data.totalBudget").value(0))
                .andExpect(jsonPath("$.data.totalVariance").value(-200.00))
                .andExpect(jsonPath("$.data.note").exists());
    }
}
