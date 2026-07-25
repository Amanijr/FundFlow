package com.project.daisyDonation.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
class UserManagementIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String adminToken;
    private long suffix;

    @BeforeEach
    void registerAdmin() throws Exception {
        suffix = System.nanoTime();
        String registerPayload = """
                {
                  "organization": {
                    "name": "User Mgmt Church",
                    "slug": "user-mgmt-church-%d",
                    "type": "CHURCH",
                    "email": "admin-%d@church.org"
                  },
                  "email": "admin-%d@church.org",
                  "password": "password123",
                  "firstName": "Admin",
                  "lastName": "User"
                }
                """.formatted(suffix, suffix, suffix);

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isCreated())
                .andReturn();

        adminToken = com.jayway.jsonpath.JsonPath.read(
                result.getResponse().getContentAsString(), "$.data.accessToken");
    }

    @Test
    void orgAdminCanInviteUserAndUpdateRole() throws Exception {
        MvcResult inviteResult = mockMvc.perform(post("/api/v1/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "staff-%d@church.org",
                                  "password": "password123",
                                  "firstName": "Staff",
                                  "lastName": "Member",
                                  "role": "STAFF"
                                }
                                """.formatted(suffix)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.role").value("STAFF"))
                .andExpect(jsonPath("$.data.email").value("staff-" + suffix + "@church.org"))
                .andReturn();

        Long staffUserId = ((Number) com.jayway.jsonpath.JsonPath.read(
                inviteResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2));

        mockMvc.perform(put("/api/v1/users/" + staffUserId + "/role")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\": \"FINANCE_MANAGER\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("FINANCE_MANAGER"));
    }

    @Test
    void staffCannotManageUsers() throws Exception {
        mockMvc.perform(post("/api/v1/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "staff2-%d@church.org",
                                  "password": "password123",
                                  "firstName": "Staff",
                                  "lastName": "Two",
                                  "role": "STAFF"
                                }
                                """.formatted(suffix)))
                .andExpect(status().isCreated());

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "staff2-%d@church.org",
                                  "password": "password123"
                                }
                                """.formatted(suffix)))
                .andExpect(status().isOk())
                .andReturn();

        String staffToken = com.jayway.jsonpath.JsonPath.read(
                loginResult.getResponse().getContentAsString(), "$.data.accessToken");

        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void cannotAssignSuperAdminRole() throws Exception {
        mockMvc.perform(post("/api/v1/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "bad-%d@church.org",
                                  "password": "password123",
                                  "firstName": "Bad",
                                  "lastName": "Role",
                                  "role": "SUPER_ADMIN"
                                }
                                """.formatted(suffix)))
                .andExpect(status().isBadRequest());
    }
}
