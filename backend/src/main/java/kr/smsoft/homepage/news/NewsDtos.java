package kr.smsoft.homepage.news;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class NewsDtos {

    private NewsDtos() {
    }

    /* ---------- 홈페이지 ---------- */

    public record NewsCard(Long id, String title, String summary, String thumbnailUrl, LocalDate publishDate) {
        static NewsCard of(News n) {
            return new NewsCard(n.getId(), n.getTitle(), n.getSummary(), n.getThumbnailUrl(), n.getPublishDate());
        }
    }

    public record NewsLink(Long id, String title) {
        static NewsLink of(News n) {
            return n == null ? null : new NewsLink(n.getId(), n.getTitle());
        }
    }

    public record NewsDetail(
            Long id, String title, String summary, String content,
            String sourceName, String sourceUrl, LocalDate publishDate,
            NewsLink prev, NewsLink next) {
    }

    /* ---------- 관리자 ---------- */

    public record AdminNewsRow(Long id, String title, NewsStatus status, LocalDate publishDate, LocalDateTime updatedAt) {
    }

    public record AdminNewsDetail(
            Long id, String title, String summary, String content,
            String sourceName, String sourceUrl,
            boolean published, LocalDate publishDate, NewsStatus status,
            String createdBy, LocalDateTime createdAt, LocalDateTime updatedAt) {
    }

    public record NewsRequest(
            @NotBlank(message = "제목을 입력해 주세요.")
            @Size(max = 60, message = "제목은 60자까지 입력할 수 있습니다.")
            String title,

            @Size(max = 100, message = "요약은 100자까지 입력할 수 있습니다.")
            String summary,

            @NotBlank(message = "본문을 입력해 주세요.")
            String content,

            @Size(max = 100, message = "출처명은 100자까지 입력할 수 있습니다.")
            String sourceName,

            @Size(max = 1000, message = "원문 링크가 너무 깁니다.")
            @Pattern(regexp = "^$|^https?://\\S+$", message = "링크는 http:// 또는 https:// 로 시작해야 합니다.")
            String sourceUrl,

            @NotNull(message = "공개 여부를 선택해 주세요.")
            Boolean published,

            @NotNull(message = "게시일을 선택해 주세요.")
            LocalDate publishDate) {
    }
}
