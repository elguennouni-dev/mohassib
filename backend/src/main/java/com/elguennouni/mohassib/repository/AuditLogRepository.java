package com.elguennouni.mohassib.repository;

import com.elguennouni.mohassib.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
}
