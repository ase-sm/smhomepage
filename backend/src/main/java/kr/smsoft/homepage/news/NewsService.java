package kr.smsoft.homepage.news;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.smsoft.homepage.admin.AdminUser;
import kr.smsoft.homepage.admin.AdminUserRepository;
import kr.smsoft.homepage.common.ApiException;
import kr.smsoft.homepage.common.PageResponse;
import kr.smsoft.homepage.news.NewsDtos.AdminNewsDetail;
import kr.smsoft.homepage.news.NewsDtos.AdminNewsRow;
import kr.smsoft.homepage.news.NewsDtos.NewsCard;
import kr.smsoft.homepage.news.NewsDtos.NewsDetail;
import kr.smsoft.homepage.news.NewsDtos.NewsLink;
import kr.smsoft.homepage.news.NewsDtos.NewsRequest;

@Service
@Transactional(readOnly = true)
public class NewsService {

    private static final String NOT_FOUND = "해당 뉴스를 찾을 수 없습니다.";

    private final NewsRepository repository;
    private final AdminUserRepository adminUserRepository;
    private final HtmlSanitizer sanitizer;
    private final Clock clock;

    public NewsService(NewsRepository repository, AdminUserRepository adminUserRepository,
                       HtmlSanitizer sanitizer, Clock clock) {
        this.repository = repository;
        this.adminUserRepository = adminUserRepository;
        this.sanitizer = sanitizer;
        this.clock = clock;
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }

    /* ---------- 홈페이지 ---------- */

    public PageResponse<NewsCard> listVisible(int page, int size, Long excludeId) {
        var pageable = PageRequest.of(Math.max(page, 1) - 1, clamp(size, 1, 50));
        long exclude = excludeId == null ? -1L : excludeId;
        return PageResponse.of(repository.findVisible(today(), exclude, pageable), NewsCard::of);
    }

    public NewsCard latestVisible() {
        return repository.findLatestVisible(today()).map(NewsCard::of).orElse(null);
    }

    /** 공개 상태가 아닌(예약/비공개) 뉴스는 존재하지 않는 것처럼 404 처리 */
    public NewsDetail getVisible(Long id) {
        LocalDate today = today();
        News n = repository.findById(id)
                .filter(x -> x.statusOn(today) == NewsStatus.PUBLIC)
                .orElseThrow(() -> ApiException.notFound(NOT_FOUND));
        News older = first(repository.findOlder(today, n.getPublishDate(), n.getId()));
        News newer = first(repository.findNewer(today, n.getPublishDate(), n.getId()));
        return new NewsDetail(n.getId(), n.getTitle(), n.getSummary(), n.getContent(),
                n.getSourceName(), n.getSourceUrl(), n.getPublishDate(),
                NewsLink.of(older), NewsLink.of(newer));
    }

    /* ---------- 관리자 ---------- */

    public PageResponse<AdminNewsRow> adminList(NewsStatus status, String keyword, int page, int size) {
        LocalDate today = today();
        int pageSize = List.of(10, 30, 50).contains(size) ? size : 10;
        var pageable = PageRequest.of(Math.max(page, 1) - 1, pageSize,
                Sort.by(Sort.Order.desc("publishDate"), Sort.Order.desc("id")));
        Specification<News> spec = Specification.allOf(
                NewsSpecs.status(status, today), NewsSpecs.titleContains(keyword));
        return PageResponse.of(repository.findAll(spec, pageable),
                n -> new AdminNewsRow(n.getId(), n.getTitle(), n.statusOn(today), n.getPublishDate(), n.getUpdatedAt()));
    }

    public AdminNewsDetail adminGet(Long id) {
        return toAdminDetail(find(id));
    }

    @Transactional
    public AdminNewsDetail create(NewsRequest req, String username) {
        News news = new News(displayName(username), LocalDateTime.now(clock));
        apply(news, req);
        return toAdminDetail(repository.save(news));
    }

    @Transactional
    public AdminNewsDetail update(Long id, NewsRequest req) {
        News news = find(id);
        apply(news, req);
        news.touch(LocalDateTime.now(clock));
        return toAdminDetail(news);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(find(id));
    }

    private void apply(News news, NewsRequest req) {
        String content = sanitizer.sanitize(req.content());
        if (sanitizer.isBlank(content)) {
            throw ApiException.field("content", "본문을 입력해 주세요.");
        }
        String sourceName = trimToNull(req.sourceName());
        String sourceUrl = trimToNull(req.sourceUrl());
        if (sourceUrl != null && sourceName == null) {
            throw ApiException.field("sourceName", "원문 링크를 입력한 경우 출처명을 입력해 주세요.");
        }
        news.update(req.title().trim(), trimToNull(req.summary()), content, sanitizer.firstImageSrc(content),
                sourceName, sourceUrl, req.published(), req.publishDate());
    }

    private AdminNewsDetail toAdminDetail(News n) {
        return new AdminNewsDetail(n.getId(), n.getTitle(), n.getSummary(), n.getContent(),
                n.getSourceName(), n.getSourceUrl(), n.isPublished(), n.getPublishDate(), n.statusOn(today()),
                n.getCreatedBy(), n.getCreatedAt(), n.getUpdatedAt());
    }

    private News find(Long id) {
        return repository.findById(id).orElseThrow(() -> ApiException.notFound(NOT_FOUND));
    }

    private String displayName(String username) {
        return adminUserRepository.findByUsername(username).map(AdminUser::getDisplayName).orElse(username);
    }

    private static News first(List<News> list) {
        return list.isEmpty() ? null : list.getFirst();
    }

    private static String trimToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private static int clamp(int v, int min, int max) {
        return Math.max(min, Math.min(max, v));
    }
}
