package com.project.daisyDonation.analytics;

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
class AnalyticsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String accessToken;

    @BeforeEach
    void seedActivity() throws Exception {
        long suffix = System.nanoTime();
        String registerPayload = """
                {
                  "organization": {
                    "name": "Analytics NGO",
                    "slug": "analytics-ngo-%d",
                    "type": "NGO",
                    "email": "analytics@ngo-%d.org"
                  },
                  "email": "analytics@ngo-%d.org",
                  "password": "password123",
                  "firstName": "Analytics",
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

        MvcResult campaignResult = mockMvc.perform(post("/api/v1/campaigns")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Annual Appeal",
                                  "targetAmount": 5000.00,
                                  "status": "ACTIVE"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        Long campaignId = ((Number) com.jayway.jsonpath.JsonPath.read(
                campaignResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        MvcResult donationResult = mockMvc.perform(post("/api/v1/donations")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "donorId": %d,
                                  "campaignId": %d,
                                  "amount": 1500.00,
                                  "donationType": "ONE_TIME",
                                  "source": "ONLINE"
                                }
                                """.formatted(donorId, campaignId)))
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
                                  "openingBalance": 3000.00
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        Long fundId = ((Number) com.jayway.jsonpath.JsonPath.read(
                fundResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        MvcResult expenseResult = mockMvc.perform(post("/api/v1/expenses")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Supplies",
                                  "amount": 400.00,
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
                                  "paymentReference": "ANL-001",
                                  "paidAt": "%s"
                                }
                                """.formatted(LocalDateTime.now().toString())))
                .andExpect(status().isOk());
    }

    @Test
    void executiveDashboardShowsKpis() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/dashboard")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalDonations").value(1500.00))
                .andExpect(jsonPath("$.data.totalExpenses").value(400.00))
                .andExpect(jsonPath("$.data.netPosition").value(1100.00))
                .andExpect(jsonPath("$.data.cashBalance").value(1100.00))
                .andExpect(jsonPath("$.data.donorCount").value(1))
                .andExpect(jsonPath("$.data.activeCampaignCount").value(1));
    }

    @Test
    void trendAnalysisIncludesDonationAndExpenseSeries() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/trends")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.granularity").value("MONTHLY"))
                .andExpect(jsonPath("$.data.donationTrend").isArray())
                .andExpect(jsonPath("$.data.expenseTrend").isArray())
                .andExpect(jsonPath("$.data.donationSources[0].source").value("ONLINE"))
                .andExpect(jsonPath("$.data.campaignPerformance[0].raisedAmount").value(1500.00));
    }

    @Test
    void forecastReturnsProjections() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/forecast")
                        .header("Authorization", "Bearer " + accessToken)
                        .param("months", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.forecastMonths").value(3))
                .andExpect(jsonPath("$.data.projections").isArray())
                .andExpect(jsonPath("$.data.projections.length()").value(3));
    }

    @Test
    void insightsReturnsActionableItems() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/insights")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.insights").isArray())
                .andExpect(jsonPath("$.data.insights[0].category").exists())
                .andExpect(jsonPath("$.data.insights[0].severity").exists());
    }
}
