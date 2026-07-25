package com.project.daisyDonation.platform.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.auth.dto.AuthResponse;
import com.project.daisyDonation.auth.dto.LoginRequest;
import com.project.daisyDonation.auth.dto.UserResponse;
import com.project.daisyDonation.auth.entity.Role;
import com.project.daisyDonation.auth.entity.User;
import com.project.daisyDonation.auth.repository.UserRepository;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.exception.UnauthorizedException;
import com.project.daisyDonation.common.security.JwtService;
import com.project.daisyDonation.common.security.TokenType;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.PlatformAccess;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.organization.repository.OrganizationRepository;
import com.project.daisyDonation.platform.observability.service.SystemLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlatformAuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final JwtService jwtService;
    private final SystemLogService systemLogService;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findByEmailAndDeletedFalse(principal.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            if (user.getRole() != Role.SUPER_ADMIN) {
                systemLogService.recordSecurity(
                        "PLATFORM",
                        "Non-platform user blocked from platform login",
                        "email=" + user.getEmail(),
                        user.getEmail());
                throw new UnauthorizedException("This account cannot access the platform console");
            }
            if (!user.isEnabled()) {
                systemLogService.recordSecurity(
                        "PLATFORM",
                        "Disabled platform owner login blocked",
                        "email=" + user.getEmail(),
                        user.getEmail());
                throw new UnauthorizedException("Account disabled");
            }

            systemLogService.recordSecurity(
                    "PLATFORM",
                    "Platform owner login succeeded",
                    "email=" + user.getEmail(),
                    user.getEmail());
            return buildPlatformAuthResponse(user);
        } catch (UnauthorizedException ex) {
            throw ex;
        } catch (Exception ex) {
            systemLogService.recordSecurity(
                    "PLATFORM",
                    "Platform owner login failed",
                    "email=" + request.getEmail(),
                    request.getEmail());
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    @Transactional
    public AuthResponse impersonate(UserPrincipal principal, Long organizationId) {
        PlatformAccess.requireSuperAdmin(principal);

        Organization organization = organizationRepository.findByIdAndDeletedFalse(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        if (!organization.isActive()) {
            throw new UnauthorizedException("Organization inactive");
        }

        User user = userRepository.findByIdAndDeletedFalse(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        systemLogService.recordPlatformAction(
                principal,
                "PLATFORM",
                "Tenant impersonation started",
                "organizationId=" + organizationId + ", organizationName=" + organization.getName());

        String token = jwtService.generateImpersonationToken(user.getId(), user.getEmail(), organizationId);
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .tokenPlane(TokenType.IMPERSONATION.name())
                .userId(user.getId())
                .organizationId(organizationId)
                .organizationType(organization.getType())
                .role(user.getRole())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserPrincipal principal) {
        PlatformAccess.requireSuperAdmin(principal);
        User user = userRepository.findByEmailAndDeletedFalse(principal.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .organizationId(null)
                .organizationType(null)
                .enabled(user.isEnabled())
                .build();
    }

    private AuthResponse buildPlatformAuthResponse(User user) {
        String token = jwtService.generatePlatformToken(user.getId(), user.getEmail(), user.getRole());
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .tokenPlane(TokenType.PLATFORM.name())
                .userId(user.getId())
                .organizationId(null)
                .organizationType(null)
                .role(user.getRole())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}
