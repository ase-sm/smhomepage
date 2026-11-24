package kr.smsoft.homepage.news;

import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

/**
 * 에디터 본문 HTML 을 허용 태그만 남기도록 정리한다 (XSS 방지).
 * 정렬(text-align) 스타일만 유지한다.
 */
@Component
public class HtmlSanitizer {

    private static final Pattern TEXT_ALIGN = Pattern.compile("text-align\\s*:\\s*(left|center|right|justify)",
            Pattern.CASE_INSENSITIVE);
    private static final Set<String> ALIGNABLE = Set.of("p", "h1", "h2", "h3", "h4");

    private final Safelist safelist = Safelist.relaxed()
            .addTags("s", "hr")
            .addAttributes("a", "target", "rel")
            .addAttributes("img", "alt")
            .addAttributes("p", "style")
            .addAttributes("h1", "style")
            .addAttributes("h2", "style")
            .addAttributes("h3", "style")
            .addAttributes("h4", "style")
            .addProtocols("img", "src", "http", "https")
            .preserveRelativeLinks(true);

    public String sanitize(String html) {
        if (html == null) {
            return "";
        }
        String cleaned = Jsoup.clean(html, "http://localhost/", safelist);
        Document doc = Jsoup.parseBodyFragment(cleaned);
        for (Element el : doc.body().select("[style]")) {
            Matcher m = TEXT_ALIGN.matcher(el.attr("style"));
            if (ALIGNABLE.contains(el.tagName()) && m.find()) {
                el.attr("style", "text-align: " + m.group(1).toLowerCase());
            } else {
                el.removeAttr("style");
            }
        }
        for (Element a : doc.body().select("a[href]")) {
            a.attr("target", "_blank");
            a.attr("rel", "noopener noreferrer");
        }
        doc.outputSettings().prettyPrint(false);
        return doc.body().html();
    }

    /** 본문 최상단 이미지를 대표 이미지로 사용 */
    public String firstImageSrc(String html) {
        Element img = Jsoup.parseBodyFragment(html).selectFirst("img[src]");
        return img == null ? null : img.attr("src");
    }

    /** 텍스트도 이미지도 없는 빈 본문인지 */
    public boolean isBlank(String html) {
        Document doc = Jsoup.parseBodyFragment(html);
        return doc.body().text().isBlank() && doc.body().select("img").isEmpty();
    }
}
