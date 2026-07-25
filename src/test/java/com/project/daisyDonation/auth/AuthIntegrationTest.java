package com.project.daisyDonation.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void registerAndLogin() throws Exception {
        String registerPayload = """
                {
                  "organization": {
                    "name": "Grace Community Church",
                    "slug": "grace-community",
                    "type": "CHURCH",
                    "email": "admin@grace.org",
                    "phone": "+1234567890",
                    "country": "US"
                  },
                  "email": "admin@grace.org",
                  "password": "password123",
                  "firstName": "Jane",
                  "lastName": "Admin"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.role").value("ORG_ADMIN"));

        String loginPayload = """
                {
                  "email": "admin@grace.org",
                  "password": "password123"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());
    }

    @Test
    void duplicateOrganizationNamesReceiveUniqueSlugs() throws Exception {
        String firstPayload = """
                {
                  "organization": {
                    "name": "Hope Foundation",
                    "type": "NGO",
                    "email": "first@hope.org"
                  },
                  "email": "first@hope.org",
                  "password": "password123",
                  "firstName": "First",
                  "lastName": "Admin"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(firstPayload))
                .andExpect(status().isCreated());

        String secondPayload = """
                {
                  "organization": {
                    "name": "Hope Foundation",
                    "type": "CHARITY",
                    "email": "second@hope.org"
                  },
                  "email": "second@hope.org",
                  "password": "password123",
                  "firstName": "Second",
                  "lastName": "Admin"
                }
                """;

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(secondPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.organizationId").isNotEmpty());
    }
}
