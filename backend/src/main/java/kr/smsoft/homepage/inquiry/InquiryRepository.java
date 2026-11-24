package kr.smsoft.homepage.inquiry;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(LocalDateTime from, LocalDateTime to);

    /** 트랜잭션 종료 시까지 유지되는 잠금 (접수번호 순번 중복 방지) */
    @Query(value = "select 1 from (select pg_advisory_xact_lock(:key)) l", nativeQuery = true)
    Integer acquireXactLock(@Param("key") long key);
}
