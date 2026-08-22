package com.project.daisyDonation.common.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.project.daisyDonation.accounting.service.AccountingService;
import com.project.daisyDonation.auth.entity.Role;
import com.project.daisyDonation.auth.entity.User;
import com.project.daisyDonation.auth.repository.UserRepository;
import com.project.daisyDonation.campaign.dto.CampaignRequest;
import com.project.daisyDonation.campaign.entity.CampaignStatus;
import com.project.daisyDonation.campaign.service.CampaignService;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.donation.dto.DonationCreateRequest;
import com.project.daisyDonation.donation.entity.DonationType;
import com.project.daisyDonation.donation.service.DonationService;
import com.project.daisyDonation.donor.dto.DonorRequest;
import com.project.daisyDonation.donor.service.DonorService;
import com.project.daisyDonation.expense.dto.ExpensePaymentRequest;
import com.project.daisyDonation.expense.dto.ExpenseRequest;
import com.project.daisyDonation.expense.entity.ExpenseCategory;
import com.project.daisyDonation.expense.entity.ExpenseType;
import com.project.daisyDonation.expense.service.ExpenseService;
import com.project.daisyDonation.organization.dto.OrganizationRequest;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.organization.entity.OrganizationType;
import com.project.daisyDonation.organization.repository.OrganizationRepository;
import com.project.daisyDonation.organization.service.OrganizationService;
import com.project.daisyDonation.payment.dto.PaymentRequest;
import com.project.daisyDonation.payment.entity.PaymentMethod;
import com.project.daisyDonation.payment.service.PaymentProcessingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Profile("dev")
@ConditionalOnProperty(name = "app.dev.seed-enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class DevDataSeeder implements ApplicationRunner {

    private static final String DEMO_PASSWORD = "demo";
    private static final String DEMO_ORG_SLUG = "crosslife";

    private final OrganizationRepository organizationRepository;
    private final OrganizationService organizationService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DonorService donorService;
    private final CampaignService campaignService;
    private final DonationService donationService;
    private final PaymentProcessingService paymentProcessingService;
    private final AccountingService accountingService;
    private final ExpenseService expenseService;

    @Override
    public void run(ApplicationArguments args) {
        if (organizationRepository.findBySlugAndDeletedFalse(DEMO_ORG_SLUG).isPresent()) {
            log.info("Dev demo data already present (slug={}); skipping seed", DEMO_ORG_SLUG);
            return;
        }

        log.info("Seeding dev demo data for Notus/frontends (password: {})", DEMO_PASSWORD);

        Organization organization = organizationService.create(OrganizationRequest.builder()
                .name("CrossLife Mission Network")
                .slug(DEMO_ORG_SLUG)
                .type(OrganizationType.CHURCH)
                .email("karibu@crosslife.org")
                .phone("+255 653 126 583")
                .city("Dar es Salaam")
                .country("Tanzania")
                .build());

        User admin = saveUser(organization, "admin@demo.local", "Grace", "Admin", Role.ORG_ADMIN);
        saveUser(organization, "finance@demo.local", "David", "Mwangi", Role.FINANCE_MANAGER);
        saveUser(organization, "fundraising@demo.local", "Sarah", "Kimaro", Role.FUNDRAISING_MANAGER);

        if (!userRepository.existsByRoleAndDeletedFalse(Role.SUPER_ADMIN)) {
            User superAdmin = new User();
            superAdmin.setOrganization(null);
            superAdmin.setEmail("super@demo.local");
            superAdmin.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
            superAdmin.setFirstName("Platform");
            superAdmin.setLastName("Admin");
            superAdmin.setRole(Role.SUPER_ADMIN);
            superAdmin.setEnabled(true);
            userRepository.save(superAdmin);
        }

        UserPrincipal principal = new UserPrincipal(admin);

        accountingService.initialize(principal);

        var donorMary = donorService.create(principal, DonorRequest.builder()
                .firstName("Mary")
                .lastName("Mbeki")
                .email("mary.mbeki@example.com")
                .phone("+255712345001")
                .city("Dar es Salaam")
                .country("Tanzania")
                .build());

        var donorJohn = donorService.create(principal, DonorRequest.builder()
                .firstName("John")
                .lastName("Okello")
                .email("john.okello@example.com")
                .phone("+255712345002")
                .city("Arusha")
                .country("Tanzania")
                .build());

        var donorGrace = donorService.create(principal, DonorRequest.builder()
                .firstName("Grace")
                .lastName("Kimaro")
                .email("grace.kimaro@example.com")
                .phone("+255712345003")
                .city("Mwanza")
                .country("Tanzania")
                .build());

        var buildingFund = campaignService.create(principal, CampaignRequest.builder()
                .name("Building Fund 2026")
                .description("New community center construction")
                .targetAmount(new BigDecimal("50000.00"))
                .status(CampaignStatus.ACTIVE)
                .build());

        var youthOutreach = campaignService.create(principal, CampaignRequest.builder()
                .name("Youth Outreach")
                .description("Summer programs and mentorship")
                .targetAmount(new BigDecimal("15000.00"))
                .status(CampaignStatus.ACTIVE)
                .build());

        recordDonation(principal, donorMary.getId(), buildingFund.getId(), "2500.00", "WEB");
        recordDonation(principal, donorJohn.getId(), buildingFund.getId(), "1200.00", "MOBILE");
        recordDonation(principal, donorGrace.getId(), youthOutreach.getId(), "500.00", "EVENT");
        recordDonation(principal, donorMary.getId(), youthOutreach.getId(), "750.00", "WEB");

        var expense = expenseService.create(principal, ExpenseRequest.builder()
                .title("Office supplies")
                .description("Printer paper and stationery")
                .amount(new BigDecimal("180.00"))
                .category(ExpenseCategory.ADMINISTRATIVE)
                .expenseType(ExpenseType.REQUEST)
                .payeeName("Stationery World")
                .build());

        expenseService.submit(principal, expense.getId());
        expenseService.approve(principal, expense.getId());
        expenseService.pay(principal, expense.getId(), ExpensePaymentRequest.builder()
                .paymentMethod(PaymentMethod.CASH)
                .paymentReference("DEMO-EXP-001")
                .paidAt(LocalDateTime.now().minusDays(2))
                .build());

        log.info(
                "Dev demo seed complete. Log in with admin@demo.local / {} (also finance@, fundraising@, super@)",
                DEMO_PASSWORD);
    }

    private User saveUser(Organization organization, String email, String firstName, String lastName, Role role) {
        User user = new User();
        user.setOrganization(organization);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role);
        user.setEnabled(true);
        return userRepository.save(user);
    }

    private void recordDonation(
            UserPrincipal principal,
            Long donorId,
            Long campaignId,
            String amount,
            String source) {
        var donation = donationService.create(principal, DonationCreateRequest.builder()
                .donorId(donorId)
                .campaignId(campaignId)
                .amount(new BigDecimal(amount))
                .donationType(DonationType.ONE_TIME)
                .source(source)
                .build());

        paymentProcessingService.processGatewayPayment(
                principal,
                donation.getId(),
                PaymentRequest.builder()
                        .paymentMethod(PaymentMethod.CARD)
                        .simulateFailure(false)
                        .build());
    }
}
