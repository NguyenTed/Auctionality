package com.team2.auctionality.controller;

import com.team2.auctionality.config.CurrentUser;
import com.team2.auctionality.dto.AddAnswerDto;
import com.team2.auctionality.model.ProductAnswer;
import com.team2.auctionality.model.User;
import com.team2.auctionality.service.AnswerService;
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
@RequestMapping("/api/questions/{questionId}/answers")
@Tag(name = "Answer", description = "Answer API")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class AnswerController {

    private final AnswerService answerService;

    @PostMapping
    @Operation(summary = "Answer a question")
    public ResponseEntity<ProductAnswer> createAnswer(
            @PathVariable Integer questionId,
            @Valid @RequestBody AddAnswerDto answerDto,
            @CurrentUser User user
    ) {
        log.info("User {} answering question {}", user.getId(), questionId);
        ProductAnswer answer = answerService.createAnswer(user.getId(), questionId, answerDto);
        URI location = URI.create("/api/questions/" + questionId + "/answers/" + answer.getId());
        return ResponseEntity
                .created(location)
                .body(answer);
    }

    @GetMapping
    @Operation(summary = "Get all answers for a question")
    public ResponseEntity<List<ProductAnswer>> getAnswersByQuestionId(
            @PathVariable Integer questionId
    ) {
        return ResponseEntity.ok(answerService.getAnswersByQuestionId(questionId));
    }
}

