plugins {
	java
	id("org.springframework.boot") version "3.5.0"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "org.example"
version = "0.0.1-SNAPSHOT"
description = "BackEnd"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
}

repositories {
	mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("me.paulschwarz:spring-dotenv:4.0.0")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.13")
    implementation("org.springframework.boot:spring-boot-starter-validation")
//    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    implementation("org.springframework.boot:spring-boot-starter-security:3.5.6")
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")

    implementation("org.springframework.cloud:spring-cloud-starter-openfeign:4.3.0")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")
    implementation("redis.clients:jedis:6.2.0")
    implementation("org.springframework.data:spring-data-redis:3.5.4")
    implementation("org.springframework.boot:spring-boot-starter-actuator:3.5.6")
    implementation ("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    implementation("com.cloudinary:cloudinary-http45:1.39.0")
    
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    
    implementation("org.springframework.kafka:spring-kafka")
    
    // Email support
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")

    // Apache POI for Excel import
    implementation("org.apache.poi:poi:5.2.5")
    implementation("org.apache.poi:poi-ooxml:5.2.5")

    developmentOnly("org.springframework.boot:spring-boot-devtools")
    runtimeOnly("org.postgresql:postgresql")

    // Flyway for database migrations
    implementation("org.flywaydb:flyway-core")

    // Lombok
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")
    // MapStruct
    implementation ("org.mapstruct:mapstruct:1.5.5.Final")
    annotationProcessor ("org.mapstruct:mapstruct-processor:1.5.5.Final")
    annotationProcessor ("org.projectlombok:lombok-mapstruct-binding:0.2.0")

    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
