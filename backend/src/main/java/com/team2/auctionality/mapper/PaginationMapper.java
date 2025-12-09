package com.team2.auctionality.mapper;
import com.team2.auctionality.dto.PagedResponse;
import org.springframework.data.domain.Page;

public class PaginationMapper {

    public static <T> PagedResponse<T> from(Page<T> page) {
        return new PagedResponse<>(
                page.getContent(),
                new PagedResponse.Pagination(
                        page.getNumber() + 1,
                        page.getSize(),
                        page.getTotalElements(),
                        page.getTotalPages(),
                        page.hasNext(),
                        page.hasPrevious()
                )
        );
    }
}
