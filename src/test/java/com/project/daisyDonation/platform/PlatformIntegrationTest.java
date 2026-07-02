package com.project.daisyDonation.platform;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.project.daisyDonation.common.config.SyncAsyncTestConfig;

@SpringBootTest
@AutoConfigureMockMvc
@Import(SyncAsyncTestConfig.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class PlatformIntegrationTest {

    private static final String BOOTSTRAP_SECRET = "test-bootstrap-secret";
    private static final String DASHBOARD = "/api/v1/platform/dashboard";

    @Autowired
    private MockMvc mockMvc;

    private static String superAdminToken;
    private static long orgSuffix;
    private static Long churchOrganizationId;

    @Test
    @Order(1)
    void bootstrapSuperAdmin() throws Exception {
        orgSuffix = System.nanoTime();

        MvcResult result = mockMvc.perform(post("/api/v1/platform/bootstrap")
                        .header("X-Platform-Bootstrap-Secret", BOOTSTRAP_SECRET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "super-%d@fundflow.io",
                                  "password": "password123",
                                  "firstName": "Super",
                                  "lastName": "Admin"
                                }
                                """.formatted(orgSuffix)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.role").value("SUPER_ADMIN"))
                .andExpect(jsonPath("$.data.organizationId").isEmpty())
                .andReturn();

        superAdminToken = com.jayway.jsonpath.JsonPath.read(
                result.getResponse().getContentAsString(), "$.data.accessToken");
    }

    @Test
    @Order(2)
    void bootstrapFailsWhenSuperAdminAlreadyExists() throws Exception {
        mockMvc.perform(post("/api/v1/platform/bootstrap")
                        .header("X-Platform-Bootstrap-Secret", BOOTSTRAP_SECRET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "another-super@fundflow.io",
                                  "password": "password123",
                                  "firstName": "Other",
                                  "lastName": "Admin"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(3)
    void superAdminCanViewFullOwnerDashboard() throws Exception {
        MvcResult registerResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "organization": {
                                    "name": "Platform Test Church",
                                    "slug": "platform-test-church-%d",
                                    "type": "CHURCH",
                                    "email": "church-%d@example.org"
                                  },
                                  "email": "church-%d@example.org",
                                  "password": "password123",
                                  "firstName": "Org",
                                  "lastName": "Admin"
                                }
                                """.formatted(orgSuffix, orgSuffix, orgSuffix)))
                .andExpect(status().isCreated())
                .andReturn();

        churchOrganizationId = ((Number) com.jayway.jsonpath.JsonPath.read(
                registerResult.getResponse().getContentAsString(), "$.data.organizationId")).longValue();

        mockMvc.perform(get(DASHBOARD)
                        .header("Authorization", "Bearer " + superAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.platformStats.totalOrganizations").value(greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.platformStats.superAdminCount").value(greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.organizations.length()").value(greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.users.length()").value(greaterThanOrEqualTo(2)))
                .andExpect(jsonPath("$.data.recentActivity").isArray());

        mockMvc.perform(get(DASHBOARD + "/stats")
                        .header("Authorization", "Bearer " + superAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalOrganizations").value(greaterThanOrEqualTo(1)));

        mockMvc.perform(get(DASHBOARD + "/organizations")
                        .header("Authorization", "Bearer " + superAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(greaterThanOrEqualTo(1)));

        mockMvc.perform(get(DASHBOARD + "/users")
                        .header("Authorization", "Bearer " + superAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(greaterThanOrEqualTo(2)));
    }

    @Test
    @Order(4)
    void superAdminCanActOnOrganizationWithHeader() throws Exception {
        mockMvc.perform(put(DASHBOARD + "/organizations/" + churchOrganizationId + "/status")
                        .header("Authorization", "Bearer " + superAdminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\": false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));

        mockMvc.perform(get("/api/v1/church/ministries")
                        .header("Authorization", "Bearer " + superAdminToken)
                        .header("X-Organization-Id", churchOrganizationId.toString()))
                .andExpect(status().isOk());
    }

    @Test
    @Order(5)
    void orgAdminCannotAccessOwnerDashboard() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "church-%d@example.org",
                                  "password": "password123"
                                }
                                """.formatted(orgSuffix)))
                .andExpect(status().isOk())
                .andReturn();

        String orgAdminToken = com.jayway.jsonpath.JsonPath.read(
                loginResult.getResponse().getContentAsString(), "$.data.accessToken");

        mockMvc.perform(get(DASHBOARD)
                        .header("Authorization", "Bearer " + orgAdminToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(6)
    void ownerDashboardCapturesAndExposesSystemLogs() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "nobody-%d@example.org",
                                  "password": "wrong-password"
                                }
                                """.formatted(orgSuffix)))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get(DASHBOARD + "/logs")
                        .param("category", "AUTH")
                        .header("Authorization", "Bearer " + superAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data[0].category").value("AUTH"));

        mockMvc.perform(get(DASHBOARD)
                        .header("Authorization", "Bearer " + superAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.logsLast24Hours").value(greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.recentAlerts").isArray())
                .andExpect(jsonPath("$.data.recentErrors").isArray());

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "church-%d@example.org",
                                  "password": "password123"
                                }
                                """.formatted(orgSuffix)))
                .andExpect(status().isOk())
                .andReturn();

        String orgAdminToken = com.jayway.jsonpath.JsonPath.read(
                loginResult.getResponse().getContentAsString(), "$.data.accessToken");

        mockMvc.perform(get(DASHBOARD + "/logs")
                        .header("Authorization", "Bearer " + orgAdminToken))
                .andExpect(status().isForbidden());
    }
}
