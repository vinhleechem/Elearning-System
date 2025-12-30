package org.example.elearning.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${file.upload.dir:uploads/videos}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path path = Paths.get(uploadDir).toAbsolutePath().normalize();
        String resourcePath = path.toUri().toString();
        
        if (!resourcePath.endsWith("/")) {
            resourcePath += "/";
        }
        
        registry.addResourceHandler("/uploads/videos/**")
                .addResourceLocations(resourcePath)
                .setCachePeriod(3600);
    }
}
