# 自动化测试平台 (Automatic Test Platform)

这是一个基于 Next.js 15+、Prisma 和 BullMQ 构建的低代码自动化测试平台。

## 项目愿景

提供一个统一的界面来管理、运行和分析 API 及 UI 自动化测试用例。

## 核心技术栈

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js Route Handlers (API), Prisma (ORM), PostgreSQL (Database)
- **Task Queue**: BullMQ (Job Scheduling), Ioredis (Redis Connection)
- **Execution Engines**:
  - **API Test**: Axios
  - **UI Test**: Playwright (Chromium)
- **Styling**: Tailwind CSS v4, Lucide Icons

## 项目架构与目录结构

- `src/app/`: Next.js 应用核心，包含页面和 API 路由。
  - `src/app/api/`: 后端接口实现。
  - `src/app/(projects|api-test|ui-test|environments|test-plans|test-reports)/`: 各功能模块页面。
- `src/components/`: 可复用 UI 组件。
  - `src/components/ui/`: 基础 UI 组件 (基于 Shadcn)。
- `src/lib/`: 公共库及初始化逻辑。
  - `prisma.ts`: Prisma 客户端单例。
  - `queue.ts`: BullMQ 队列及 Redis 连接配置。
- `src/worker/`: 独立运行的后台任务处理进程。
  - `main.ts`: 核心测试执行逻辑，处理 API 请求与 UI 脚本。
- `prisma/`: 数据库 Schema 定义。

## 核心业务模型 (Data Model)

- **Project**: 测试项目容器，隔离环境、用例和套件。
- **Environment**: 环境配置（BaseURL, Headers, Variables）。
- **ApiTestCase**: 接口测试用例（Method, URL, Headers, Params, Body, Assertions）。
- **UiTestCase**: UI 测试用例（Low-code Steps 或 Playwright Script）。
- **TestSuite**: 测试套件，用于编排多个测试用例。
- **TestRun**: 测试执行记录，跟踪执行状态。
- **TestResult**: 单个用例的执行结果（Status, Duration, Logs, Screenshot）。

## 开发与运行约定

1. **API 开发**: 优先使用 Next.js App Router 的 Route Handlers。
2. **数据库操作**: 统一使用 `src/lib/prisma.ts` 中的客户端实例。
3. **任务调度**: 长时间运行或需要队列处理的任务应提交至 `test-execution` 队列。
4. **UI 测试**: 目前支持简单的低代码步骤 (goto, click, fill, waitForSelector, assertVisible)。
5. **环境变量**:
   - `DATABASE_URL`: PostgreSQL 连接字符串。
   - `REDIS_URL`: Redis 连接字符串。
6. **运行 Worker**:
   - 使用 `node -r ts-node/register src/worker/main.ts` (或类似命令) 启动独立 Worker 进程以处理测试执行任务。

## 部署与运维 (Deployment & Ops)

1. **容器化**: 项目提供 `Dockerfile` 和 `docker-compose.yml`，支持一键部署。
   - `Dockerfile` 采用多阶段构建，利用 Next.js `standalone` 模式优化镜像体积。
   - 默认监听端口: `3001`。
2. **数据库迁移**: 启动时会自动运行 `npx prisma migrate deploy` 以同步数据库结构。
3. **环境变量控制**:
   - 必须通过环境变量注入 `DATABASE_URL` (PostgreSQL) 和 `REDIS_URL` (Redis)。

## 注意事项

- **截图管理**: 目前 UI 测试生成的截图以 base64 形式部分记录在日志中，生产环境建议接入 S3 等对象存储。
- **安全性**: 敏感配置（如环境变量中的 Secret）应加密存储。
- **依赖安装**: 使用 `pnpm` 进行依赖管理。
