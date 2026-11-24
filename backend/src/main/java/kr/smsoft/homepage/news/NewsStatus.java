package kr.smsoft.homepage.news;

public enum NewsStatus {
    /** 공개로 저장 + 게시일이 오늘이거나 이전 */
    PUBLIC,
    /** 공개로 저장 + 게시일이 오늘 이후 (게시일 00시 자동 공개) */
    SCHEDULED,
    /** 비공개로 저장 (게시일과 무관) */
    PRIVATE
}
