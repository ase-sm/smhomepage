package kr.smsoft.homepage.inquiry;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import kr.smsoft.homepage.config.AppProperties;

/**
 * 문의 접수 메일 발송
 * 1) 접수 알림 메일 - 회사(help@smsoft.kr) 수신, 회신 시 문의자에게 전달
 * 2) 접수 확인 메일 - 문의자 수신, 회신 시 help@smsoft.kr 로 전달
 */
@Service
public class InquiryMailService {

    private static final DateTimeFormatter RECEIVED_AT = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");
    private static final String FONT = "'Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif";

    private final JavaMailSender mailSender;
    private final AppProperties.Mail props;

    public InquiryMailService(JavaMailSender mailSender, AppProperties appProperties) {
        this.mailSender = mailSender;
        this.props = appProperties.mail();
    }

    public void sendCompanyNotification(Inquiry q) {
        String subject = "[문의접수] %s / %s / %s".formatted(q.getCategory(), q.getCompany(), q.getName());
        String body = layout("""
                <h1 style="margin:0 0 50px;font-size:32px;line-height:1.3;font-weight:700;color:#000;">%s</h1>
                %s
                <div style="margin-top:50px;background:#f4f4f4;border:1px solid #c7c7c7;padding:20px 10px;
                            font-size:14px;color:#777;text-align:center;">
                  이 메일에 회신하면 문의자에게 바로 전달됩니다. 별도 시스템 입력은 필요하지 않습니다.
                </div>
                <hr style="margin:30px 0;border:0;border-top:1px solid #d8d8d8;">
                <p style="margin:0;font-size:14px;color:#aeaeae;">세명소프트 홈페이지 문의 폼에서 자동 발송된 메일입니다.</p>
                """.formatted(esc(subject), table(q)));
        send(props.helpAddress(), props.homepageSenderName(), q.getEmail(), subject, body);
    }

    public void sendCustomerConfirmation(Inquiry q) {
        String subject = "[세명소프트] 문의가 정상 접수되었습니다.";
        String body = layout("""
                <h1 style="margin:0 0 16px;font-size:32px;line-height:1.3;font-weight:700;color:#000;">문의가 정상 접수되었습니다.</h1>
                <p style="margin:0 0 50px;font-size:18px;line-height:1.5;color:#333;">
                  %s님, 문의해 주셔서 감사합니다.<br>
                  아래 내용으로 접수되었으며 담당자가 확인 후 순차적으로 회신드리겠습니다.
                </p>
                <p style="margin:0 0 16px;font-size:16px;color:#373737;">접수 내용</p>
                <hr style="margin:0 0 30px;border:0;border-top:1px solid #d8d8d8;">
                %s
                <div style="margin-top:50px;background:#f4f4f4;border:1px solid #c7c7c7;padding:20px 10px;
                            font-size:14px;color:#777;text-align:center;">
                  내용을 추가하시거나 수정이 필요하시면 이 메일에 그대로 회신해 주세요. 담당자에게 바로 전달됩니다.
                </div>
                <hr style="margin:50px 0;border:0;border-top:1px solid #d8d8d8;">
                <p style="margin:0;font-size:14px;line-height:1.5;color:#aeaeae;">
                  주식회사 세명소프트&nbsp;&nbsp;|&nbsp;&nbsp;대표이사 황바울<br>
                  서울 중구 청계천로 100 시그니처타워 서관 1033호 (본사)&nbsp;&nbsp;|&nbsp;&nbsp;%s<br>
                  본 메일은 문의 접수 확인을 위해 발송되었습니다.
                </p>
                """.formatted(esc(q.getName()), table(q), esc(props.helpAddress())));
        send(q.getEmail(), props.companySenderName(), props.helpAddress(), subject, body);
    }

    private void send(String to, String fromName, String replyTo, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
            helper.setTo(to);
            helper.setFrom(new InternetAddress(props.effectiveFromAddress(), fromName, StandardCharsets.UTF_8.name()));
            helper.setReplyTo(replyTo);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new IllegalStateException("메일 발송 실패: " + to, e);
        }
    }

    /** 접수번호 / 접수일시 / 구분 / 회사명 / 이름 / 이메일 / 연락처 / 문의 내용 (두 메일 동일 항목·순서) */
    private String table(Inquiry q) {
        Map<String, String> rows = new LinkedHashMap<>();
        rows.put("접수번호", esc(q.getReceiptNo()));
        rows.put("접수일시", esc(q.getCreatedAt().format(RECEIVED_AT)));
        rows.put("구분", esc(q.getCategory()));
        rows.put("회사명", esc(q.getCompany()));
        rows.put("이름", esc(q.getName()));
        rows.put("이메일", esc(q.getEmail()));
        rows.put("연락처", esc(q.getPhone()));
        // 문의 내용의 줄바꿈은 원문 유지
        rows.put("문의 내용", esc(q.getContent()).replace("\r\n", "\n").replace("\n", "<br>"));

        StringBuilder sb = new StringBuilder("<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" "
                + "style=\"width:100%;border-collapse:collapse;font-size:16px;\">");
        rows.forEach((label, value) -> sb.append("""
                <tr>
                  <td style="width:100px;padding:0 20px 30px 0;color:#777;vertical-align:top;white-space:nowrap;">%s</td>
                  <td style="padding:0 0 30px;color:#2d2d2d;line-height:1.5;vertical-align:top;word-break:break-all;">%s</td>
                </tr>
                """.formatted(label, value)));
        return sb.append("</table>").toString();
    }

    private static String layout(String inner) {
        return """
                <!DOCTYPE html>
                <html lang="ko"><head><meta charset="UTF-8"></head>
                <body style="margin:0;padding:0;background:#f5f5f5;">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
                    <tr><td align="center" style="padding:40px 16px;">
                      <table role="presentation" width="100%%" cellpadding="0" cellspacing="0"
                             style="max-width:894px;background:#fff;border:1px solid #e4e4e4;font-family:%s;">
                        <tr><td style="padding:60px 60px 70px;">
                          <div style="display:inline-block;width:240px;height:52px;line-height:52px;background:#d8d8d8;
                                      text-align:center;font-size:18px;color:#000;margin-bottom:60px;">세명소프트</div>
                          %s
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body></html>
                """.formatted(FONT, inner);
    }

    private static String esc(String s) {
        return s == null ? "" : HtmlUtils.htmlEscape(s, StandardCharsets.UTF_8.name());
    }
}
