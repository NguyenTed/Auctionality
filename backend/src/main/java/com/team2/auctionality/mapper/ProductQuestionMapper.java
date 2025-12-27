package com.team2.auctionality.mapper;

import com.team2.auctionality.dto.AddQuestionDto;
import com.team2.auctionality.dto.ProductQuestionDto;
import com.team2.auctionality.model.Product;
import com.team2.auctionality.model.ProductQuestion;
import com.team2.auctionality.model.User;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class ProductQuestionMapper {
    public static ProductQuestion toEntity(User user, Product product, AddQuestionDto question) {
        return  ProductQuestion.builder()
                .asker(user)
                .product(product)
                .content(question.getContent())
                .createdAt(new Date())
                .build();
    }


    public static ProductQuestionDto toDto(ProductQuestion productQuestion) {
        return ProductQuestionDto.builder()
                .id(productQuestion.getId())
                .productId(productQuestion.getProduct().getId())
                .asker(UserMapper.toDto(productQuestion.getAsker()))
                .content(productQuestion.getContent())
                .createdAt(productQuestion.getCreatedAt())
                .build();
    }
}
