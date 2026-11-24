package kr.smsoft.homepage.news;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "news")
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 60)
    private String title;

    @Column(length = 100)
    private String summary;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "source_name", length = 100)
    private String sourceName;

    @Column(name = "source_url", length = 1000)
    private String sourceUrl;

    @Column(nullable = false)
    private boolean published;

    @Column(name = "publish_date", nullable = false)
    private LocalDate publishDate;

    @Column(name = "created_by", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected News() {
    }

    public News(String createdBy, LocalDateTime now) {
        this.createdBy = createdBy;
        this.createdAt = now;
        this.updatedAt = now;
    }

    public void update(String title, String summary, String content, String thumbnailUrl,
                       String sourceName, String sourceUrl, boolean published, LocalDate publishDate) {
        this.title = title;
        this.summary = summary;
        this.content = content;
        this.thumbnailUrl = thumbnailUrl;
        this.sourceName = sourceName;
        this.sourceUrl = sourceUrl;
        this.published = published;
        this.publishDate = publishDate;
    }

    public void touch(LocalDateTime now) {
        this.updatedAt = now;
    }

    /** 공개 여부와 게시일의 조합으로 상태를 결정한다. */
    public NewsStatus statusOn(LocalDate today) {
        if (!published) {
            return NewsStatus.PRIVATE;
        }
        return publishDate.isAfter(today) ? NewsStatus.SCHEDULED : NewsStatus.PUBLIC;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public String getContent() {
        return content;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public String getSourceName() {
        return sourceName;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public boolean isPublished() {
        return published;
    }

    public LocalDate getPublishDate() {
        return publishDate;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
