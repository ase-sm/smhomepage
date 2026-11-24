package kr.smsoft.homepage.news;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NewsRepository extends JpaRepository<News, Long>, JpaSpecificationExecutor<News> {

    /** 홈페이지 노출 대상(공개 상태) 목록. excludeId 건은 제외 (제외 대상이 없으면 -1). */
    @Query(value = """
            select n from News n
            where n.published = true and n.publishDate <= :today
              and n.id <> :excludeId
            order by n.publishDate desc, n.id desc
            """,
            countQuery = """
            select count(n) from News n
            where n.published = true and n.publishDate <= :today
              and n.id <> :excludeId
            """)
    Page<News> findVisible(@Param("today") LocalDate today, @Param("excludeId") Long excludeId, Pageable pageable);

    @Query("""
            select n from News n
            where n.published = true and n.publishDate <= :today
            order by n.publishDate desc, n.id desc
            limit 1
            """)
    Optional<News> findLatestVisible(@Param("today") LocalDate today);

    /** 현재 글보다 이전에 게시된(더 오래된) 글 */
    @Query("""
            select n from News n
            where n.published = true and n.publishDate <= :today
              and (n.publishDate < :date or (n.publishDate = :date and n.id < :id))
            order by n.publishDate desc, n.id desc
            limit 1
            """)
    List<News> findOlder(@Param("today") LocalDate today, @Param("date") LocalDate date, @Param("id") Long id);

    /** 현재 글보다 나중에 게시된(더 최신) 글 */
    @Query("""
            select n from News n
            where n.published = true and n.publishDate <= :today
              and (n.publishDate > :date or (n.publishDate = :date and n.id > :id))
            order by n.publishDate asc, n.id asc
            limit 1
            """)
    List<News> findNewer(@Param("today") LocalDate today, @Param("date") LocalDate date, @Param("id") Long id);
}
