package kr.smsoft.homepage.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TimeConfig {

    /** 게시일/예약 판단은 모두 한국 시간 기준으로 한다. */
    @Bean
    public Clock clock(AppProperties props) {
        return Clock.system(ZoneId.of(props.zone()));
    }
}
