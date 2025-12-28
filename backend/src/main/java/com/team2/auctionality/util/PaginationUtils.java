package com.team2.auctionality.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

/**
 * Utility class for pagination operations
 */
public class PaginationUtils {

    private static final int DEFAULT_PAGE = 1;
    private static final int DEFAULT_SIZE = 10;
    private static final int MAX_SIZE = 100;
    private static final int MIN_SIZE = 1;

    /**
     * Create a Pageable object with validated page and size parameters
     * 
     * @param page Page number (1-indexed, will be converted to 0-indexed)
     * @param size Page size
     * @return Pageable object
     */
    public static Pageable createPageable(int page, int size) {
        int validatedPage = Math.max(DEFAULT_PAGE, page) - 1; // Convert to 0-indexed
        int validatedSize = Math.max(MIN_SIZE, Math.min(MAX_SIZE, size));
        return PageRequest.of(validatedPage, validatedSize);
    }

    /**
     * Create a Pageable object with default values
     * 
     * @return Pageable object with page=0, size=10
     */
    public static Pageable createDefaultPageable() {
        return PageRequest.of(0, DEFAULT_SIZE);
    }

    /**
     * Validate and normalize page number
     * 
     * @param page Page number (1-indexed)
     * @return Validated page number (1-indexed)
     */
    public static int validatePage(int page) {
        return Math.max(DEFAULT_PAGE, page);
    }

    /**
     * Validate and normalize page size
     * 
     * @param size Page size
     * @return Validated page size (between MIN_SIZE and MAX_SIZE)
     */
    public static int validateSize(int size) {
        return Math.max(MIN_SIZE, Math.min(MAX_SIZE, size));
    }
}

