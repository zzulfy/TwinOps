package com.twinops.backend.auth.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
    classes = SwaggerEndpointsTest.TestApp.class,
    webEnvironment = SpringBootTest.WebEnvironment.MOCK,
    properties = {
        "twinops.auth.interceptor.enabled=false",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,com.baomidou.mybatisplus.autoconfigure.MybatisPlusAutoConfiguration"
    }
)
@AutoConfigureMockMvc
class SwaggerEndpointsTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldExposeOpenApiJson() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
            .andExpect(status().isOk())
            .andExpect(content().string(containsString("\"openapi\"")))
            .andExpect(content().string(containsString("TwinOps Backend API")));
    }

    @Test
    void shouldExposeSwaggerUi() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html"))
            .andExpect(status().isOk())
            .andExpect(content().string(containsString("Swagger UI")));
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration
    @Import(OpenApiConfig.class)
    static class TestApp {
    }

    @RestController
    static class PingController {
        @GetMapping("/api/ping")
        String ping() {
            return "pong";
        }
    }
}
