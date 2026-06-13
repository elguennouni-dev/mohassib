package com.elguennouni.mohassib.repository;

import com.elguennouni.mohassib.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT c.id, c.userId FROM Company c")
    java.util.List<Object[]> findAllIdAndUserId();
}
