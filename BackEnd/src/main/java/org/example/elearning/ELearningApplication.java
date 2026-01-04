package org.example.elearning;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;


@SpringBootApplication
@Slf4j
@EnableFeignClients
public class ELearningApplication {

    // Trigger rebuild 6 (final)
	public static void main(String[] args) {
        SpringApplication.run(ELearningApplication.class, args);
	}

}
