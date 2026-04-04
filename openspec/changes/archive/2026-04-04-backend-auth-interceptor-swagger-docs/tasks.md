## 1. Dependency and Config Setup

- [x] 1.1 Add springdoc OpenAPI/Swagger dependency compatible with Spring Boot 3.
- [x] 1.2 Add API documentation config (title/version/security scheme) and expose Swagger/OpenAPI endpoints.
- [x] 1.3 Add environment-aware switch for enabling Swagger endpoints (default enabled in local/dev).

## 2. Auth Interceptor Implementation

- [x] 2.1 Implement backend auth interceptor that validates admin token for protected requests.
- [x] 2.2 Register interceptor via WebMvcConfigurer with default-protected strategy.
- [x] 2.3 Configure whitelist paths for auth endpoints and Swagger/OpenAPI resources.
- [x] 2.4 Remove or simplify duplicated controller-level guard checks where interceptor already guarantees auth.

## 3. Tests and Documentation

- [x] 3.1 Add interceptor tests covering unauthorized rejection and whitelist pass-through.
- [x] 3.2 Add Swagger endpoint tests covering OpenAPI JSON and Swagger UI accessibility.
- [x] 3.3 Add protected API test case to verify no-token request returns 401 via interceptor.
- [x] 3.4 Update root README and backend README with login-first access rule and Swagger usage instructions.
