# TwinOps — 数据中心数字孪生智能运维平台

**TwinOps** 是一套面向数据中心设备运维的数字孪生与智能分析平台，集可视化监控、告警管理、聚合 AI 分析与设备级 RCA（Root Cause Analysis）于一体。旨在帮助运维团队在复杂机房场景下快速定位问题、评估风险并给出可操作建议。

---

## 目录

- [项目简介](#项目简介)
- [功能亮点](#功能亮点)
- [技术栈](#技术栈)
- [环境要求](#环境要求)
- [安装部署](#安装部署)
- [使用教程](#使用教程)
- [目录结构](#目录结构)
- [注意事项](#注意事项)
- [更新日志](#更新日志)
- [开源协议 &amp; 作者信息](#开源协议--作者信息)

---

## 项目简介

**核心作用**：通过数字孪生可视化与数据驱动分析，为数据中心机房提供实时监控、异常检测与根因定位能力，降低故障排查成本并提升响应效率。

**解决痛点**：

- 分布式设备多、指标复杂，人工排查耗时；
- 告警噪音与误报影响决策效率；
- 追溯根因需要跨设备的时序因果分析与专家知识。

**适用场景**：数据中心运维、边缘计算机房、工业现场监控、任何需要设备群体级健康判断与根因定位的场景。

---

## 功能亮点

- **可视化 Dashboard**：设备状态、故障率趋势、告警面板与右侧三维仿真场景。
- **设备管理**：设备详情、告警处理、关注列表管理。
- **聚合 AI 分析**：触发聚合分析任务，生成结构化分析报告并支持 LLM 文本描述。
- **设备级 RCA Sidecar**：基于 AERCA 的多变量时序因果发现与根因排序（FastAPI sidecar）。
- **可回退策略**：LLM/sidecar 不可用时自动 fallback 到本地 mock，保证演示与开发不中断。
- **可扩展事件流水**：Kafka 作业驱动的分析流水线，便于扩展与线上部署。

---

## 技术栈

- 前端：React 19 + TypeScript + Vite + Three.js + ECharts
- 后端：Spring Boot 3.3、MyBatis-Plus、LangChain4j
- RCA sidecar：Python 3.11、PyTorch（可选 GPU）、AERCA 实现 + FastAPI
- 数据库：MySQL 8
- 消息中间件：Kafka 3.x
- 开发/构建：Maven、npm、Vite、ESLint、Prettier

---

## 环境要求

- 操作系统：Windows 10/11（开发），Ubuntu 20.04+（生产/研究）
- Node.js：>=20
- npm：>=9
- JDK：>=17
- Maven：>=3.9
- Python：>=3.11（仅 causaltrace-rca sidecar）
- MySQL：>=8.0
- Kafka：3.x

> **说明**：AERCA（RCA 模块）包含 PyTorch，建议根据硬件（CPU/GPU + CUDA）按官方安装指南单独安装 PyTorch。

---

## 安装部署

以下为在本地开发环境的**分步**部署示例（仅覆盖常见场景）。

### 1. 克隆仓库

```bash
git clone https://github.com/zzulfy/TwinOps.git
cd TwinOps
```

### 2. 初始化数据库（MySQL）

```bash
mysql -uroot -p -e "CREATE DATABASE IF NOT EXISTS twinops DEFAULT CHARSET utf8mb4;"
# 在 backend/sql 目录下按顺序导入 schema 与 seed
mysql -h127.0.0.1 -P3306 -uroot -proot twinops < backend/sql/001_schema.sql
mysql -h127.0.0.1 -P3306 -uroot -proot twinops < backend/sql/002_seed_devices.sql
mysql -h127.0.0.1 -P3306 -uroot -proot twinops < backend/sql/003_seed_metrics.sql
mysql -h127.0.0.1 -P3306 -uroot -proot twinops < backend/sql/004_seed_alarms.sql
mysql -h127.0.0.1 -P3306 -uroot -proot twinops < backend/sql/005_verify_retention.sql
```

### 3. 启动 Kafka（若需分析流水线）

创建 topic：

```bash
kafka-topics.sh --bootstrap-server 127.0.0.1:9092 --create --topic analysis.request --partitions 1 --replication-factor 1
```

### 4. 启动后端（Spring Boot）

```bash
cd backend
mvn -DskipTests package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

- 默认监听：`http://127.0.0.1:8080`

### 5. 启动前端（开发）

```bash
cd frontend
npm ci
npm run dev   # 本地开发服务器
# 或构建静态包
npm run build
npm run preview
```

### 6. 启动 RCA sidecar（可选，设备级 RCA）

推荐使用虚拟环境或 conda：

```bash
# conda环境
conda create -n causaltrace-rca python=3.11 -y
conda activate causaltrace-rca

# 安装轻量服务依赖（FastAPI/uvicorn 等）
pip install -r causaltrace-rca/requirements-server.txt

# 安装 PyTorch 请根据官方指引（依据 CUDA/CPU）
# 例如（CPU 版本示例）：
pip install torch --index-url https://download.pytorch.org/whl/cpu

# 启动
uvicorn service.app:app --host 127.0.0.1 --port 8091
# Windows 可使用仓库自带脚本：
# .\causaltrace-rca\start-rca.ps1
```

> 若 sidecar 报错缺少模型文件，请使用：

```bash
python causaltrace-rca/scripts/check_saved_models.py
```

### 7. Windows 一键开发启动（仓库含脚本）

```powershell
.\start-dev.ps1
```

---

## 配置示例（后端 LLM 配置）

后端通过 Spring 属性 `twinops.analysis.llm.*` 配置 LLM 提供者，示例（application.yml 或环境变量）：

```yaml
twinops:
  analysis:
    llm:
      provider: openai
      base-url: https://api.openai.com/v1
      api-key: ${TWINOPS_ANALYSIS_LLM_API_KEY}
      model: gpt-4o
      temperature: 0.2
      max-tokens: 512
      fallback-to-mock: true
```

也可以通过环境变量传递（Linux/macOS）：

```bash
export TWINOPS_ANALYSIS_LLM_API_KEY="sk-xxxx"
```

Windows PowerShell：

```powershell
$Env:TWINOPS_ANALYSIS_LLM_API_KEY = 'sk-xxxx'
```

---

## 使用教程（示例）

- 登录（示例）：

```bash
curl -X POST "http://127.0.0.1:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

- 查询服务状态（Analysis health）：

```bash
curl http://127.0.0.1:8080/api/analysis/health
```

- 触发聚合分析（示例）：

```bash
curl -X POST http://127.0.0.1:8080/api/analysis/reports/trigger -H "Authorization: Bearer <token>"
```

- 获取设备列表：

```bash
curl http://127.0.0.1:8080/api/devices
```

> 说明：接口的认证/请求体格式请参见后端 API 文档（backend/README.md 或 Swagger UI）。

---

## 目录结构（简要）

```
TwinOps/
├─ backend/               # Spring Boot 后端服务
├─ frontend/              # React + Vite 前端
├─ causaltrace-rca/       # AERCA 根因分析实现与 FastAPI sidecar
├─ data/                  # 数据集与示例数据
├─ openspec/              # 需求与设计规范工件
├─ reports/               # 截图与验证产物
├─ start-dev.ps1          # Windows 一键启动脚本
└─ README.md              # 本文件
```

---

## 注意事项与故障排查

- **uvicorn 未识别**：通常是未激活虚拟环境或 uvicorn 未安装。使用 `python -m uvicorn ...` 可避免 PATH 问题。
- **缺少模型文件**（sidecar）：运行 `python causaltrace-rca/scripts/check_saved_models.py` 或按 README 中说明用 `python main.py --dataset_name msds` 生成示例模型。
- **数据库连接失败**：检查 MySQL 服务、用户/密码、端口以及 `backend/src/main/resources` 中的配置。
- **Kafka 未就绪**：确保 topic `analysis.request` 存在且 broker 可达。
- **后端日志**：检查 backend 日志（jar 运行目录下的输出）以获取异常栈信息。
- **Token 有效期**：管理员 token 在后端进程内存中默认有效 12 小时，重启后需重新登录。
- **CORS / 代理**：若前端与后端分开部署，请确认后端允许来自前端的跨域，或在 Vite 中配置代理。

---

## 更新日志

- **v0.1.0** — 增加 Windows 下 RCA 启动脚本与 smoke 测试，完善 README（2026-04）
- **v0.0.1** — 初始实现：前后端、RCA sidecar 与示例数据

---

## 开源协议 & 作者信息

**License**: MIT

**作者/维护者**: zzulfy

如需支持或提交建议，请在仓库 Issues 中打开 issue，或提交 Pull Request。

---

感谢使用 TwinOps，欢迎反馈与贡献！
