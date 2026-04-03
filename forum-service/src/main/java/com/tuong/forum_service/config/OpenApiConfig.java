package com.tuong.forum_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI forumServiceOpenApi() {
    return new OpenAPI().info(new Info()
        .title("Forum Service API")
        .description("API tai lieu cho forum_service")
        .version("v1")
        .license(new License().name("Internal Use")));
  }
}
