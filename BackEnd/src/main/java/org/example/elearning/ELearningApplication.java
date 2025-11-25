package org.example.elearning;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@Slf4j
@EnableFeignClients
public class ELearningApplication {

	public static void main(String[] args) {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .load();

            dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));
            if (log.isInfoEnabled()) {
                log.info("✅ Loaded .env variables..");
            }
        } catch (Exception e) {
            if (log.isWarnEnabled()) {
                log.warn("⚠️ .env file not found or failed to load.", e);
            }
        }

        SpringApplication.run(ELearningApplication.class, args);
	}

}
