package com.project.daisyDonation.vertical;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class OrganizationModulesIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void churchMinistriesAndAttendance() throws Exception {
        String token = registerOrg("CHURCH", "Grace Church", "grace-church");

        MvcResult ministryResult = mockMvc.perform(post("/api/v1/church/ministries")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Youth Ministry",
                                  "code": "YOUTH",
                                  "leaderName": "Pastor John",
                                  "active": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        Long ministryId = ((Number) com.jayway.jsonpath.JsonPath.read(
                ministryResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/church/attendance")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ministryId": %d,
                                  "serviceDate": "%s",
                                  "eventName": "Sunday Service",
                                  "attendanceCount": 120
                                }
                                """.formatted(ministryId, LocalDate.now())))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/church/attendance/summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalAttendance").value(120));
    }

    @Test
    void ngoBeneficiariesAndImpact() throws Exception {
        String token = registerOrg("NGO", "Hope NGO", "hope-ngo-vertical");

        MvcResult beneficiaryResult = mockMvc.perform(post("/api/v1/beneficiaries")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Amina",
                                  "lastName": "Hassan",
                                  "code": "BEN-001",
                                  "beneficiaryType": "GENERAL",
                                  "status": "ACTIVE"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        Long beneficiaryId = ((Number) com.jayway.jsonpath.JsonPath.read(
                beneficiaryResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/beneficiaries/impact")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "beneficiaryId": %d,
                                  "title": "Completed training",
                                  "recordedDate": "%s",
                                  "outcomeMetric": "Courses completed",
                                  "outcomeValue": "3"
                                }
                                """.formatted(beneficiaryId, LocalDate.now())))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/beneficiaries/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.beneficiaryCount").value(1))
                .andExpect(jsonPath("$.data.impactRecordCount").value(1));
    }

    @Test
    void schoolStudentSponsorship() throws Exception {
        long suffix = System.nanoTime();
        String token = registerOrg("SCHOOL", "Bright School", "bright-school-" + suffix);

        MvcResult donorResult = mockMvc.perform(post("/api/v1/donors")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Sam",
                                  "lastName": "Sponsor",
                                  "email": "sam-%d@example.com",
                                  "phone": "+1555000%d"
                                }
                                """.formatted(suffix, suffix % 10000)))
                .andExpect(status().isCreated())
                .andReturn();

        Long donorId = ((Number) com.jayway.jsonpath.JsonPath.read(
                donorResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        MvcResult studentResult = mockMvc.perform(post("/api/v1/beneficiaries")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Leo",
                                  "lastName": "Student",
                                  "code": "STU-001",
                                  "beneficiaryType": "STUDENT",
                                  "status": "ACTIVE"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        Long studentId = ((Number) com.jayway.jsonpath.JsonPath.read(
                studentResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/school/sponsorships")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "beneficiaryId": %d,
                                  "donorId": %d,
                                  "academicYear": "2026",
                                  "term": "Spring",
                                  "amount": 1200.00,
                                  "status": "ACTIVE"
                                }
                                """.formatted(studentId, donorId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.amount").value(1200.00))
                .andExpect(jsonPath("$.data.beneficiaryName").value("Leo Student"));
    }

    private String registerOrg(String type, String name, String slug) throws Exception {
        long suffix = System.nanoTime();
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "organization": {
                                    "name": "%s",
                                    "slug": "%s-%d",
                                    "type": "%s",
                                    "email": "admin@%s-%d.org"
                                  },
                                  "email": "admin@%s-%d.org",
                                  "password": "password123",
                                  "firstName": "Admin",
                                  "lastName": "User"
                                }
                                """.formatted(name, slug, suffix, type, slug, suffix, slug, suffix)))
                .andExpect(status().isCreated())
                .andReturn();

        return com.jayway.jsonpath.JsonPath.read(
                result.getResponse().getContentAsString(), "$.data.accessToken");
    }
}
