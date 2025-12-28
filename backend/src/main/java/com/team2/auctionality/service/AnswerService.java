package com.team2.auctionality.service;

import com.team2.auctionality.dto.AddAnswerDto;
import com.team2.auctionality.email.EmailService;
import com.team2.auctionality.email.dto.AnswerNotificationEmailRequest;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.ProductAnswer;
import com.team2.auctionality.model.ProductQuestion;
import com.team2.auctionality.model.User;
import com.team2.auctionality.repository.ProductAnswerRepository;
import com.team2.auctionality.repository.ProductQuestionRepository;
import com.team2.auctionality.repository.UserRepository;
import com.team2.auctionality.service.ProductService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnswerService {

    private final ProductAnswerRepository answerRepository;
    private final ProductQuestionRepository questionRepository;
    private final QuestionService questionService;
    private final ProductService productService;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Transactional
    public ProductAnswer createAnswer(Integer userId, Integer questionId, AddAnswerDto answerDto) {
        log.debug("User {} answering question {}", userId, questionId);
        ProductQuestion question = questionService.getQuestionById(questionId);
        Product product = question.getProduct();
        User responder = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        ProductAnswer answer = ProductAnswer.builder()
                .questionId(questionId)
                .responderId(userId)
                .content(answerDto.getContent())
                .createdAt(new Date())
                .build();
        ProductAnswer savedAnswer = answerRepository.save(answer);

        // Send email notification to question asker
        String productUrl = frontendBaseUrl + "/products/" + product.getId();
        emailService.sendAnswerNotification(
                new AnswerNotificationEmailRequest(
                        question.getAsker().getEmail(),
                        product.getTitle(),
                        productUrl,
                        savedAnswer.getContent(),
                        responder.getProfile().getFullName()
                )
        );

        return savedAnswer;
    }

    @Transactional(readOnly = true)
    public List<ProductAnswer> getAnswersByQuestionId(Integer questionId) {
        log.debug("Getting answers for question {}", questionId);
        // Verify question exists
        questionService.getQuestionById(questionId);
        return answerRepository.findByQuestionId(questionId);
    }

    @Transactional(readOnly = true)
    public List<ProductAnswer> getAnswersByProductId(Integer productId) {
        log.debug("Getting answers for product {}", productId);
        return answerRepository.findByProductId(productId);
    }
}

