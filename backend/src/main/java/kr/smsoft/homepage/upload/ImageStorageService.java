package kr.smsoft.homepage.upload;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import kr.smsoft.homepage.common.ApiException;
import kr.smsoft.homepage.config.AppProperties;

@Service
public class ImageStorageService {

    static final String FORMAT_ERROR = "jpg · jpeg · png · gif 형식만 삽입할 수 있습니다.";
    static final String SIZE_ERROR = "이미지 용량은 10MB를 넘을 수 없습니다.";
    private static final long MAX_BYTES = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED = Set.of("jpg", "jpeg", "png", "gif");

    private final Path root;
    private final int maxWidth;
    private final Clock clock;

    public ImageStorageService(AppProperties props, Clock clock) throws IOException {
        this.root = Path.of(props.uploadDir()).toAbsolutePath().normalize();
        this.maxWidth = props.imageMaxWidth();
        this.clock = clock;
        Files.createDirectories(root);
    }

    /** @return 브라우저에서 접근 가능한 경로 (/uploads/...) */
    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("이미지 파일을 선택해 주세요.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw ApiException.badRequest(SIZE_ERROR);
        }
        String ext = extension(file.getOriginalFilename());
        if (!ALLOWED.contains(ext)) {
            throw ApiException.badRequest(FORMAT_ERROR);
        }
        byte[] bytes = file.getBytes();
        BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));
        if (image == null) {
            throw ApiException.badRequest(FORMAT_ERROR);
        }

        LocalDate today = LocalDate.now(clock);
        String relDir = "news/%d/%02d".formatted(today.getYear(), today.getMonthValue());
        Path dir = root.resolve(relDir);
        Files.createDirectories(dir);
        String filename = UUID.randomUUID() + "." + ("jpeg".equals(ext) ? "jpg" : ext);
        Path target = dir.resolve(filename);

        // GIF 는 애니메이션 보존을 위해 원본 저장, 그 외에는 가로 기준폭 초과 시 리사이즈
        if (!"gif".equals(ext) && image.getWidth() > maxWidth) {
            BufferedImage resized = resize(image, maxWidth, "png".equals(ext));
            ImageIO.write(resized, "png".equals(ext) ? "png" : "jpg", target.toFile());
        } else {
            Files.write(target, bytes);
        }
        return "/uploads/" + relDir + "/" + filename;
    }

    private static BufferedImage resize(BufferedImage src, int width, boolean keepAlpha) {
        int height = (int) Math.round((double) src.getHeight() * width / src.getWidth());
        BufferedImage dst = new BufferedImage(width, height,
                keepAlpha ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
        Graphics2D g = dst.createGraphics();
        try {
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g.drawImage(src, 0, 0, width, height, null);
        } finally {
            g.dispose();
        }
        return dst;
    }

    private static String extension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
