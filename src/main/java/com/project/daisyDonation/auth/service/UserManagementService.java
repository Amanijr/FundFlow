package com.project.daisyDonation.auth.service;

import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.auth.dto.CreateUserRequest;
import com.project.daisyDonation.auth.dto.UpdateUserRoleRequest;
import com.project.daisyDonation.auth.dto.UserResponse;
import com.project.daisyDonation.auth.entity.Role;
import com.project.daisyDonation.auth.entity.User;
import com.project.daisyDonation.auth.repository.UserRepository;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private static final Set<Role> ASSIGNABLE_ROLES = EnumSet.of(
            Role.ORG_ADMIN,
            Role.FINANCE_MANAGER,
            Role.ACCOUNTANT,
            Role.FUNDRAISING_MANAGER,
            Role.PROGRAM_MANAGER,
            Role.STAFF,
            Role.VOLUNTEER,
            Role.AUDITOR,
            Role.VIEW_ONLY);

    private final UserRepository userRepository;
    private final TenantSupport tenantSupport;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse invite(UserPrincipal principal, CreateUserRequest request) {
        requireOrgAdmin(principal);
        validateAssignableRole(request.getRole());

        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        Organization organization = tenantSupport.organization(principal);

        User user = User.builder()
                .organization(organization)
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole())
                .enabled(true)
                .build();

        return toResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserResponse> list(UserPrincipal principal) {
        requireOrgAdmin(principal);
        Long organizationId = tenantSupport.organizationId(principal);

        return userRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .sorted(Comparator.comparing(User::getLastName).thenComparing(User::getFirstName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getById(UserPrincipal principal, Long userId) {
        requireOrgAdmin(principal);
        return toResponse(requireOrganizationUser(principal, userId));
    }

    @Transactional
    public UserResponse updateRole(UserPrincipal principal, Long userId, UpdateUserRoleRequest request) {
        requireOrgAdmin(principal);
        validateAssignableRole(request.getRole());

        if (principal.getId().equals(userId)) {
            throw new BadRequestException("You cannot change your own role");
        }

        User user = requireOrganizationUser(principal, userId);
        user.setRole(request.getRole());
        return toResponse(userRepository.save(user));
    }

    private User requireOrganizationUser(UserPrincipal principal, Long userId) {
        Long organizationId = tenantSupport.organizationId(principal);
        return userRepository.findByIdAndOrganizationIdAndDeletedFalse(userId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void requireOrgAdmin(UserPrincipal principal) {
        if (principal.getRole() != Role.ORG_ADMIN) {
            throw new BadRequestException("Only organization administrators can manage users");
        }
    }

    private void validateAssignableRole(Role role) {
        if (!ASSIGNABLE_ROLES.contains(role)) {
            throw new BadRequestException("Role cannot be assigned: " + role);
        }
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .organizationId(user.getOrganization() != null ? user.getOrganization().getId() : null)
                .enabled(user.isEnabled())
                .build();
    }
}
