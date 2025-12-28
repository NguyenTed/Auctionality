package com.team2.auctionality.email.config;

import com.sendgrid.SendGrid;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "sendgrid")
@Getter
@Setter
public class SendGridConfig {
    private String apiKey;
    private String fromEmail;
    private String fromName;

    @Bean
    public SendGrid sendGrid() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("SendGrid API key is not configured. Please set SENDGRID_API_KEY environment variable.");
        }
        return new SendGrid(apiKey);
    }
}

