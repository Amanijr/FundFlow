package com.project.daisyDonation.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI fundFlowOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("FundFlow ERP API")
                        .description("""
                                Nonprofit financial management platform API.

                                Authenticate via `POST /api/v1/auth/login` or `POST /api/v1/auth/register`,
                                then click **Authorize** and enter `Bearer <accessToken>`.
                                """)
                        .version("v1")
                        .contact(new Contact()
                                .name("FundFlow ERP")
                                .email("support@fundflow.example")))
                .addServersItem(new Server().url("/").description("Current host"))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT access token from /api/v1/auth/login")));
    }
}
