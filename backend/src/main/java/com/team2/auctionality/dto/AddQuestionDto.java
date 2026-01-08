package com.team2.auctionality.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddQuestionDto {
    @NotBlank(message = "Question content is required")
    @Size(min = 10, max = 1000, message = "Question must be between 10 and 1000 characters")
    private String content;
}
