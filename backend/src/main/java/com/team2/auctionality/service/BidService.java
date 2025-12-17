package com.team2.auctionality.service;

import com.team2.auctionality.dto.BidHistoryDto;
import com.team2.auctionality.mapper.BidMapper;
import com.team2.auctionality.repository.BidRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final ProductService productService;

    public List<BidHistoryDto> getBidHistory(Integer productId) {

        productService.getProductById(productId);

        return bidRepository.findByProductId(productId)
                .stream()
                .map(BidMapper::toDto)
                .toList();
    }
}
