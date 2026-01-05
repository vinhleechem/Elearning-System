package org.example.elearning.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {
    
    /**
     * Auto-create course-events topic with 3 partitions
     */
    @Bean
    public NewTopic courseEventsTopic() {
        return TopicBuilder.name("course-events")
                .partitions(3)
                .replicas(1)
                .build();
    }
}
