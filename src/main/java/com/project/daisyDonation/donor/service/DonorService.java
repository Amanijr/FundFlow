package com.project.daisyDonation.donor.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.donor.entity.Donor;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.donation.service.DonationMapper;
import com.project.daisyDonation.donor.dto.DonorDetailResponse;
import com.project.daisyDonation.donor.dto.DonorRequest;
import com.project.daisyDonation.donor.dto.DonorResponse;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.donation.repository.DonationRepository;
import com.project.daisyDonation.donor.repository.DonorRepository;

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
        validateUniqueContact(organization.getId(), request.getEmail(), request.getPhone(), null);

        Donor donor = new Donor();
        donor.setOrganization(organization);
        applyRequest(donor, request);
        return toResponse(donorRepository.save(donor));
    }

    @Transactional(readOnly = true)
    public List<DonorResponse> list(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
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

        return DonorDetailResponse.builder()
                .id(donor.getId())
                .organizationId(organizationId)
                .firstName(donor.getFirstName())
                .lastName(donor.getLastName())
                .email(donor.getEmail())
                .phone(donor.getPhone())
                .address(donor.getAddress())
                .city(donor.getCity())
                .state(donor.getState())
                .country(donor.getCountry())
                .createdAt(donor.getCreatedAt())
                .lifetimeValue(donationRepository.sumCompletedAmountByDonor(donorId, organizationId))
                .donationCount(donationRepository.countCompletedByDonor(donorId, organizationId))
                .recentDonations(donations)
                .build();
    }

    @Transactional
    public DonorResponse update(UserPrincipal principal, Long donorId, DonorRequest request) {
        Donor donor = requireDonor(principal, donorId);
        validateUniqueContact(donor.getOrganization().getId(), request.getEmail(), request.getPhone(), donorId);
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
        Long organizationId = tenantSupport.organizationId(principal);
        return donorRepository.findByIdAndOrganizationIdAndDeletedFalse(donorId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));
    }

    private void validateUniqueContact(Long organizationId, String email, String phone, Long excludeDonorId) {
        if (donorRepository.existsByOrganizationIdAndEmailAndDeletedFalse(organizationId, email)
                && !isSameDonorEmail(organizationId, email, excludeDonorId)) {
            throw new ConflictException("A donor with this email already exists in the organization");
        }
        if (donorRepository.existsByOrganizationIdAndPhoneAndDeletedFalse(organizationId, phone)
                && !isSameDonorPhone(organizationId, phone, excludeDonorId)) {
            throw new ConflictException("A donor with this phone already exists in the organization");
        }
    }

    private boolean isSameDonorEmail(Long organizationId, String email, Long donorId) {
        if (donorId == null) {
            return false;
        }
        return donorRepository.findByIdAndOrganizationIdAndDeletedFalse(donorId, organizationId)
                .map(d -> d.getEmail().equalsIgnoreCase(email))
                .orElse(false);
    }

    private boolean isSameDonorPhone(Long organizationId, String phone, Long donorId) {
        if (donorId == null) {
            return false;
        }
        return donorRepository.findByIdAndOrganizationIdAndDeletedFalse(donorId, organizationId)
                .map(d -> d.getPhone().equals(phone))
                .orElse(false);
    }

    private void applyRequest(Donor donor, DonorRequest request) {
        if (request.getFirstName() == null || request.getFirstName().isBlank()) {
            throw new BadRequestException("First name is required");
        }
        donor.setFirstName(request.getFirstName());
        donor.setLastName(request.getLastName());
        donor.setEmail(request.getEmail());
        donor.setPhone(request.getPhone());
        donor.setAddress(request.getAddress());
        donor.setCity(request.getCity());
        donor.setState(request.getState());
        donor.setCountry(request.getCountry());
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
                .createdAt(donor.getCreatedAt())
                .build();
    }
}
