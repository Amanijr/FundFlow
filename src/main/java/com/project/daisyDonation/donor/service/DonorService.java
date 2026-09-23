package com.project.daisyDonation.donor.service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.common.service.VerticalAccess;
import com.project.daisyDonation.donation.repository.DonationRepository;
import com.project.daisyDonation.donation.service.DonationMapper;
import com.project.daisyDonation.donor.dto.DonorDetailResponse;
import com.project.daisyDonation.donor.dto.DonorRequest;
import com.project.daisyDonation.donor.dto.DonorResponse;
import com.project.daisyDonation.donor.entity.Donor;
import com.project.daisyDonation.donor.entity.MembershipStatus;
import com.project.daisyDonation.donor.repository.DonorRepository;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DonorService {

    private final DonorRepository donorRepository;
    private final DonationRepository donationRepository;
    private final TenantSupport tenantSupport;

    @Transactional
    public DonorResponse create(UserPrincipal principal, DonorRequest request) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireNotChurch(organization);
        String email = blankToNull(request.getEmail());
        String phone = blankToNull(request.getPhone());
        validateEmailFormat(email);
        validateUniqueContact(organization.getId(), email, phone, null);

        Donor donor = new Donor();
        donor.setOrganization(organization);
        applyRequest(donor, request);
        return toResponse(donorRepository.save(donor));
    }

    @Transactional(readOnly = true)
    public List<DonorResponse> list(UserPrincipal principal) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireNotChurch(organization);
        Long organizationId = organization.getId();
        return donorRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .sorted(Comparator.comparing(Donor::getLastName).thenComparing(Donor::getFirstName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DonorDetailResponse getById(UserPrincipal principal, Long donorId) {
        Donor donor = requireDonor(principal, donorId);
        Long organizationId = tenantSupport.organizationId(principal);

        var donations = donationRepository.findByDonorIdAndOrganizationIdAndDeletedFalse(donorId, organizationId)
                .stream()
                .sorted(Comparator.comparing(
                        d -> d.getDonationTime() != null ? d.getDonationTime() : d.getCreatedAt(),
                        Comparator.reverseOrder()))
                .limit(10)
                .map(DonationMapper::toSummary)
                .toList();

        DonorResponse base = toResponse(donor);
        return DonorDetailResponse.builder()
                .id(base.getId())
                .organizationId(base.getOrganizationId())
                .firstName(base.getFirstName())
                .lastName(base.getLastName())
                .email(base.getEmail())
                .phone(base.getPhone())
                .address(base.getAddress())
                .city(base.getCity())
                .state(base.getState())
                .country(base.getCountry())
                .membershipStatus(base.getMembershipStatus())
                .joinedAt(base.getJoinedAt())
                .notes(base.getNotes())
                .createdAt(base.getCreatedAt())
                .lifetimeValue(donationRepository.sumCompletedAmountByDonor(donorId, organizationId))
                .donationCount(donationRepository.countCompletedByDonor(donorId, organizationId))
                .recentDonations(donations)
                .build();
    }

    @Transactional
    public DonorResponse update(UserPrincipal principal, Long donorId, DonorRequest request) {
        Donor donor = requireDonor(principal, donorId);
        String email = blankToNull(request.getEmail());
        String phone = blankToNull(request.getPhone());
        validateEmailFormat(email);
        validateUniqueContact(donor.getOrganization().getId(), email, phone, donorId);
        applyRequest(donor, request);
        return toResponse(donorRepository.save(donor));
    }

    @Transactional
    public void delete(UserPrincipal principal, Long donorId) {
        Donor donor = requireDonor(principal, donorId);
        donor.setDeleted(true);
        donorRepository.save(donor);
    }

    public Donor requireDonor(UserPrincipal principal, Long donorId) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireNotChurch(organization);
        return donorRepository.findByIdAndOrganizationIdAndDeletedFalse(donorId, organization.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));
    }

    private void validateUniqueContact(Long organizationId, String email, String phone, Long excludeDonorId) {
        if (email != null
                && donorRepository.existsByOrganizationIdAndEmailAndDeletedFalse(organizationId, email)
                && !isSameDonorEmail(organizationId, email, excludeDonorId)) {
            throw new ConflictException("A donor with this email already exists in the organization");
        }
        if (phone != null
                && donorRepository.existsByOrganizationIdAndPhoneAndDeletedFalse(organizationId, phone)
                && !isSameDonorPhone(organizationId, phone, excludeDonorId)) {
            throw new ConflictException("A donor with this phone already exists in the organization");
        }
    }

    private boolean isSameDonorEmail(Long organizationId, String email, Long donorId) {
        if (donorId == null || email == null) {
            return false;
        }
        return donorRepository.findByIdAndOrganizationIdAndDeletedFalse(donorId, organizationId)
                .map(d -> d.getEmail() != null && d.getEmail().equalsIgnoreCase(email))
                .orElse(false);
    }

    private boolean isSameDonorPhone(Long organizationId, String phone, Long donorId) {
        if (donorId == null || phone == null) {
            return false;
        }
        return donorRepository.findByIdAndOrganizationIdAndDeletedFalse(donorId, organizationId)
                .map(d -> Objects.equals(d.getPhone(), phone))
                .orElse(false);
    }

    private void applyRequest(Donor donor, DonorRequest request) {
        if (request.getFirstName() == null || request.getFirstName().isBlank()) {
            throw new BadRequestException("First name is required");
        }
        donor.setFirstName(request.getFirstName().trim());
        donor.setLastName(request.getLastName().trim());
        donor.setEmail(blankToNull(request.getEmail()));
        donor.setPhone(blankToNull(request.getPhone()));
        donor.setAddress(blankToNull(request.getAddress()));
        donor.setCity(blankToNull(request.getCity()));
        donor.setState(blankToNull(request.getState()));
        donor.setCountry(blankToNull(request.getCountry()));
        donor.setMembershipStatus(
                request.getMembershipStatus() != null ? request.getMembershipStatus() : MembershipStatus.ACTIVE);
        donor.setJoinedAt(request.getJoinedAt());
        donor.setNotes(blankToNull(request.getNotes()));
    }

    private void validateEmailFormat(String email) {
        if (email == null) {
            return;
        }
        if (!email.contains("@") || email.startsWith("@") || email.endsWith("@")) {
            throw new BadRequestException("Enter a valid email");
        }
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private DonorResponse toResponse(Donor donor) {
        return DonorResponse.builder()
                .id(donor.getId())
                .organizationId(donor.getOrganization().getId())
                .firstName(donor.getFirstName())
                .lastName(donor.getLastName())
                .email(donor.getEmail())
                .phone(donor.getPhone())
                .address(donor.getAddress())
                .city(donor.getCity())
                .state(donor.getState())
                .country(donor.getCountry())
                .membershipStatus(donor.getMembershipStatus() != null
                        ? donor.getMembershipStatus()
                        : MembershipStatus.ACTIVE)
                .joinedAt(donor.getJoinedAt())
                .notes(donor.getNotes())
                .createdAt(donor.getCreatedAt())
                .build();
    }
}
