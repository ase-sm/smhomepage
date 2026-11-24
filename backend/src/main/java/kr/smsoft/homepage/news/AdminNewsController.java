package kr.smsoft.homepage.news;

import java.security.Principal;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.smsoft.homepage.common.PageResponse;
import kr.smsoft.homepage.news.NewsDtos.AdminNewsDetail;
import kr.smsoft.homepage.news.NewsDtos.AdminNewsRow;
import kr.smsoft.homepage.news.NewsDtos.NewsRequest;

@RestController
@RequestMapping("/api/admin/news")
public class AdminNewsController {

    private final NewsService service;

    public AdminNewsController(NewsService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<AdminNewsRow> list(@RequestParam(required = false) NewsStatus status,
                                           @RequestParam(required = false) String keyword,
                                           @RequestParam(defaultValue = "1") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        return service.adminList(status, keyword, page, size);
    }

    @GetMapping("/{id}")
    public AdminNewsDetail get(@PathVariable Long id) {
        return service.adminGet(id);
    }

    @PostMapping
    public ResponseEntity<AdminNewsDetail> create(@Valid @RequestBody NewsRequest req, Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, principal.getName()));
    }

    @PutMapping("/{id}")
    public AdminNewsDetail update(@PathVariable Long id, @Valid @RequestBody NewsRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
