package kr.smsoft.homepage.admin;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import kr.smsoft.homepage.config.AppProperties;
import kr.smsoft.homepage.news.News;
import kr.smsoft.homepage.news.NewsRepository;

/** 최초 기동 시 관리자 계정과 (옵션) 샘플 뉴스를 생성한다. */
@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final AdminUserRepository adminUserRepository;
    private final NewsRepository newsRepository;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties props;
    private final Clock clock;

    public DataInitializer(AdminUserRepository adminUserRepository, NewsRepository newsRepository,
                           PasswordEncoder passwordEncoder, AppProperties props, Clock clock) {
        this.adminUserRepository = adminUserRepository;
        this.newsRepository = newsRepository;
        this.passwordEncoder = passwordEncoder;
        this.props = props;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        AppProperties.Admin admin = props.admin();
        if (!adminUserRepository.existsByUsername(admin.username())) {
            adminUserRepository.save(new AdminUser(admin.username(), passwordEncoder.encode(admin.password()),
                    admin.displayName(), LocalDateTime.now(clock)));
            log.info("관리자 계정 생성: {}", admin.username());
        }
        if (props.seedSampleNews() && newsRepository.count() == 0) {
            seedNews(admin.displayName());
            log.info("샘플 뉴스 생성 완료");
        }
    }

    private record Sample(String title, String summary, String body, String sourceName, String sourceUrl,
                          boolean published, LocalDate date) {
    }

    private void seedNews(String createdBy) {
        LocalDate today = LocalDate.now(clock);
        String awardBody = """
                <p>세명소프트가 2026 대한민국 AI 대상 산업 부문에서 대상을 수상했습니다. 제조와 농업 현장에 적용한 AI 솔루션의 성과를 인정받은 결과입니다.</p>
                <p>수상 과제로 제출한 지능형 제조 AI는 공정과 설비에서 발생하는 생산·품질 데이터를 통합하고, 디지털트윈과 연계해 이상징후를 조기에 파악하는 구조로 구성되어 있습니다. 실증에 참여한 사업장에서 설비 비가동 시간과 불량률이 함께 줄어든 점이 높은 평가를 받았습니다.</p>
                <p>세명소프트는 앞으로도 연구에서 끝나지 않고 현장에서 검증되는 AI 기술을 만들어 가겠습니다.</p>
                """;
        List<Sample> samples = List.of(
                new Sample("반도체 제조안전 AI 시스템 실증 사업 참여", "반도체 공정의 안전 위험 요소를 실시간으로 감지하는 AI 시스템 실증에 참여합니다.",
                        "<p>반도체 제조 현장의 안전 위험 요소를 영상 기반으로 감지하는 AI 시스템 실증 사업에 참여합니다.</p>", null, null, true, LocalDate.of(2026, 5, 27)),
                new Sample("Ternis MLOps GS인증 1등급 획득", "Ternis MLOps가 소프트웨어 품질인증(GS) 1등급을 획득했습니다.",
                        "<p>세명소프트의 MLOps 플랫폼 Ternis MLOps가 GS인증 1등급을 획득했습니다.</p>", null, null, true, LocalDate.of(2026, 6, 18)),
                new Sample("한국환경산업기술원과 업무협약 체결", "화학제품 안전관리 분야의 AI 기술 공동 연구를 위한 협약을 맺었습니다.",
                        "<p>화학제품 안전관리 분야의 AI 기술 공동 연구를 위해 한국환경산업기술원과 업무협약을 체결했습니다.</p>", null, null, true, LocalDate.of(2026, 7, 2)),
                new Sample("밭농업 전주기 개방형 로봇 플랫폼 과제 선정", "농림축산식품부 국책과제 주관기관으로 선정되어 2030년까지 연구를 수행합니다.",
                        "<p>농림축산식품부 국책과제 주관기관으로 선정되어 2030년까지 밭농업 전주기 개방형 로봇 플랫폼 연구를 수행합니다.</p>", null, null, true, LocalDate.of(2026, 7, 30)),
                new Sample("Ternis Agent 정식 출시", "사내 도구와 지식을 연결하고 승인을 거쳐 실행하는 업무 에이전트 플랫폼을 공개했습니다.",
                        "<p>사내 도구와 지식을 연결하고 승인을 거쳐 실행하는 업무 에이전트 플랫폼 Ternis Agent를 정식 출시했습니다.</p>", null, null, true, LocalDate.of(2026, 8, 21)),
                new Sample("2026년 하반기 채용 공고", "세명소프트와 함께할 인재를 모집합니다.",
                        "<p>세명소프트와 함께할 인재를 모집합니다.</p>", null, null, false, LocalDate.of(2026, 9, 1)),
                new Sample("식품오인 생활화학제품 판별 AI 솔루션 실증 착수", "기후에너지환경부 과제로 이미지·영상 기반 오인 판별 모델의 현장 실증을 시작합니다.",
                        "<p>기후에너지환경부 과제로 이미지·영상 기반 식품오인 생활화학제품 판별 모델의 현장 실증을 시작합니다.</p>", null, null, true, LocalDate.of(2026, 9, 15)),
                new Sample("세명소프트, 2026 대한민국 AI 대상 수상", "제조·농업 현장에 적용한 AI 솔루션의 성과를 인정받아 산업 부문 대상을 수상했습니다.",
                        awardBody, "전자신문", "https://www.etnews.com/20260928000123", true, LocalDate.of(2026, 9, 28)),
                new Sample("2026 하반기 신규 솔루션 출시 안내", "하반기 출시 예정인 신규 솔루션을 소개합니다.",
                        "<p>하반기 출시 예정인 신규 솔루션을 소개합니다.</p>", null, null, true, today.plusDays(10)));

        LocalDateTime now = LocalDateTime.now(clock);
        for (Sample s : samples) {
            News n = new News(createdBy, now);
            n.update(s.title(), s.summary(), s.body().strip(), null, s.sourceName(), s.sourceUrl(), s.published(), s.date());
            newsRepository.save(n);
        }
    }
}
