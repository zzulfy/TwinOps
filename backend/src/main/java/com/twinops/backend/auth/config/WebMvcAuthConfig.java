package com.twinops.backend.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@ConditionalOnProperty(prefix = "twinops.auth.interceptor", name = "enabled", havingValue = "true", matchIfMissing = true)
public class WebMvcAuthConfig implements WebMvcConfigurer {

    private final AdminAuthInterceptor adminAuthInterceptor;
    private final boolean swaggerEnabled;

    public WebMvcAuthConfig(
        AdminAuthInterceptor adminAuthInterceptor,
        @Value("${twinops.swagger.enabled:true}") boolean swaggerEnabled
    ) {
        this.adminAuthInterceptor = adminAuthInterceptor;
        this.swaggerEnabled = swaggerEnabled;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        var registration = registry.addInterceptor(adminAuthInterceptor)
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/auth/login", "/api/auth/logout");
        if (swaggerEnabled) {
            registration.excludePathPatterns(
                "/v3/api-docs/**",
                "/swagger-ui/**",
                "/swagger-ui.html"
            );
        }
    }
}
