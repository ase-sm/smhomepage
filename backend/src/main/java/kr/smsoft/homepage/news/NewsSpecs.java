package kr.smsoft.homepage.news;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

final class NewsSpecs {

    private NewsSpecs() {
    }

    static Specification<News> status(NewsStatus status, LocalDate today) {
        return (root, query, cb) -> {
            if (status == null) {
                return null;
            }
            return switch (status) {
                case PRIVATE -> cb.isFalse(root.get("published"));
                case PUBLIC -> cb.and(cb.isTrue(root.get("published")),
                        cb.lessThanOrEqualTo(root.get("publishDate"), today));
                case SCHEDULED -> cb.and(cb.isTrue(root.get("published")),
                        cb.greaterThan(root.get("publishDate"), today));
            };
        };
    }

    static Specification<News> titleContains(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return null;
            }
            String escaped = keyword.trim().toLowerCase()
                    .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
            return cb.like(cb.lower(root.get("title")), "%" + escaped + "%", '\\');
        };
    }
}
