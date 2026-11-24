package kr.smsoft.homepage.inquiry;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InquiryService {

    private static final DateTimeFormatter RECEIPT_DATE = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final long RECEIPT_LOCK_KEY = 20260911L;

    private final InquiryRepository repository;
    private final InquiryMailService mailService;
    private final Clock clock;

    public InquiryService(InquiryRepository repository, InquiryMailService mailService, Clock clock) {
        this.repository = repository;
        this.mailService = mailService;
        this.clock = clock;
    }

    /**
     * 문의 저장 후 담당자 알림 메일과 접수 확인 메일을 발송한다.
     * 메일 발송이 실패하면 저장도 롤백되어 사용자에게 실패로 안내된다.
     */
    @Transactional
    public Inquiry submit(InquiryRequest req) {
        // 접수번호 순번 산정 구간 직렬화 (커밋 시 자동 해제)
        repository.acquireXactLock(RECEIPT_LOCK_KEY);
        LocalDateTime now = LocalDateTime.now(clock);
        Inquiry inquiry = repository.save(new Inquiry(
                nextReceiptNo(now.toLocalDate()),
                req.category(),
                req.company().trim(),
                req.name().trim(),
                req.email().trim(),
                req.phone().trim(),
                req.content().strip(),
                now));
        repository.flush();
        mailService.sendCompanyNotification(inquiry);
        mailService.sendCustomerConfirmation(inquiry);
        return inquiry;
    }

    /** 접수번호 규칙: INQ-YYYYMMDD-순번(2자리) */
    private String nextReceiptNo(LocalDate date) {
        long todayCount = repository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                date.atStartOfDay(), date.plusDays(1).atStartOfDay());
        return "INQ-%s-%02d".formatted(date.format(RECEIPT_DATE), todayCount + 1);
    }
}
