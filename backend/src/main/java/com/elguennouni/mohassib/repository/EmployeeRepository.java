package com.elguennouni.mohassib.repository;

import com.elguennouni.mohassib.entity.Employee;
import com.elguennouni.mohassib.entity.EmployeeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByIdAndCompanyId(Long id, Long companyId);

    Page<Employee> findByCompanyId(Long companyId, Pageable pageable);

    Page<Employee> findByCompanyIdAndStatus(Long companyId, EmployeeStatus status, Pageable pageable);

    List<Employee> findByCompanyIdAndStatusOrderByLastNameAscFirstNameAsc(Long companyId, EmployeeStatus status);

    @Query("""
            SELECT e FROM Employee e
            WHERE e.companyId = :companyId
              AND (
                LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(e.email, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(e.cinNumber, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(e.position, '')) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<Employee> searchByCompanyId(
            @Param("companyId") Long companyId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
            SELECT e FROM Employee e
            WHERE e.companyId = :companyId
              AND e.status = :status
              AND (
                LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(e.email, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(e.cinNumber, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(e.position, '')) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<Employee> searchByCompanyIdAndStatus(
            @Param("companyId") Long companyId,
            @Param("status") EmployeeStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    long countByCompanyIdAndStatus(Long companyId, EmployeeStatus status);
}
