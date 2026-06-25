package com.project.daisyDonation.expense;

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
class ExpenseWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String accessToken;

    @BeforeEach
    void registerOrganization() throws Exception {
        long suffix = System.nanoTime();
        String registerPayload = """
                {
                  "organization": {
                    "name": "Hope NGO",
                    "slug": "hope-ngo-%d",
                    "type": "NGO",
                    "email": "admin@hope-%d.org"
                  },
                  "email": "admin@hope-%d.org",
                  "password": "password123",
                  "firstName": "Finance",
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
    }

    @Test
    void fullExpenseAndFundWorkflow() throws Exception {
        String fundPayload = """
                {
                  "name": "General Fund",
                  "code": "GEN-001",
                  "type": "UNRESTRICTED",
                  "openingBalance": 10000.00
                }
                """;

        MvcResult fundResult = mockMvc.perform(post("/api/v1/funds")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(fundPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.currentBalance").value(10000.00))
                .andReturn();

        Long fundId = ((Number) com.jayway.jsonpath.JsonPath.read(
                fundResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        String expensePayload = """
                {
                  "title": "Office Supplies",
                  "description": "Printer paper and toner",
                  "amount": 250.00,
                  "category": "OPERATIONS",
                  "expenseType": "REQUEST",
                  "fundId": %d,
                  "payeeName": "Stationery World"
                }
                """.formatted(fundId);

        MvcResult expenseResult = mockMvc.perform(post("/api/v1/expenses")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(expensePayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andReturn();

        Long expenseId = ((Number) com.jayway.jsonpath.JsonPath.read(
                expenseResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/expenses/" + expenseId + "/submit")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"));

        mockMvc.perform(post("/api/v1/expenses/" + expenseId + "/approve")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));

        String payPayload = """
                {
                  "paymentMethod": "BANK_TRANSFER",
                  "paymentReference": "EXP-001",
                  "paidAt": "%s"
                }
                """.formatted(LocalDateTime.now().toString());

        mockMvc.perform(post("/api/v1/expenses/" + expenseId + "/pay")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PAID"));

        mockMvc.perform(post("/api/v1/expenses/" + expenseId + "/reconcile")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RECONCILED"));

        mockMvc.perform(get("/api/v1/funds/" + fundId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentBalance").value(9750.00));

        mockMvc.perform(get("/api/v1/expenses/report")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalPaidAmount").value(250.00))
                .andExpect(jsonPath("$.data.reconciledCount").value(1));
    }
}
