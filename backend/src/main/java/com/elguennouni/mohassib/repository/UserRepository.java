package com.elguennouni.mohassib.repository;

import com.elguennouni.mohassib.entity.AuthProvider;
import com.elguennouni.mohassib.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByProviderAndProviderSubject(AuthProvider provider, String providerSubject);

    boolean existsByEmail(String email);
}
