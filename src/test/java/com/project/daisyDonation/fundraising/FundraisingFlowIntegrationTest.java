package com.project.daisyDonation.fundraising;

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
class FundraisingFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String accessToken;

    @BeforeEach
    void registerOrganization() throws Exception {
        String registerPayload = """
                {
                  "organization": {
                    "name": "Hope Foundation",
                    "slug": "hope-foundation",
                    "type": "NGO",
                    "email": "admin@hope.org"
                  },
                  "email": "admin@hope.org",
                  "password": "password123",
                  "firstName": "Alex",
                  "lastName": "Admin"
                }
                """;

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isCreated())
                .andReturn();

        accessToken = com.jayway.jsonpath.JsonPath.read(
                result.getResponse().getContentAsString(), "$.data.accessToken");
    }

    @Test
    void fullFundraisingFlow() throws Exception {
        String donorPayload = """
                {
                  "firstName": "Mary",
                  "lastName": "Donor",
                  "email": "mary@example.com",
                  "phone": "+15551234567",
                  "country": "US"
                }
                """;

        MvcResult donorResult = mockMvc.perform(post("/api/v1/donors")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(donorPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.email").value("mary@example.com"))
                .andReturn();

        Long donorId = ((Number) com.jayway.jsonpath.JsonPath.read(
                donorResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        String campaignPayload = """
                {
                  "name": "Building Fund 2026",
                  "description": "New community center",
                  "targetAmount": 10000.00,
                  "status": "ACTIVE"
                }
                """;

        MvcResult campaignResult = mockMvc.perform(post("/api/v1/campaigns")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(campaignPayload))
                .andExpect(status().isCreated())
                .andReturn();

        Long campaignId = ((Number) com.jayway.jsonpath.JsonPath.read(
                campaignResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        String donationPayload = """
                {
                  "donorId": %d,
                  "amount": 250.00,
                  "donationType": "ONE_TIME",
                  "campaignId": %d,
                  "source": "WEB"
                }
                """.formatted(donorId, campaignId);

        MvcResult donationResult = mockMvc.perform(post("/api/v1/donations")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(donationPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andReturn();

        Long donationId = ((Number) com.jayway.jsonpath.JsonPath.read(
                donationResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        String paymentPayload = """
                {
                  "paymentMethod": "CARD",
                  "simulateFailure": false
                }
                """;

        mockMvc.perform(post("/api/v1/donations/" + donationId + "/payments/gateway")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(paymentPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.successful").value(true))
                .andExpect(jsonPath("$.data.donationStatus").value("COMPLETED"));

        mockMvc.perform(get("/api/v1/campaigns/" + campaignId + "/dashboard")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.raisedAmount").value(250.00))
                .andExpect(jsonPath("$.data.donationCount").value(1));

        mockMvc.perform(get("/api/v1/donors/" + donorId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lifetimeValue").value(250.00))
                .andExpect(jsonPath("$.data.donationCount").value(1));
    }
}
