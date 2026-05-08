package com.elguennouni.mohassib.repository;

import com.elguennouni.mohassib.entity.TVAEntry;
import com.elguennouni.mohassib.entity.TVAEntrySourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TVAEntryRepository extends JpaRepository<TVAEntry, Long> {

    @Query("""
            SELECT t FROM TVAEntry t
            WHERE t.companyId = :companyId
              AND t.entryDate >= :from
              AND t.entryDate <= :to
            ORDER BY t.entryDate DESC, t.id DESC
            """)
    List<TVAEntry> findByCompanyIdAndDateRange(
            @Param("companyId") Long companyId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    void deleteBySourceTypeAndSourceId(TVAEntrySourceType sourceType, Long sourceId);

    List<TVAEntry> findBySourceTypeAndSourceId(TVAEntrySourceType sourceType, Long sourceId);
}
