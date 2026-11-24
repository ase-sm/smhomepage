package kr.smsoft.homepage.inquiry;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record InquiryRequest(
        @NotBlank(message = "구분을 선택해 주세요.")
        @Pattern(regexp = "AX|R&D|Solution|기타", message = "구분을 선택해 주세요.")
        String category,

        @NotBlank(message = "회사명을 입력해 주세요.")
        @Size(max = 100, message = "회사명은 100자까지 입력할 수 있습니다.")
        String company,

        @NotBlank(message = "이름을 입력해 주세요.")
        @Size(max = 50, message = "이름은 50자까지 입력할 수 있습니다.")
        String name,

        @NotBlank(message = "이메일을 입력해 주세요.")
        @Size(max = 200, message = "이메일 형식이 올바르지 않습니다. 예) name@company.com")
        @Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
                message = "이메일 형식이 올바르지 않습니다. 예) name@company.com")
        String email,

        @NotBlank(message = "연락처를 입력해 주세요.")
        @Pattern(regexp = "^[0-9-]{8,20}$", message = "연락처 형식이 올바르지 않습니다. 숫자와 - 만 입력해 주세요.")
        String phone,

        @NotBlank(message = "문의 내용을 입력해 주세요.")
        @Size(min = 10, max = 5000, message = "문의 내용을 10자 이상 입력해 주세요.")
        String content,

        @AssertTrue(message = "개인정보 수집 및 이용에 동의해 주세요.")
        boolean agreed
) {
}
