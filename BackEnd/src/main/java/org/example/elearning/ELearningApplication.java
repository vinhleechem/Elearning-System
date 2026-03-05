package org.example.elearning;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@Slf4j
@EnableFeignClients
@EnableScheduling
public class ELearningApplication {

	public static void main(String[] args) {
        SpringApplication.run(ELearningApplication.class, args);
	}

}
