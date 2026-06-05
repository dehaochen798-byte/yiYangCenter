# YiYang Node

当前后端已经从单体入口整理为可扩展的分布式骨架，技术栈仍然是：

- `NestJS`
- `Prisma`
- `MySQL / MariaDB`
- `TypeScript`

## 架构说明

后端分为三个运行入口：

- `gateway`
  - 对外提供 HTTP API
  - 统一挂载 `/api`
  - 负责鉴权入口和请求转发
- `service-auth`
  - 负责登录、注册、token 校验
  - 通过 TCP 微服务协议提供能力
- `service-care`
  - 承载 `dashboard / customer / nursing`
  - 通过 TCP 微服务协议提供能力

当前通信方式：

- `gateway <-> service-auth`：Nest TCP
- `gateway <-> service-care`：Nest TCP

数据库访问规则：

- 仅 `service-auth`、`service-care` 使用 `PrismaService`
- `gateway` 不直接连接数据库

## 目录重点

```txt
YiYang_Node
|- prisma/                  # Prisma schema / migration / seed
|- src/
|  |- apps/
|  |  |- gateway/          # HTTP 入口
|  |  |- service-auth/     # 认证微服务
|  |  `- service-care/     # 养老业务微服务
|  |- libs/
|  |  |- config/           # 服务端口与运行配置
|  |  |- contracts/        # 微服务消息契约
|  |  `- microservices/    # ClientProxy 工具
|  |- modules/             # 业务模块
|  |- prisma/              # PrismaService
|  `- common/              # 通用过滤器、枚举等
|- tools/                  # 本地代码生成器
`- package.json
```

## 环境变量

复制环境变量模板：

```bash
cp .env.example .env
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

## 常用命令

### 运行

```bash
npm run start:gateway:dev
npm run start:service-auth:dev
npm run start:service-care:dev
```

如果你在仓库根目录，推荐直接执行：

```bash
npm run dev:node
```

### 构建

```bash
npm run build
```

### Prisma

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run db:seed
```

### 代码生成器

```bash
npm run generate:module -- --name resident-log --scope care --route resident-logs --fields title:string:required,age:number:optional,enabled:boolean:optional
```

默认生成位置：

- `src/modules/<scope>/<resource>/`
- `src/libs/contracts/generated/`

## 当前约定

- HTTP 入口只收敛在 `gateway`
- 微服务消息 pattern 放在 `src/libs/contracts`
- 新业务模块优先按 `scope/resource` 结构生成
- 数据库结构仍由 `prisma/schema.prisma` 人工维护，生成器不直接改 schema

## 验证

当前已经验证：

- `npm run build` 通过
- 生成器命令可生成模块骨架

如果本地无法联通，优先检查：

- `MySQL` 是否已启动
- `.env` 中端口是否被占用
- `DATABASE_URL` 是否正确
- `gateway / service-auth / service-care` 是否都已启动
