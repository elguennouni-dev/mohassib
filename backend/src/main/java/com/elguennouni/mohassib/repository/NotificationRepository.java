package com.elguennouni.mohassib.repository;

import com.elguennouni.mohassib.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByCompanyIdOrderByCreatedAtDesc(Long companyId, Pageable pageable);

    List<Notification> findTop10ByCompanyIdOrderByCreatedAtDesc(Long companyId);

    long countByCompanyIdAndReadFalse(Long companyId);

    Optional<Notification> findByIdAndCompanyId(Long id, Long companyId);

    boolean existsByCompanyIdAndDedupeKeyAndCreatedAtAfter(
            Long companyId, String dedupeKey, LocalDateTime since);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :now " +
            "WHERE n.companyId = :companyId AND n.read = false")
    int markAllAsRead(@Param("companyId") Long companyId, @Param("now") LocalDateTime now);
}
