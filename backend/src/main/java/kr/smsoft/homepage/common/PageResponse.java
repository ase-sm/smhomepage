package kr.smsoft.homepage.common;

import java.util.List;
import java.util.function.Function;

import org.springframework.data.domain.Page;

/** 1부터 시작하는 페이지 번호로 응답한다. */
public record PageResponse<T>(List<T> items, int page, int size, long totalElements, int totalPages) {

    public static <E, T> PageResponse<T> of(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber() + 1,
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());
    }
}
