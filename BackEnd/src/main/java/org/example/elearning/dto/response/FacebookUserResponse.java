package org.example.elearning.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FacebookUserResponse {
    String id;
    String email;
    String name;
    
    @JsonProperty("first_name")
    String firstName;
    
    @JsonProperty("last_name")
    String lastName;
    
    @JsonProperty("picture")
    Picture picture;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Picture {
        Data data;
        
        @Getter
        @Setter
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        @FieldDefaults(level = AccessLevel.PRIVATE)
        public static class Data {
            String url;
            @JsonProperty("is_silhouette")
            boolean isSilhouette;
        }
    }
}

