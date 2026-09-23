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

        MvcResult serviceResult = mockMvc.perform(post("/api/v1/church/services")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Midweek Prayer",
                                  "serviceDate": "%s",
                                  "ministryId": %d
                                }
                                """.formatted(LocalDate.now(), ministryId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Midweek Prayer"))
                .andReturn();

        Long serviceId = ((Number) com.jayway.jsonpath.JsonPath.read(
                serviceResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/church/attendance")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "serviceEventId": %d,
                                  "attendanceCount": 45
                                }
                                """.formatted(serviceId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.serviceEventId").value(serviceId.intValue()))
                .andExpect(jsonPath("$.data.eventName").value("Midweek Prayer"));

        mockMvc.perform(post("/api/v1/church/attendance")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "serviceEventId": %d,
                                  "attendanceCount": 50
                                }
                                """.formatted(serviceId)))
                .andExpect(status().isConflict());

        mockMvc.perform(get("/api/v1/church/services/" + serviceId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.attendanceCount").value(45));

        mockMvc.perform(get("/api/v1/church/attendance/summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalAttendance").value(165));

        MvcResult memberResult = mockMvc.perform(post("/api/v1/members")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Asha",
                                  "lastName": "Mwanga",
                                  "membershipStatus": "ACTIVE"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();

        Long memberId = ((Number) com.jayway.jsonpath.JsonPath.read(
                memberResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/church/ministries/" + ministryId + "/members")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "memberId": %d,
                                  "role": "Volunteer"
                                }
                                """.formatted(memberId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.memberName").value("Asha Mwanga"))
                .andExpect(jsonPath("$.data.ministryName").value("Youth Ministry"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        mockMvc.perform(post("/api/v1/church/ministries/" + ministryId + "/members")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "memberId": %d
                                }
                                """.formatted(memberId)))
                .andExpect(status().isConflict());

        mockMvc.perform(get("/api/v1/church/ministries/" + ministryId + "/members")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(get("/api/v1/members/" + memberId + "/ministries")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].ministryId").value(ministryId.intValue()))
                .andExpect(jsonPath("$.data[0].role").value("Volunteer"));

        mockMvc.perform(get("/api/v1/church/ministries")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].memberCount").value(1));

        mockMvc.perform(get("/api/v1/church/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.memberCount").value(1))
                .andExpect(jsonPath("$.data.activeMemberCount").value(1))
                .andExpect(jsonPath("$.data.attendanceThisYear").value(165))
                .andExpect(jsonPath("$.data.lastAttendanceCount").value(45));

        mockMvc.perform(get("/api/v1/church/reports/membership")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.active").value(1));

        MvcResult partnershipResult = mockMvc.perform(post("/api/v1/church/partnerships")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "memberId": %d,
                                  "monthlyAmount": 50000.00,
                                  "startDate": "%s",
                                  "status": "ACTIVE"
                                }
                                """.formatted(memberId, LocalDate.now().withDayOfMonth(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.memberName").value("Asha Mwanga"))
                .andExpect(jsonPath("$.data.thisMonthStatus").value("MISSING"))
                .andReturn();

        Long partnershipId = ((Number) com.jayway.jsonpath.JsonPath.read(
                partnershipResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        MvcResult giftResult = mockMvc.perform(post("/api/v1/donations")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "memberId": %d,
                                  "partnershipId": %d,
                                  "amount": 20000.00,
                                  "donationType": "ONE_TIME"
                                }
                                """.formatted(memberId, partnershipId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.partnershipId").value(partnershipId.intValue()))
                .andReturn();

        Long giftId = ((Number) com.jayway.jsonpath.JsonPath.read(
                giftResult.getResponse().getContentAsString(), "$.data.id")).longValue();

        mockMvc.perform(post("/api/v1/donations/" + giftId + "/payments/manual")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "paymentMethod": "CASH",
                                  "receiptNumber": "RCP-PARTNER-1",
                                  "collectionDate": "%sT10:00:00"
                                }
                                """.formatted(LocalDate.now())))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/church/partnerships/" + partnershipId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.thisMonthReceived").value(20000.00))
                .andExpect(jsonPath("$.data.thisMonthExpected").value(50000.00))
                .andExpect(jsonPath("$.data.thisMonthStatus").value("PARTIAL"));

        mockMvc.perform(get("/api/v1/members/" + memberId + "/partnerships")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].thisMonthStatus").value("PARTIAL"));
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
