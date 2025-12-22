package com.team2.auctionality.service;

import com.team2.auctionality.dto.*;
import com.team2.auctionality.enums.ApproveStatus;
import com.team2.auctionality.enums.ProductStatus;
import com.team2.auctionality.exception.InvalidBidPriceException;
import com.team2.auctionality.mapper.ProductMapper;
import com.team2.auctionality.mapper.ProductQuestionMapper;
import com.team2.auctionality.model.*;
import com.team2.auctionality.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductQuestionRepository productQuestionRepository;
    private final ProductExtraDescriptionRepository productExtraDescriptionRepository;
    private final BidderApprovalRepository bidderApprovalRepository;
    private final RejectedBidderRepository rejectedBidderRepository;
    private final ProductAnswerRepository productAnswerRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final CategoryService categoryService;

    public List<ProductDto> getTop5EndingSoon() {
        return productRepository.findTop5EndingSoon(PageRequest.of(0, 5))
                .stream()
                .map(ProductMapper::toDto)
                .toList();

    }

    public List<ProductTopMostBidDto> getTop5MostBid() {
        return productRepository.findTop5MostBid(PageRequest.of(0, 5));
    }

    public List<ProductDto> getTop5HighestPrice() {
        return productRepository.findTop5HighestPrice(PageRequest.of(0, 5))
                .stream()
                .map(ProductMapper::toDto)
                .toList();
    }

    public Page<ProductDto> getProductsByCategory(Integer categoryId, int page, int size) {
        return productRepository.findByCategory(categoryId, PageRequest.of(page, size))
                .map(ProductMapper::toDto);
    }

    public Page<ProductDto> searchProducts(
            String keyword,
            Integer categoryId,
            int page,
            int size,
            String sort
    ) {
        Pageable pageable = PageRequest.of(page, size, getSort(sort));

        Page<Product> products = productRepository.searchProducts(keyword, categoryId, pageable);

        return products.map(ProductMapper::toDto);
    }

    private Sort getSort(String sortKey) {
        return switch (sortKey) {
            case "priceAsc" -> Sort.by("currentPrice").ascending();
            case "priceDesc" -> Sort.by("currentPrice").descending();
            case "endTimeAsc" -> Sort.by("endTime").ascending();
            case "endTimeDesc" -> Sort.by("endTime").descending();
            default -> Sort.by("endTime").descending();
        };
    }

    public Page<ProductDto> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository
                .findAll(pageable)
                .map(ProductMapper::toDto);
    }

    public ProductDto createProduct(User seller, CreateProductDto productDto) {
        Product product = Product.builder()
                .title(productDto.getTitle())
                .status(ProductStatus.active)
                .startPrice(productDto.getStartPrice())
                .currentPrice(0f)
                .buyNowPrice(productDto.getBuyNowPrice())
                .bidIncrement(productDto.getBidIncrement())
                .startTime(productDto.getStartTime())
                .endTime(productDto.getEndTime())
                .autoExtensionEnabled(productDto.getAutoExtensionEnabled())
                .seller(seller)
                .category(categoryService.getCategoryById(productDto.getCategoryId()))
                .build();

        Product addedProduct = productRepository.save(product);
        return ProductMapper.toDto(addedProduct);

    }

    public void deleteProductById(Integer id) {
        productRepository.deleteById(id);
    }

    public Product getProductById(Integer id) {
        return productRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Product not found"));
    }

