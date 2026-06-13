package com.elguennouni.mohassib.service;

import com.elguennouni.mohassib.entity.AuthProvider;
import com.elguennouni.mohassib.entity.User;
import com.elguennouni.mohassib.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2UserProvisioningService {

    private final UserRepository userRepository;

    /**
     * Look up — or create — the local user matching this Google identity.
     *
     * Lookup order:
     *  1. provider + providerSubject (stable, survives email change on Google's side)
     *  2. email (links a pre-existing local account to this Google identity)
     *  3. create a new GOOGLE-provider user
     */
    @Transactional
    public User findOrCreate(String googleSubject, String email, String firstName, String lastName) {
        String normalizedEmail = email == null ? null : email.trim().toLowerCase();

        return userRepository.findByProviderAndProviderSubject(AuthProvider.GOOGLE, googleSubject)
                .or(() -> normalizedEmail == null ? java.util.Optional.empty()
                        : userRepository.findByEmail(normalizedEmail).map(existing -> linkGoogleIdentity(existing, googleSubject)))
                .orElseGet(() -> createGoogleUser(googleSubject, normalizedEmail, firstName, lastName));
    }

    private User linkGoogleIdentity(User user, String googleSubject) {
        if (user.getProviderSubject() == null) {
            user.setProvider(AuthProvider.GOOGLE);
            user.setProviderSubject(googleSubject);
            log.info("Liaison Google: utilisateur {} associe au sub {}", user.getId(), googleSubject);
        }
        return user;
    }

    private User createGoogleUser(String googleSubject, String email, String firstName, String lastName) {
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("Le compte Google ne fournit pas d'adresse email.");
        }
        User user = User.builder()
                .email(email)
                .firstName(orPlaceholder(firstName, "Utilisateur"))
                .lastName(orPlaceholder(lastName, "Mohassib"))
                .provider(AuthProvider.GOOGLE)
                .providerSubject(googleSubject)
                .passwordHash(null)
                .build();
        User saved = userRepository.save(user);
        log.info("Creation utilisateur Google: id={} email={}", saved.getId(), saved.getEmail());
        return saved;
    }

    private static String orPlaceholder(String value, String fallback) {
        if (value == null) return fallback;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? fallback : trimmed;
    }
}
