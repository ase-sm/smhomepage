package kr.smsoft.homepage.news;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.smsoft.homepage.common.PageResponse;
import kr.smsoft.homepage.news.NewsDtos.NewsCard;
import kr.smsoft.homepage.news.NewsDtos.NewsDetail;

@RestController
@RequestMapping("/api/news")
public class PublicNewsController {

    private final NewsService service;

    public PublicNewsController(NewsService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<NewsCard> list(@RequestParam(defaultValue = "1") int page,
                                       @RequestParam(defaultValue = "10") int size,
                                       @RequestParam(required = false) Long excludeId) {
        return service.listVisible(page, size, excludeId);
    }

    /** 대표 뉴스: 최신 공개 1건 자동 노출 */
    @GetMapping("/featured")
    public ResponseEntity<NewsCard> featured() {
        NewsCard card = service.latestVisible();
        return card == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(card);
    }

    @GetMapping("/{id}")
    public NewsDetail detail(@PathVariable Long id) {
        return service.getVisible(id);
    }
}
