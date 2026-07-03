# YiYang Center

外层包装项目，当前包含：

- `YiYang_Vue`：`Vue 3 + Vite + Pinia + Element Plus`
- `YiYang_Node`：`NestJS + Prisma + MySQL`，已拆为 `gateway / service-auth / service-care`
- `YiYang_Launcher`：一键启动、端口清理、Redis 检查和统一构建脚本
- `docs`：项目说明、设计文档和模块熟悉指南

## 目录结构

```txt
Zzz
|- YiYang_Launcher/
|- YiYang_Vue/
|- YiYang_Node/
`- docs/
```

## 环境要求

- `Node.js >= 22`
- `npm >= 10`
- `MySQL 8` 或 `MariaDB`

建议先确认版本：

```bash
node -v
npm -v
mysql --version
```

## 初始化

### 1. 安装依赖

```bash
cd YiYang_Launcher && npm install
cd ../YiYang_Vue && npm install
cd ../YiYang_Node && npm install
```

### 2. 创建数据库

```sql
CREATE DATABASE yiyang_center CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 配置后端环境变量

```bash
cp ../YiYang_Node/.env.example ../YiYang_Node/.env
```

PowerShell:

```powershell
Copy-Item ..\YiYang_Node\.env.example ..\YiYang_Node\.env
```

关键变量：

```env
GATEWAY_PORT=3000
AUTH_SERVICE_HOST=127.0.0.1
AUTH_SERVICE_PORT=4010
CARE_SERVICE_HOST=127.0.0.1
CARE_SERVICE_PORT=4020
DATABASE_URL="mysql://root:1111@localhost:3306/yiyang_center"
JWT_SECRET="replace-me"
JWT_EXPIRES_IN="7d"
```

### 4. 生成 Prisma Client 并迁移数据库

```bash
cd ../YiYang_Node
npm run prisma:generate
npm run prisma:migrate:dev
npm run db:seed
```

### 5. 可选配置前端 API 地址

```bash
cp ../YiYang_Vue/.env.example ../YiYang_Vue/.env
```

默认值：

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 启动

### 一键启动后端三服务

在 `YiYang_Launcher` 目录执行：

```bash
npm run dev:node
```

会并行启动：

- `gateway`：`http://localhost:3000`
- `service-auth`：TCP `127.0.0.1:4010`
- `service-care`：TCP `127.0.0.1:4020`

健康检查：

- `http://localhost:3000/api/health`

### 一键启动前后端

在 `YiYang_Launcher` 目录执行：

```bash
npm run dev
```

会并行启动：

- 后端三服务
- 前端 Vite 开发服务

### 启动前端

另开一个终端：

```bash
npm run dev:vue
```

默认地址：

- `http://localhost:5173`

## 常用命令

```bash
npm run dev:node
npm run dev:vue
npm run dev
npm run build
npm run lint
npm run format
```

## 代码生成器

后端已内置 Nest CRUD 骨架生成器：

```bash
cd ../YiYang_Node
npm run generate:module -- --name resident-log --scope care --route resident-logs --fields title:string:required,age:number:optional,enabled:boolean:optional
```

生成内容包括：

- `module`
- `controller`
- `service`
- `create/update/query dto`
- `contracts` 占位类型

## 默认登录账号

执行种子脚本后可使用：

- 手机号：`19100001910`
- 密码：`123456`

## 说明

- 前端 API 统一通过 `gateway`
- `gateway` 不直接访问数据库
- `service-auth` 负责登录、注册、token 校验
- `service-care` 承载当前养老业务 CRUD

更多说明见：

- [YiYang_Node/README.md](../YiYang_Node/README.md)
- [YiYang_Vue/README.md](../YiYang_Vue/README.md)
