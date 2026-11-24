package kr.smsoft.homepage.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String zone,
        String uploadDir,
        int imageMaxWidth,
        Admin admin,
        boolean seedSampleNews,
        Mail mail
) {
    public record Admin(String username, String password, String displayName) {
    }

    public record Mail(
            String helpAddress,
            String companySenderName,
            String homepageSenderName,
            String fromAddress
    ) {
        /** SMTP 발신 주소. 별도 지정이 없으면 담당자 메일을 사용한다. */
        public String effectiveFromAddress() {
            return (fromAddress == null || fromAddress.isBlank()) ? helpAddress : fromAddress;
        }
    }
}
