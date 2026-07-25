package com.project.daisyDonation.collection;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
class CollectionSessionIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String accessToken;

    @BeforeEach
    void registerOrganization() throws Exception {
        String registerPayload = """
                {
                  "organization": {
                    "name": "Grace Church",
                    "slug": "grace-church-%d",
                    "type": "CHURCH",
                    "email": "finance@grace-%d.org"
                  },
                  "email": "finance@grace-%d.org",
                  "password": "password123",
                  "firstName": "Finance",
                  "lastName": "Manager"
                }
                """.formatted(System.nanoTime(), System.nanoTime(), System.nanoTime());

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isCreated())
                .andReturn();

        accessToken = com.jayway.jsonpath.JsonPath.read(
                result.getResponse().getContentAsString(), "$.data.accessToken");
    }

    @Test
    void churchOfferingCollectionFlow() throws Exception {
        String createPayload = """
                {
                  "collectionType": "SERVICE_OFFERING",
                  "title": "Sunday Morning Offering",
                  "location": "Main Sanctuary"
                }
                """;

        MvcResult sessionResult = mockMvc.perform(post("/api/v1/collection-sessions")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.collectionType").value("SERVICE_OFFERING"))
                .andReturn();

        Long sessionId = ((Number) com.jayway.jsonpath.JsonPath.read(
                sessionResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        String countPayload = """
                {
                  "totalAmount": 5000.00,
                  "paymentMethod": "CASH",
                  "collectedAt": "%s"
                }
                """.formatted(LocalDateTime.now().toString());

        mockMvc.perform(put("/api/v1/collection-sessions/" + sessionId + "/count")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(countPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COUNTED"))
                .andExpect(jsonPath("$.data.totalAmount").value(5000.00));

        mockMvc.perform(post("/api/v1/collection-sessions/" + sessionId + "/verify")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("VERIFIED"))
                .andExpect(jsonPath("$.data.donationId").isNotEmpty());

        mockMvc.perform(get("/api/v1/collection-sessions/dashboard")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalVerifiedAmount").value(5000.00))
                .andExpect(jsonPath("$.data.totalVerifiedSessions").value(1))
                .andExpect(jsonPath("$.data.byCollectionType[0].collectionType").value("SERVICE_OFFERING"));
    }

    @Test
    void manualCashPaymentForIndividualDonation() throws Exception {
        String donorPayload = """
                {
                  "firstName": "John",
                  "lastName": "Cash",
                  "email": "john.cash@example.com",
                  "phone": "+15550001111"
                }
                """;

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
                  "amount": 100.00,
                  "donationType": "ONE_TIME",
                  "source": "IN_PERSON"
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

        String manualPaymentPayload = """
                {
                  "paymentMethod": "CASH",
                  "receiptNumber": "RCPT-001",
                  "collectionDate": "%s",
                  "paymentNotes": "Cash received at office"
                }
                """.formatted(LocalDateTime.now().toString());

        mockMvc.perform(post("/api/v1/donations/" + donationId + "/payments/manual")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(manualPaymentPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.channel").value("MANUAL"))
                .andExpect(jsonPath("$.data.receiptNumber").value("RCPT-001"))
                .andExpect(jsonPath("$.data.donationStatus").value("COMPLETED"));
    }
}
