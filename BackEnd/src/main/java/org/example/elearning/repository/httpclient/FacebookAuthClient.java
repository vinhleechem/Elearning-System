package org.example.elearning.repository.httpclient;

import feign.QueryMap;
import org.example.elearning.dto.request.ExchangeTokenRequest;
import org.example.elearning.dto.response.ExchangeTokenResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "facebook-auth", url = "https://graph.facebook.com")
public interface FacebookAuthClient {
    @GetMapping(value = "/v18.0/oauth/access_token", produces = MediaType.APPLICATION_JSON_VALUE)
    ExchangeTokenResponse exchangeToken(@QueryMap ExchangeTokenRequest exchangeTokenRequest);
}

