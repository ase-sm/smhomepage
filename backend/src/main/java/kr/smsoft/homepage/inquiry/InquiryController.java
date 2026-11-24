package kr.smsoft.homepage.inquiry;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    public record InquiryResponse(String receiptNo) {
    }

    private final InquiryService service;

    public InquiryController(InquiryService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<InquiryResponse> submit(@Valid @RequestBody InquiryRequest req) {
        Inquiry saved = service.submit(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(new InquiryResponse(saved.getReceiptNo()));
    }
}
