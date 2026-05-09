package com.elguennouni.mohassib.repository;

import com.elguennouni.mohassib.entity.Client;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {

    Optional<Client> findByIdAndCompanyId(Long id, Long companyId);

    Page<Client> findByCompanyId(Long companyId, Pageable pageable);

    @Query("""
            SELECT c FROM Client c
            WHERE c.companyId = :companyId
              AND (
                LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(c.email, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(c.contactPerson, '')) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<Client> searchByCompanyId(
            @Param("companyId") Long companyId,
            @Param("search") String search,
            Pageable pageable
    );

    long countByCompanyId(Long companyId);
}
