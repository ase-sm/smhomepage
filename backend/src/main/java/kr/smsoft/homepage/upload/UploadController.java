package kr.smsoft.homepage.upload;

import java.io.IOException;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/uploads")
public class UploadController {

    public record UploadResponse(String url) {
    }

    private final ImageStorageService storage;

    public UploadController(ImageStorageService storage) {
        this.storage = storage;
    }

    @PostMapping("/images")
    public UploadResponse uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        return new UploadResponse(storage.store(file));
    }
}
