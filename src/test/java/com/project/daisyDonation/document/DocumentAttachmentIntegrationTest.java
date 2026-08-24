package com.project.daisyDonation.document;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class DocumentAttachmentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String accessToken;

    @BeforeEach
    void registerOrganization() throws Exception {
        long suffix = System.nanoTime();
        String registerPayload = """
                {
                  "organization": {
                    "name": "Umoja Chapel",
                    "slug": "umoja-docs-%d",
                    "type": "CHURCH",
                    "email": "docs@umoja-%d.org",
                    "city": "Dar es Salaam",
                    "country": "Tanzania"
                  },
                  "email": "docs@umoja-%d.org",
                  "password": "password123",
                  "firstName": "Asha",
                  "lastName": "Treasurer"
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
    void uploadThenListAndDownloadAttachment() throws Exception {
        mockMvc.perform(get("/api/v1/documents")
                        .header("Authorization", "Bearer " + accessToken)
                        .queryParam("entityType", "donation")
                        .queryParam("entityId", "12")
                        .queryParam("status", "ready"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items").isEmpty());

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sunday-receipt.pdf",
                "application/pdf",
                "%PDF-1.4 receipt".getBytes());

        MvcResult uploadResult = mockMvc.perform(multipart("/api/v1/documents/upload")
                        .file(file)
                        .param("entityType", "donation")
                        .param("entityId", "12")
                        .param("category", "receipt")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("sunday-receipt.pdf"))
                .andExpect(jsonPath("$.data.status").value("ready"))
                .andExpect(jsonPath("$.data.entityType").value("donation"))
                .andReturn();

        String documentId = com.jayway.jsonpath.JsonPath.read(
                uploadResult.getResponse().getContentAsString(), "$.data.id");

        mockMvc.perform(get("/api/v1/documents")
                        .header("Authorization", "Bearer " + accessToken)
                        .queryParam("entityType", "donation")
                        .queryParam("entityId", "12")
                        .queryParam("status", "ready"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.items[0].id").value(documentId))
                .andExpect(jsonPath("$.data.items[0].name").value("sunday-receipt.pdf"));

        mockMvc.perform(get("/api/v1/documents/" + documentId + "/download")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(content().bytes("%PDF-1.4 receipt".getBytes()));
    }
}
