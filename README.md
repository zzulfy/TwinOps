# TwinOps

TwinOps 是一个面向数据中心场景的数字孪生运维系统。当前仓库提供一套前后端同仓的完整闭环：

- Dashboard：查看设备规模、故障率趋势、告警与右侧仿真画面
- Devices：查看单设备详情、处理告警、管理关注列表
- Analysis：触发并查看聚合 AI 分析报告

## 技术栈

- Frontend：React 19 + TypeScript + Vite + Three.js + ECharts
- Backend：Spring Boot 3.3 + MyBatis-Plus + MySQL + Kafka + LangChain4j

## 仓库结构

- `frontend/`：前端应用与页面交互
- `backend/`：后端 API、SQL、seed 脚本、测试
- `data/`：SMD / MSDS 数据集
- `reports/`：截图与验证产物
- `openspec/`：需求与规格工件

## 当前实现要点

- 前端使用 Hash Router，受保护页面为 `/`、`/devices`、`/devices/:deviceCode`、`/analysis`
- 管理员 token 存在后端进程内存中，默认有效期 12 小时；后端重启后需要重新登录
- Dashboard 右侧仿真区由 `frontend/src/hooks/useDashboardScene.ts` 程序化构建 Three.js 场景，当前采用 32 台设备演示集与现代控制室展示廊构图：中轴窄通道 + 双侧设备平台 + 前/中/后/尾端分层柜列、偏轴低机位默认镜头、按 `visualFamily` 区分轮廓的柜体家族、现代化吊顶灯槽、分缝墙面、暗色磨砂标题牌、阻尼平滑移动、左键边缘平移/中部旋转、室内范围内的大角度自由旋转和局部状态灯效
- 前端构建对 React、图表运行时和 Three.js 依赖做手工分块，已把受控延迟包的 chunk warning 阈值调整为 700 kB
- 仿真 UI 由前端共享目录 `frontend/src/config/simulationDeviceCatalog.json` 持有，当前维护 32 台户内设备：`DEV001` ~ `DEV032`，并与数据库 seed 设备集保持 1:1
- 后端 `/api/devices/simulation-data` 只返回业务数据，前端负责“固定 UI 配置 + 实时数据”合并渲染
- `label_key` 继续保留 GLB 节点名称以保证映射稳定，对外展示的设备名称和类型统一收敛为户内配电、控制与机柜设备
- `/api/devices/simulation-consistency` 会检查并可自动修复仿真设备集合与数据库设备集合一致性
- Analysis 采用聚合批处理：一次 trigger 只发布 1 条 Kafka job，并最终生成 1 条聚合报告（`deviceCode=AGGREGATED`）
- LLM 调用默认允许 fallback 到本地 mock，避免演示环境因外部模型不可用而完全失败

## 环境要求

- Node.js 20+
- npm 9+
- JDK 17+
- Maven 3.9+
- MySQL 8+
- Kafka 3.x

## 快速启动

### 1. 初始化数据库

```bash
mysql -uroot -p -e "CREATE DATABASE IF NOT EXISTS twinops DEFAULT CHARSET utf8mb4;"
python backend/scripts/generate_dataset_seeds.py

mysql -h 127.0.0.1 -P 3306 -uroot -proot twinops < backend/sql/001_schema.sql
mysql -h 127.0.0.1 -P 3306 -uroot -proot twinops < backend/sql/002_seed_devices.sql
mysql -h 127.0.0.1 -P 3306 -uroot -proot twinops < backend/sql/003_seed_metrics.sql
mysql -h 127.0.0.1 -P 3306 -uroot -proot twinops < backend/sql/004_seed_alarms.sql
mysql -h 127.0.0.1 -P 3306 -uroot -proot twinops < backend/sql/005_verify_retention.sql
```

### 2. 启动 Kafka

确保本地有可用的 Kafka，并创建 topic：

```bash
kafka-topics.sh --bootstrap-server 127.0.0.1:9092 --create --topic analysis.request --partitions 1 --replication-factor 1
```

### 3. 启动后端

```bash
cd backend
mvn -DskipTests package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

默认地址：`http://127.0.0.1:8080`

### 4. 启动前端

```bash
cd frontend
npm ci
npm run build
npm run dev
```

开发地址默认由 Vite 输出。

### 5. Windows 一键启动

```powershell
.\start-dev.ps1
```

脚本会：

1. 构建并后台启动后端
2. 安装前端依赖
3. 构建前端
4. 前台启动前端 dev server

## 常用接口

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/fault-rate/trend?predictMinutes=5`
- `GET /api/devices`
- `GET /api/devices/{deviceCode}`
- `GET /api/devices/simulation-data`
- `GET /api/devices/simulation-consistency?autoRepair=true`
- `GET /api/alarms?status=new&limit=20`
- `PATCH /api/alarms/{id}/status`
- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/{deviceCode}`
- `GET /api/analysis/reports?limit=20`
- `POST /api/analysis/reports/trigger`

## 前端与后端补充文档

- [frontend/README.md](./frontend/README.md)
- [backend/README.md](./backend/README.md)

## README 维护规则

- 从本次变更开始，只要修改了代码，就必须同步检查并更新根目录 `README.md`
- `README.md` 只保留当前可运行、可维护的项目说明，不记录 OpenSpec 变更过程、归档记录、轮次验证流水账
- 详细设计、变更历史和规格演进放在 `openspec/`，不要继续堆进 `README.md`
- 如果某次代码变更不会影响 README 中任何事实，也需要显式确认“无需更新 README”后再结束该次工作
