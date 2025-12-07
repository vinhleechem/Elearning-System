package org.example.elearning.repository.httpclient;

import org.example.elearning.dto.response.FacebookUserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "facebook-user-client", url = "https://graph.facebook.com")
public interface FacebookUserClient {
    @GetMapping("/v18.0/me")
    FacebookUserResponse getUserInfo(
            @RequestParam("fields") String fields,
            @RequestParam("access_token") String accessToken
    );
}

