package org.example.elearning.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class PaginatedResponse<T> {
    private List<T> data;
    private Pagination pagination;

    public PaginatedResponse(List<T> data, Pagination pagination) {
        this.data = data;
        this.pagination = pagination;
    }

    @Getter
    @Setter
    @Builder
    public static class Pagination {
        private int pageNo;
        private int pageSize;
        private long totalElements;
        private int totalPages;

        public Pagination(int pageNo, int pageSize, long totalElements, int totalPages) {
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
        }
    }
}

