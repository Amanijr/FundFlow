package com.project.daisyDonation.platform.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.auth.dto.AuthResponse;
import com.project.daisyDonation.auth.dto.BootstrapSuperAdminRequest;
import com.project.daisyDonation.auth.dto.CreateSuperAdminRequest;
import com.project.daisyDonation.auth.dto.UserResponse;
import com.project.daisyDonation.auth.entity.Role;
import com.project.daisyDonation.auth.entity.User;
import com.project.daisyDonation.auth.repository.UserRepository;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.exception.UnauthorizedException;
import com.project.daisyDonation.common.security.JwtService;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.PlatformAccess;
import com.project.daisyDonation.organization.dto.OrganizationResponse;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.organization.repository.OrganizationRepository;
import com.project.daisyDonation.organization.service.OrganizationService;
import com.project.daisyDonation.platform.dto.OrganizationStatusRequest;
import com.project.daisyDonation.platform.dto.PlatformStatsResponse;
import com.project.daisyDonation.platform.dto.PlatformUserResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlatformService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationService organizationService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.platform.bootstrap-secret:}")
    private String bootstrapSecret;

    @Transactional
    public AuthResponse bootstrapSuperAdmin(String providedSecret, BootstrapSuperAdminRequest request) {
        validateBootstrapSecret(providedSecret);

        if (userRepository.existsByRoleAndDeletedFalse(Role.SUPER_ADMIN)) {
            throw new BadRequestException("A super administrator already exists. Use login instead.");
        }

        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        User user = createSuperAdminUser(request.getEmail(), request.getPassword(),
                request.getFirstName(), request.getLastName());
        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional
    public UserResponse createSuperAdmin(UserPrincipal principal, CreateSuperAdminRequest request) {
        PlatformAccess.requireSuperAdmin(principal);

        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        User user = createSuperAdminUser(request.getEmail(), request.getPassword(),
                request.getFirstName(), request.getLastName());
        return toUserResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public PlatformStatsResponse stats(UserPrincipal principal) {
        PlatformAccess.requireSuperAdmin(principal);

        return PlatformStatsResponse.builder()
                .totalOrganizations(organizationRepository.countByDeletedFalse())
                .activeOrganizations(organizationRepository.countByActiveTrueAndDeletedFalse())
                .totalUsers(userRepository.countByDeletedFalse())
                .superAdminCount(userRepository.countByRoleAndDeletedFalse(Role.SUPER_ADMIN))
                .build();
    }

    @Transactional(readOnly = true)
    public List<OrganizationResponse> listOrganizations(UserPrincipal principal) {
        PlatformAccess.requireSuperAdmin(principal);
        return organizationRepository.findByDeletedFalseOrderByNameAsc().stream()
                .map(organizationService::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getOrganization(UserPrincipal principal, Long organizationId) {
        PlatformAccess.requireSuperAdmin(principal);
        return organizationService.toResponse(requireOrganization(organizationId));
    }

    @Transactional
    public OrganizationResponse updateOrganizationStatus(
            UserPrincipal principal, Long organizationId, OrganizationStatusRequest request) {
        PlatformAccess.requireSuperAdmin(principal);

        Organization organization = requireOrganization(organizationId);
        organization.setActive(request.isActive());
        return organizationService.toResponse(organizationRepository.save(organization));
    }

    @Transactional(readOnly = true)
    public List<PlatformUserResponse> listUsers(UserPrincipal principal) {
        PlatformAccess.requireSuperAdmin(principal);

        return userRepository.findByDeletedFalseOrderByEmailAsc().stream()
                .map(this::toPlatformUserResponse)
                .toList();
    }

    private User createSuperAdminUser(String email, String password, String firstName, String lastName) {
        User user = new User();
        user.setOrganization(null);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(Role.SUPER_ADMIN);
        user.setEnabled(true);
        return user;
    }

    private Organization requireOrganization(Long organizationId) {
        return organizationRepository.findByIdAndDeletedFalse(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
    }

    private void validateBootstrapSecret(String providedSecret) {
        if (bootstrapSecret == null || bootstrapSecret.isBlank()) {
            throw new BadRequestException("Platform bootstrap is not configured");
        }
        if (providedSecret == null || !bootstrapSecret.equals(providedSecret)) {
            throw new UnauthorizedException("Invalid platform bootstrap secret");
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole(), null);
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .organizationId(null)
                .role(user.getRole())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .organizationId(null)
                .enabled(user.isEnabled())
                .build();
    }

    private PlatformUserResponse toPlatformUserResponse(User user) {
        Organization organization = user.getOrganization();
        return PlatformUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .organizationId(organization != null ? organization.getId() : null)
                .organizationName(organization != null ? organization.getName() : null)
                .enabled(user.isEnabled())
                .build();
    }
}
