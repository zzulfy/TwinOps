## Why

当前后端鉴权主要由各 Controller 手动调用 guard，存在遗漏风险；同时缺少标准化 API 文档入口，不利于联调和验收。需要统一通过拦截器收口鉴权，并引入 Swagger/OpenAPI 自动生成接口文档。

## What Changes

- 新增全局登录拦截器，对后端受保护接口统一做 admin token 校验，避免“某个接口忘记加鉴权”。
- 认证策略改为“默认保护，白名单放行”：仅登录与文档基础资源等必要端点放行，其余业务接口需先登录。
- 引入 Swagger/OpenAPI（springdoc）生成接口文档与 Swagger UI，支持按统一响应结构查看接口。
- 为鉴权拦截器和文档端点补充测试，覆盖放行、拦截、错误响应等关键路径。
- 同步更新 README（root/backend）中的鉴权与 API 文档访问说明。

## Capabilities

### New Capabilities
- `backend-api-documentation`: 定义后端 OpenAPI 文档生成、Swagger UI 访问与鉴权头使用方式。

### Modified Capabilities
- `admin-authentication`: 鉴权从“控制器级调用”升级为“拦截器统一收口”，要求受保护接口默认必须登录。

## Impact

- Affected code: `backend` 鉴权配置、拦截器实现、Swagger 配置与依赖、相关测试。
- APIs: 业务 API 访问前置登录约束更严格（默认需 token）。
- Dependencies: 新增 `springdoc-openapi` 相关依赖。
- Systems: 无数据库 schema 变更。
