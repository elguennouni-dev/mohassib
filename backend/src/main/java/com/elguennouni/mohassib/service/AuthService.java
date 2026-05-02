package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.dto.LoginRequest;
import com.elguennouni.mohassib.dto.LoginResponse;
import com.elguennouni.mohassib.dto.RefreshTokenResponse;
import com.elguennouni.mohassib.dto.RegisterRequest;
import com.elguennouni.mohassib.dto.UserResponse;
import com.elguennouni.mohassib.entity.User;
import com.elguennouni.mohassib.exception.EmailAlreadyExistsException;
import com.elguennouni.mohassib.exception.InvalidCredentialsException;
import com.elguennouni.mohassib.exception.InvalidTokenException;
import com.elguennouni.mohassib.repository.UserRepository;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException(normalizedEmail);
        }

        User user = User.builder()
                .email(normalizedEmail)
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();

        User saved = userRepository.save(user);
        return UserResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        return new LoginResponse(
                accessToken,
                refreshToken,
                jwtService.getAccessTokenTtlSeconds(),
                UserResponse.from(user)
        );
    }

    @Transactional(readOnly = true)
    public RefreshTokenResponse refreshAccessToken(String refreshToken) {
        Claims claims = jwtService.parseAndValidate(refreshToken)
                .orElseThrow(InvalidTokenException::new);

        if (!jwtService.isRefreshToken(claims)) {
            throw new InvalidTokenException();
        }

        Long userId = jwtService.extractUserId(claims);
        User user = userRepository.findById(userId)
                .orElseThrow(InvalidTokenException::new);

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        return new RefreshTokenResponse(accessToken, jwtService.getAccessTokenTtlSeconds());
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(InvalidTokenException::new);
        return UserResponse.from(user);
    }
}
