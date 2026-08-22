package com.project.daisyDonation.workflow;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
class WorkflowInboxIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String accessToken;

    @BeforeEach
    void registerOrganization() throws Exception {
        long suffix = System.nanoTime();
        String registerPayload = """
                {
                  "organization": {
                    "name": "Inbox NGO",
                    "slug": "inbox-ngo-%d",
                    "type": "NGO",
                    "email": "admin@inbox-%d.org"
                  },
                  "email": "admin@inbox-%d.org",
                  "password": "password123",
                  "firstName": "Inbox",
                  "lastName": "Admin"
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
    void shellEndpointsReturnEmptyUntilWorkExists() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/unread-count")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(0));

        mockMvc.perform(get("/api/v1/announcements/active")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(0));

        mockMvc.perform(get("/api/v1/workflow/inbox/count")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(0));

        mockMvc.perform(get("/api/v1/workflow/inbox")
                        .param("status", "action_required")
                        .param("sort", "sla")
                        .param("size", "50")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items").isArray())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    void submittedExpensesAppearInInbox() throws Exception {
        String fundPayload = """
                {
                  "name": "General Fund",
                  "code": "GEN-INBOX",
                  "type": "UNRESTRICTED",
                  "openingBalance": 10000.00
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
                .andReturn();

        Long expenseId = ((Number) com.jayway.jsonpath.JsonPath.read(
                expenseResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/expenses/" + expenseId + "/submit")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/workflow/inbox/count")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(1));

        mockMvc.perform(get("/api/v1/workflow/inbox")
                        .param("status", "action_required")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.items[0].title").value("Office Supplies"))
                .andExpect(jsonPath("$.data.items[0].entityType").value("expense"))
                .andExpect(jsonPath("$.data.items[0].actionRequired").value(true))
                .andExpect(jsonPath("$.data.items[0].href").value("/expenses/" + expenseId));
    }
}
