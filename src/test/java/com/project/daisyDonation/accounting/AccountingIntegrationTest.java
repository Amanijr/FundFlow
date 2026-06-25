package com.project.daisyDonation.accounting;

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
class AccountingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String accessToken;

    @BeforeEach
    void registerOrganization() throws Exception {
        long suffix = System.nanoTime();
        String registerPayload = """
                {
                  "organization": {
                    "name": "Accounting NGO",
                    "slug": "accounting-ngo-%d",
                    "type": "NGO",
                    "email": "acct@ngo-%d.org"
                  },
                  "email": "acct@ngo-%d.org",
                  "password": "password123",
                  "firstName": "Account",
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
    }

    @Test
    void donationAndExpensePostJournalEntriesWithBalancedTrialBalance() throws Exception {
        mockMvc.perform(post("/api/v1/accounting/initialize")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isCreated());

        String donorPayload = """
                {
                  "firstName": "Donor",
                  "lastName": "One",
                  "email": "donor1-%d@example.com",
                  "phone": "+1555000%d"
                }
                """.formatted(System.nanoTime(), System.nanoTime() % 10000);

        MvcResult donorResult = mockMvc.perform(post("/api/v1/donors")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(donorPayload))
                .andExpect(status().isCreated())
                .andReturn();

        Long donorId = ((Number) com.jayway.jsonpath.JsonPath.read(
                donorResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        String donationPayload = """
                {
                  "donorId": %d,
                  "amount": 1000.00,
                  "donationType": "ONE_TIME"
                }
                """.formatted(donorId);

        MvcResult donationResult = mockMvc.perform(post("/api/v1/donations")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(donationPayload))
                .andExpect(status().isCreated())
                .andReturn();

        Long donationId = ((Number) com.jayway.jsonpath.JsonPath.read(
                donationResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/donations/" + donationId + "/payments/gateway")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"paymentMethod\":\"CARD\",\"simulateFailure\":false}"))
                .andExpect(status().isOk());

        String fundPayload = """
                {
                  "name": "Ops Fund",
                  "code": "OPS-001",
                  "type": "UNRESTRICTED",
                  "openingBalance": 5000.00
                }
                """;

        MvcResult fundResult = mockMvc.perform(post("/api/v1/funds")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(fundPayload))
                .andExpect(status().isCreated())
                .andReturn();

        Long fundId = ((Number) com.jayway.jsonpath.JsonPath.read(
                fundResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        String expensePayload = """
                {
                  "title": "Supplies",
                  "amount": 200.00,
                  "category": "OPERATIONS",
                  "expenseType": "REQUEST",
                  "fundId": %d
                }
                """.formatted(fundId);

        MvcResult expenseResult = mockMvc.perform(post("/api/v1/expenses")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expensePayload))
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

        String payPayload = """
                {
                  "paymentMethod": "CASH",
                  "paymentReference": "EXP-ACCT-1",
                  "paidAt": "%s"
                }
                """.formatted(LocalDateTime.now().toString());

        mockMvc.perform(post("/api/v1/expenses/" + expenseId + "/pay")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payPayload))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/accounting/journal-entries")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));

        mockMvc.perform(get("/api/v1/accounting/trial-balance")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalDebits").value(1200.00))
                .andExpect(jsonPath("$.data.totalCredits").value(1200.00));
    }
}
