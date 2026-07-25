package com.project.daisyDonation.communication;

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
class CommunicationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String accessToken;
    private Long donationId;

    @BeforeEach
    void seedDonationPayment() throws Exception {
        long suffix = System.nanoTime();

        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "organization": {
                                    "name": "Comms NGO",
                                    "slug": "comms-ngo-%d",
                                    "type": "NGO",
                                    "email": "comms@ngo-%d.org"
                                  },
                                  "email": "comms@ngo-%d.org",
                                  "password": "password123",
                                  "firstName": "Comms",
                                  "lastName": "Lead"
                                }
                                """.formatted(suffix, suffix, suffix)))
                .andExpect(status().isCreated())
                .andReturn();

        accessToken = com.jayway.jsonpath.JsonPath.read(
                registerResult.getResponse().getContentAsString(), "$.data.accessToken");

        MvcResult donorResult = mockMvc.perform(post("/api/v1/donors")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Jane",
                                  "lastName": "Donor",
                                  "email": "jane-%d@example.com",
                                  "phone": "+1555000%d"
                                }
                                """.formatted(suffix, suffix % 10000)))
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
                                  "amount": 250.00,
                                  "donationType": "ONE_TIME"
                                }
                                """.formatted(donorId)))
                .andExpect(status().isCreated())
                .andReturn();

        donationId = ((Number) com.jayway.jsonpath.JsonPath.read(
                donationResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/donations/" + donationId + "/payments/gateway")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"paymentMethod\":\"CARD\",\"simulateFailure\":false}"))
                .andExpect(status().isOk());
    }

    @Test
    void successfulPaymentTriggersAutoEmailReceipt() throws Exception {
        mockMvc.perform(get("/api/v1/communications/donations/" + donationId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].channel").value("EMAIL"))
                .andExpect(jsonPath("$.data[0].messageType").value("RECEIPT"))
                .andExpect(jsonPath("$.data[0].status").value("SENT"));
    }

    @Test
    void receiptPreviewAndManualWhatsAppSend() throws Exception {
        mockMvc.perform(get("/api/v1/communications/receipts/" + donationId)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.amount").value(250.00))
                .andExpect(jsonPath("$.data.receiptNumber").exists())
                .andExpect(jsonPath("$.data.body").exists());

        mockMvc.perform(post("/api/v1/communications/receipts/" + donationId)
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "channel": "WHATSAPP",
                                  "recipientOverride": "+15559998888"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.channel").value("WHATSAPP"))
                .andExpect(jsonPath("$.data.status").value("SENT"));
    }

    @Test
    void customSmsCanBeSent() throws Exception {
        mockMvc.perform(post("/api/v1/communications/send")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "channel": "SMS",
                                  "messageType": "NOTIFICATION",
                                  "recipient": "+15551234567",
                                  "body": "Thank you for supporting our mission."
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.channel").value("SMS"))
                .andExpect(jsonPath("$.data.messageType").value("NOTIFICATION"))
                .andExpect(jsonPath("$.data.status").value("SENT"));

        mockMvc.perform(get("/api/v1/communications")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }
}