//    public ProductDto editProductById(Integer id, CreateProductDto productDto) {
//        Product product = getProductById(id);
//
//        product.setTitle(productDto.getTitle());
//        product.setStatus(productDto.getStatus());
//        product.setStartPrice(productDto.getStartPrice());
//        product.setCurrentPrice(productDto.getCurrentPrice());
//        product.setBuyNowPrice(productDto.getBuyNowPrice());
//        product.setBidIncrement(productDto.getBidIncrement());
//        product.setStartTime(productDto.getStartTime());
//        product.setEndTime(productDto.getEndTime());
//        product.setAutoExtensionEnabled(productDto.getAutoExtensionEnabled());
//        product.setSeller(productRepository.getReferenceById(productDto.getSellerId()).getSeller());
//        product.setCategory(productRepository.getReferenceById(productDto.getCategoryId()).getCategory());
//        Product editedProduct = productRepository.save(product);
//        return ProductMapper.toDto(editedProduct);
//
//    }

    public static void checkIsAmountAvailable(Float amount, Float step, Float currentPrice) {
        if (amount <= currentPrice) throw new InvalidBidPriceException("Bid ammount more than " + currentPrice + ".");
        if ((amount - currentPrice) % step != 0) {
            throw new InvalidBidPriceException(
                    "Bid price must increase by step of " + step
            );
        }
    }

    public void save(Product product) {
        productRepository.save(product);
    }

    public ProductQuestion addQuestion(User user, Integer productId, AddQuestionDto questionDto) {
        Product product = getProductById(productId);
        ProductQuestion question = ProductQuestionMapper.toEntity(user, product, questionDto);

        return productQuestionRepository.save(question);
    }

    public List<ProductQuestionDto> getQuestionById(Integer productId) {
        List<ProductQuestion> questions =
                productQuestionRepository.findByProductId(productId);

        if (questions.isEmpty()) {
            throw new EntityNotFoundException("Questions not found");
        }

        return questions.stream()
                .map(ProductQuestionMapper::toDto)
                .toList();
    }

    public List<Product> getAuctionProductsByUser(Integer userId) {
        return productRepository.findProductsUserHasBidOn(userId);
    }

    public List<Product> getWonProducts(User user) {
        return productRepository.findWonProductsByUserId(user.getId());
    }

    public ProductExtraDescription addExtraDescription(Integer productId, CreateExtraDescriptionDto dto) {
        Product product = getProductById(productId);

        ProductExtraDescription description = ProductExtraDescription.builder()
                .productId(productId)
                .content(dto.getContent())
                .createdAt(new Date())
                .build();
        return productExtraDescriptionRepository.save(description);
    }

    public List<ProductExtraDescription> getDescriptionByProductId(Integer productId) {
        return productExtraDescriptionRepository.getProductExtraDescriptionByProductId(productId);
    }

    @Transactional
    public RejectedBidder rejectBidder(
            Integer productId,
            Integer bidderId,
            String reason
    ) {
        Product product = getProductById(productId);
        User bidder = userRepository.findById(bidderId).orElseThrow(() -> new EntityNotFoundException("Bidder not found"));

        // Set reject status if bidder approval was sent
        bidderApprovalRepository
                .findByProductIdAndBidderId(productId, bidderId)
                .ifPresent(approval -> {
                    approval.setStatus(ApproveStatus.REJECTED);
                });

        RejectedBidder rejectedBidder = rejectedBidderRepository
                .findByProductIdAndBidderId(productId, bidderId)
                .orElseGet(() -> rejectedBidderRepository.save(
                        RejectedBidder.builder()
                                .productId(productId)
                                .bidder(bidder)
                                .reason(reason)
                                .createdAt(new Date())
                                .build()
                ));

        // Set to the next if rejected bidder is who is having the highest price
        Optional<Bid> currentTopBidOpt =
                bidRepository.findTopBidByProductId(productId);

        if (currentTopBidOpt.isPresent()
                && currentTopBidOpt.get().getBidder().getId().equals(bidderId)) {

            List<Bid> validBids = bidRepository.findValidBids(productId);

            if (!validBids.isEmpty()) {
                Bid nextBid = validBids.getFirst();
                product.setCurrentPrice(nextBid.getAmount());
            } else {
                product.setCurrentPrice(product.getStartPrice());
            }
        }

        return rejectedBidder;
    }

    public ProductAnswer answerQuestion(Integer userId, Integer productId, Integer questionId, AddAnswerDto answerDto) {
        ProductQuestion question = productQuestionRepository.findById(questionId).orElseThrow(() -> new EntityNotFoundException("Question not found"));
        ProductAnswer productAnswer = ProductAnswer.builder()
                .questionId(questionId)
                .responderId(userId)
                .content(answerDto.getContent())
                .createdAt(new Date())
                .build();
        return productAnswerRepository.save(productAnswer);
    }

    public List<ProductAnswer> getAnswerByProductId(Integer productId) {
        List<ProductAnswer> answers = productAnswerRepository.findByProductId(productId);
        return answers;
    }
}
