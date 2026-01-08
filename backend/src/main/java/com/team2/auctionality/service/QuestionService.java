package com.team2.auctionality.service;

import com.team2.auctionality.dto.AddQuestionDto;
import com.team2.auctionality.dto.ProductQuestionDto;
import com.team2.auctionality.email.EmailService;
import com.team2.auctionality.email.dto.QuestionNotificationEmailRequest;
import com.team2.auctionality.mapper.ProductQuestionMapper;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.ProductQuestion;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.ProductQuestionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionService {

    private final ProductQuestionRepository questionRepository;
    private final ProductService productService;
    private final EmailService emailService;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Transactional
    public ProductQuestion createQuestion(User asker, Integer productId, AddQuestionDto questionDto) {
        log.debug("User {} creating question for product {}", asker.getId(), productId);
        Product product = productService.getProductById(productId);
        ProductQuestion question = ProductQuestionMapper.toEntity(asker, product, questionDto);
        ProductQuestion savedQuestion = questionRepository.save(question);

        // Send email notification to seller
        String productUrl = frontendBaseUrl + "/products/" + productId;
        String askerName = asker.getProfile() != null && asker.getProfile().getFullName() != null
                ? asker.getProfile().getFullName()
                : asker.getEmail();
        emailService.sendQuestionNotification(
                new QuestionNotificationEmailRequest(
                        product.getSeller().getEmail(),
                        product.getTitle(),
                        productUrl,
                        question.getContent(),
                        askerName
                )
        );

        return savedQuestion;
    }

    @Transactional(readOnly = true)
    public List<ProductQuestionDto> getQuestionsByProductId(Integer productId) {
        log.debug("Getting questions for product {}", productId);
        // Verify product exists
        productService.getProductById(productId);
        
        List<ProductQuestion> questions = questionRepository.findByProductId(productId);
        
        if (questions.isEmpty()) {
            return List.of();
        }

        return questions.stream()
                .map(ProductQuestionMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductQuestion getQuestionById(Integer questionId) {
        return questionRepository.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Question not found"));
    }
}

