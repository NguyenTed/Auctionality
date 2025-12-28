package com.team2.auctionality.controller;

import com.team2.auctionality.config.CurrentUser;
import com.team2.auctionality.dto.AddQuestionDto;
import com.team2.auctionality.dto.ProductQuestionDto;
import com.team2.auctionality.model.User;
import com.team2.auctionality.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
@Tag(name = "Question", description = "Question API")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping
    @Operation(summary = "Create a question for a product")
    public ResponseEntity<ProductQuestionDto> createQuestion(
            @CurrentUser User user,
            @RequestParam Integer productId,
            @Valid @RequestBody AddQuestionDto questionDto
    ) {
        log.info("User {} creating question for product {}", user.getId(), productId);
        var question = questionService.createQuestion(user, productId, questionDto);
        URI location = URI.create("/api/questions/" + question.getId());
        return ResponseEntity
                .created(location)
                .body(com.team2.auctionality.mapper.ProductQuestionMapper.toDto(question));
    }

    @GetMapping("/products/{productId}")
    @Operation(summary = "Get all questions for a product")
    public ResponseEntity<List<ProductQuestionDto>> getQuestionsByProductId(
            @PathVariable Integer productId
    ) {
        return ResponseEntity.ok(questionService.getQuestionsByProductId(productId));
    }

    @GetMapping("/{questionId}")
    @Operation(summary = "Get question by id")
    public ResponseEntity<ProductQuestionDto> getQuestionById(
            @PathVariable Integer questionId
    ) {
        var question = questionService.getQuestionById(questionId);
        return ResponseEntity.ok(com.team2.auctionality.mapper.ProductQuestionMapper.toDto(question));
    }
}

