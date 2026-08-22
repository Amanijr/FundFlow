package com.project.daisyDonation.platform.service;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.auth.dto.AuthResponse;
import com.project.daisyDonation.auth.dto.BootstrapSuperAdminRequest;
import com.project.daisyDonation.auth.dto.CreateSuperAdminRequest;
import com.project.daisyDonation.auth.dto.UpdateUserRoleRequest;
import com.project.daisyDonation.auth.dto.UserResponse;
import com.project.daisyDonation.auth.entity.Role;
import com.project.daisyDonation.auth.entity.User;
import com.project.daisyDonation.auth.repository.UserRepository;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.exception.UnauthorizedException;
import com.project.daisyDonation.common.security.JwtService;
import com.project.daisyDonation.common.security.TokenType;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.PlatformAccess;
import com.project.daisyDonation.organization.dto.OrganizationResponse;
import com.project.daisyDonation.organization.dto.OrganizationRequest;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.organization.repository.OrganizationRepository;
import com.project.daisyDonation.organization.service.OrganizationService;
import com.project.daisyDonation.platform.dto.OrganizationStatusRequest;
import com.project.daisyDonation.platform.dto.PlatformCreateUserRequest;
import com.project.daisyDonation.platform.dto.PlatformStatsResponse;
import com.project.daisyDonation.platform.dto.PlatformUserResponse;
import com.project.daisyDonation.platform.dto.PlatformUserStatusRequest;
import com.project.daisyDonation.platform.observability.service.SystemLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlatformService {

    private static final Set<Role> TENANT_ASSIGNABLE_ROLES = EnumSet.of(
            Role.ORG_ADMIN,
            Role.FINANCE_MANAGER,
            Role.ACCOUNTANT,
            Role.FUNDRAISING_MANAGER,
            Role.PROGRAM_MANAGER,
            Role.STAFF,
            Role.VOLUNTEER,
            Role.AUDITOR,
            Role.DONOR,
            Role.VIEW_ONLY);

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationService organizationService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SystemLogService systemLogService;

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
        systemLogService.recordSecurity("PLATFORM", "Super administrator bootstrapped", "email=" + user.getEmail(), user.getEmail());
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
        user = userRepository.save(user);
        systemLogService.recordPlatformAction(principal, "PLATFORM", "Super administrator created", "email=" + user.getEmail());
        return toUserResponse(user);
    }

    @Transactional
    public OrganizationResponse createOrganization(UserPrincipal principal, OrganizationRequest request) {
        PlatformAccess.requireSuperAdmin(principal);

        Organization organization = organizationService.create(request);
        systemLogService.recordPlatformAction(
                principal,
                "PLATFORM",
                "Organization created",
                "organizationId=" + organization.getId() + ", name=" + organization.getName());
        return organizationService.toResponse(organization);
    }

    @Transactional
    public PlatformUserResponse createTenantUser(UserPrincipal principal, PlatformCreateUserRequest request) {
        PlatformAccess.requireSuperAdmin(principal);
        validateTenantRole(request.getRole());

        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        Organization organization = requireOrganization(request.getOrganizationId());
        User user = User.builder()
                .organization(organization)
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole())
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        systemLogService.recordPlatformAction(
                principal,
                "PLATFORM",
                "Tenant user created",
                "userId=" + saved.getId() + ", organizationId=" + organization.getId() + ", role=" + saved.getRole());
        return toPlatformUserResponse(saved);
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
        Organization saved = organizationRepository.save(organization);
        systemLogService.recordPlatformAction(
                principal,
                "PLATFORM",
                "Organization status updated",
                "organizationId=" + organizationId + ", active=" + request.isActive());
        return organizationService.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<PlatformUserResponse> listUsers(UserPrincipal principal) {
        PlatformAccess.requireSuperAdmin(principal);

        return userRepository.findByDeletedFalseOrderByEmailAsc().stream()
                .map(this::toPlatformUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PlatformUserResponse getUser(UserPrincipal principal, Long userId) {
        PlatformAccess.requireSuperAdmin(principal);
        return toPlatformUserResponse(requireUser(userId));
    }

    @Transactional
    public PlatformUserResponse updateUserRole(UserPrincipal principal, Long userId, UpdateUserRoleRequest request) {
        PlatformAccess.requireSuperAdmin(principal);
        validateTenantRole(request.getRole());

        User user = requireUser(userId);
        if (user.getRole() == Role.SUPER_ADMIN) {
            throw new BadRequestException("Use super-admin management for platform owner accounts");
        }

        user.setRole(request.getRole());
        User saved = userRepository.save(user);
        systemLogService.recordPlatformAction(
                principal,
                "PLATFORM",
                "Tenant user role updated",
                "userId=" + saved.getId() + ", role=" + saved.getRole());
        return toPlatformUserResponse(saved);
    }

    @Transactional
    public PlatformUserResponse updateUserStatus(UserPrincipal principal, Long userId, PlatformUserStatusRequest request) {
        PlatformAccess.requireSuperAdmin(principal);

        if (principal.getId().equals(userId)) {
            throw new BadRequestException("You cannot disable your own platform account");
        }

        User user = requireUser(userId);
        user.setEnabled(Boolean.TRUE.equals(request.getEnabled()));
        User saved = userRepository.save(user);
        systemLogService.recordPlatformAction(
                principal,
                "PLATFORM",
                saved.isEnabled() ? "User account enabled" : "User account disabled",
                "userId=" + saved.getId() + ", organizationId="
                        + (saved.getOrganization() != null ? saved.getOrganization().getId() : "platform"));
        return toPlatformUserResponse(saved);
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

    private User requireUser(Long userId) {
        return userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void validateTenantRole(Role role) {
        if (!TENANT_ASSIGNABLE_ROLES.contains(role)) {
            throw new BadRequestException("Role cannot be assigned to tenant users: " + role);
        }
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
        String token = jwtService.generatePlatformToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .tokenPlane(TokenType.PLATFORM.name())
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
