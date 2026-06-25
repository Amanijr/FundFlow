package com.project.daisyDonation.school.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.beneficiary.entity.Beneficiary;
import com.project.daisyDonation.beneficiary.entity.BeneficiaryType;
import com.project.daisyDonation.beneficiary.service.BeneficiaryService;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.common.service.VerticalAccess;
import com.project.daisyDonation.donor.entity.Donor;
import com.project.daisyDonation.donor.service.DonorService;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.school.dto.StudentSponsorshipRequest;
import com.project.daisyDonation.school.dto.StudentSponsorshipResponse;
import com.project.daisyDonation.school.entity.StudentSponsorship;
import com.project.daisyDonation.school.repository.StudentSponsorshipRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentSponsorshipService {

    private final StudentSponsorshipRepository studentSponsorshipRepository;
    private final BeneficiaryService beneficiaryService;
    private final DonorService donorService;
    private final TenantSupport tenantSupport;

    @Transactional
    public StudentSponsorshipResponse create(UserPrincipal principal, StudentSponsorshipRequest request) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireSchool(organization);

        Beneficiary beneficiary = beneficiaryService.requireBeneficiary(principal, request.getBeneficiaryId());
        if (beneficiary.getBeneficiaryType() != BeneficiaryType.STUDENT) {
            throw new BadRequestException("Sponsorships require a student beneficiary");
        }

        Donor donor = donorService.requireDonor(principal, request.getDonorId());

        StudentSponsorship sponsorship = new StudentSponsorship();
        sponsorship.setOrganization(organization);
        sponsorship.setBeneficiary(beneficiary);
        sponsorship.setDonor(donor);
        applyRequest(sponsorship, request);

        return toResponse(studentSponsorshipRepository.save(sponsorship));
    }

    @Transactional(readOnly = true)
    public List<StudentSponsorshipResponse> list(UserPrincipal principal) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireSchool(organization);

        return studentSponsorshipRepository.findByOrganizationIdAndDeletedFalse(organization.getId()).stream()
                .sorted(Comparator.comparing(StudentSponsorship::getAcademicYear).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public StudentSponsorshipResponse getById(UserPrincipal principal, Long sponsorshipId) {
        return toResponse(requireSponsorship(principal, sponsorshipId));
    }

    @Transactional
    public StudentSponsorshipResponse update(
            UserPrincipal principal, Long sponsorshipId, StudentSponsorshipRequest request) {
        StudentSponsorship sponsorship = requireSponsorship(principal, sponsorshipId);

        Beneficiary beneficiary = beneficiaryService.requireBeneficiary(principal, request.getBeneficiaryId());
        if (beneficiary.getBeneficiaryType() != BeneficiaryType.STUDENT) {
            throw new BadRequestException("Sponsorships require a student beneficiary");
        }

        Donor donor = donorService.requireDonor(principal, request.getDonorId());
        sponsorship.setBeneficiary(beneficiary);
        sponsorship.setDonor(donor);
        applyRequest(sponsorship, request);

        return toResponse(studentSponsorshipRepository.save(sponsorship));
    }

    private StudentSponsorship requireSponsorship(UserPrincipal principal, Long sponsorshipId) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireSchool(organization);
        return studentSponsorshipRepository.findByIdAndOrganizationIdAndDeletedFalse(sponsorshipId, organization.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student sponsorship not found"));
    }

    private void applyRequest(StudentSponsorship sponsorship, StudentSponsorshipRequest request) {
        sponsorship.setAcademicYear(request.getAcademicYear());
        sponsorship.setTerm(request.getTerm());
        sponsorship.setAmount(request.getAmount());
        sponsorship.setStatus(request.getStatus());
        sponsorship.setStartDate(request.getStartDate());
        sponsorship.setEndDate(request.getEndDate());
        sponsorship.setNotes(request.getNotes());
    }

    private StudentSponsorshipResponse toResponse(StudentSponsorship sponsorship) {
        return StudentSponsorshipResponse.builder()
                .id(sponsorship.getId())
                .beneficiaryId(sponsorship.getBeneficiary().getId())
                .beneficiaryName(sponsorship.getBeneficiary().getFirstName() + " "
                        + sponsorship.getBeneficiary().getLastName())
                .donorId(sponsorship.getDonor().getId())
                .donorName(sponsorship.getDonor().getFirstName() + " " + sponsorship.getDonor().getLastName())
                .academicYear(sponsorship.getAcademicYear())
                .term(sponsorship.getTerm())
                .amount(sponsorship.getAmount())
                .status(sponsorship.getStatus())
                .startDate(sponsorship.getStartDate())
                .endDate(sponsorship.getEndDate())
                .notes(sponsorship.getNotes())
                .createdAt(sponsorship.getCreatedAt())
                .build();
    }
}
