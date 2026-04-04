## Context

TwinOps backend 目前使用 `AdminAuthGuard.requireAdmin(...)` 在控制器内部进行鉴权。该方式可工作，但存在分散和可遗漏的问题：新增接口若忘记调用 guard，会产生未授权访问风险。另一方面，项目尚未接入标准 OpenAPI 文档，接口协作和验收依赖手写说明，效率较低。

## Goals / Non-Goals

**Goals:**
- 通过 Spring MVC `HandlerInterceptor` 统一拦截受保护请求，实现默认受保护策略。
- 维护一份明确白名单（登录、退出、健康检查、Swagger/OpenAPI 静态资源与文档端点）。
- 引入 `springdoc-openapi` 自动生成 OpenAPI JSON 与 Swagger UI。
- 保持现有 `ApiResponse<T>` 错误响应模型与 UnauthorizedException 处理链路一致。

**Non-Goals:**
- 不替换当前 token/session 机制（仍沿用现有 admin session token）。
- 不引入 OAuth/JWT 等新认证体系。
- 不改动业务领域 DTO 和数据库结构。

## Decisions

1. 使用 `HandlerInterceptor` + `WebMvcConfigurer` 注册全局鉴权拦截器  
   - Rationale: 在 Web 层统一处理，避免每个控制器重复调用 guard。  
   - Alternative: AOP 切面鉴权。Rejected，因为 URL 白名单管理和静态资源排除在拦截器里更直接。

2. 采用“默认拦截 + 显式白名单”  
   - Rationale: 安全默认值更强，新增业务接口默认受保护。  
   - Alternative: 仅对部分路径启用拦截。Rejected，后续接口增长时风险更高。

3. Swagger 使用 `springdoc-openapi-starter-webmvc-ui`  
   - Rationale: 与 Spring Boot 3 兼容，接入最小化，自动暴露 `/v3/api-docs` 和 `/swagger-ui/index.html`。  
   - Alternative: springfox。Rejected，维护状态与兼容性不如 springdoc。

4. Swagger UI 使用 Bearer token 输入头进行调试  
   - Rationale: 与现有 `Authorization: Bearer <token>` 约定一致。  
   - Alternative: 关闭文档鉴权。Rejected，生产/联调一致性差。

## Risks / Trade-offs

- [Risk] 白名单漏配导致登录接口或文档页面被拦截  
  -> Mitigation: 为白名单路径加单元/切片测试，并在 README 明确端点。

- [Risk] 拦截器落地后现有控制器仍保留 guard 调用造成重复  
  -> Mitigation: 逐步清理冗余 guard 调用，保留行为一致性测试。

- [Risk] Swagger 在生产环境暴露带来安全顾虑  
  -> Mitigation: 通过配置开关控制（如仅 dev/test 打开），并记录部署建议。

## Migration Plan

1. 引入 springdoc 依赖并添加 OpenAPI 基础配置。  
2. 实现并注册鉴权拦截器，配置白名单。  
3. 调整控制器中冗余 guard 调用（保持行为一致）。  
4. 补充测试：拦截器放行/拦截、Swagger 端点可达、受保护接口未登录返回 401。  
5. 更新 README 的登录访问规则与 Swagger 访问方式。  
6. 回滚方案：移除拦截器注册和 springdoc 依赖，恢复原 guard-only 路径。

## Open Questions

- Swagger 文档端点在生产是否默认关闭（建议配置化，默认开启 dev/test）。
