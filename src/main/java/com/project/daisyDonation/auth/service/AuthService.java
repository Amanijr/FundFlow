package com.project.daisyDonation.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.auth.dto.AuthResponse;
import com.project.daisyDonation.auth.dto.LoginRequest;
import com.project.daisyDonation.auth.dto.RegisterRequest;
import com.project.daisyDonation.auth.dto.UserResponse;
import com.project.daisyDonation.auth.entity.Role;
import com.project.daisyDonation.auth.entity.User;
import com.project.daisyDonation.auth.repository.UserRepository;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.exception.UnauthorizedException;
import com.project.daisyDonation.common.security.JwtService;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.organization.service.OrganizationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final OrganizationService organizationService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailAndDeletedFalse(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }

        Organization organization = organizationService.create(request.getOrganization());

        User user = new User();
        user.setOrganization(organization);
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(Role.ORG_ADMIN);
        user.setEnabled(true);

        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findByEmailAndDeletedFalse(principal.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            return buildAuthResponse(user);
        } catch (Exception ex) {
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findByEmailAndDeletedFalse(principal.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        Long organizationId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole(), organizationId);

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .organizationId(organizationId)
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
                .organizationId(user.getOrganization() != null ? user.getOrganization().getId() : null)
                .enabled(user.isEnabled())
                .build();
    }
}
