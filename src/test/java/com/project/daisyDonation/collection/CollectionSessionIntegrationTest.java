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
    void sundayCollectionUsesDefaultFundUnlessOverridden() throws Exception {
        MvcResult generalResult = mockMvc.perform(post("/api/v1/funds")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "General offering",
                                  "code": "GEN",
                                  "type": "UNRESTRICTED",
                                  "openingBalance": 1000.00,
                                  "defaultForCollections": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.defaultForCollections").value(true))
                .andReturn();
        Long generalFundId = ((Number) com.jayway.jsonpath.JsonPath.read(
                generalResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        MvcResult buildingResult = mockMvc.perform(post("/api/v1/funds")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Building",
                                  "code": "BLD",
                                  "type": "RESTRICTED",
                                  "openingBalance": 200.00
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        Long buildingFundId = ((Number) com.jayway.jsonpath.JsonPath.read(
                buildingResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        MvcResult defaultSession = mockMvc.perform(post("/api/v1/collection-sessions")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "collectionType": "SERVICE_OFFERING",
                                  "title": "Sunday offering"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        Long defaultSessionId = ((Number) com.jayway.jsonpath.JsonPath.read(
                defaultSession.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(put("/api/v1/collection-sessions/" + defaultSessionId + "/count")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "totalAmount": 250.00,
                                  "paymentMethod": "CASH",
                                  "collectedAt": "%s"
                                }
                                """.formatted(LocalDateTime.now())))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/collection-sessions/" + defaultSessionId + "/verify")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fundId").value(generalFundId.intValue()))
                .andExpect(jsonPath("$.data.fundName").value("General offering"));

        mockMvc.perform(get("/api/v1/funds/" + generalFundId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentBalance").value(1250.00));

        MvcResult overrideSession = mockMvc.perform(post("/api/v1/collection-sessions")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "collectionType": "SPECIAL_APPEAL",
                                  "title": "Building appeal",
                                  "fundId": %d
                                }
                                """.formatted(buildingFundId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.fundId").value(buildingFundId.intValue()))
                .andReturn();
        Long overrideSessionId = ((Number) com.jayway.jsonpath.JsonPath.read(
                overrideSession.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(put("/api/v1/collection-sessions/" + overrideSessionId + "/count")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "totalAmount": 80.00,
                                  "paymentMethod": "CASH",
                                  "collectedAt": "%s"
                                }
                                """.formatted(LocalDateTime.now())))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/collection-sessions/" + overrideSessionId + "/verify")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fundId").value(buildingFundId.intValue()));

        mockMvc.perform(get("/api/v1/funds/" + buildingFundId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentBalance").value(280.00));

        mockMvc.perform(get("/api/v1/funds/" + generalFundId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentBalance").value(1250.00));
    }

    @Test
    void manualCashPaymentForIndividualDonation() throws Exception {
        String memberPayload = """
                {
                  "firstName": "John",
                  "lastName": "Cash",
                  "email": "john.cash@example.com",
                  "phone": "+15550001111"
                }
                """;

        MvcResult memberResult = mockMvc.perform(post("/api/v1/members")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(memberPayload))
                .andExpect(status().isCreated())
                .andReturn();

        Long memberId = ((Number) com.jayway.jsonpath.JsonPath.read(
                memberResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        String donationPayload = """
                {
                  "memberId": %d,
                  "amount": 100.00,
                  "donationType": "ONE_TIME",
                  "source": "IN_PERSON"
                }
                """.formatted(memberId);

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
