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

答辩版微服务治理：

```txt
YiYang_Vue
   |
   v
gateway 统一 HTTP 网关 (/api)
   |
   |-- 查询 LocalRegistryService
   |
   |-- AUTH_SERVICE -> service-auth
   |
   `-- CARE_SERVICE -> service-care

LocalEnvConfigCenter
   |
   |-- gateway 端口
   |-- 微服务 host / port / service name
   |-- database / jwt
   `-- 后续可替换为 Nacos / Consul 配置中心适配器
```

当前实现了注册中心和配置中心的本地适配版：

- `LocalEnvConfigCenter`：统一读取 `.env` / 环境变量，作为本地配置中心适配器。
- `LocalRegistryService`：服务启动时写入本地注册表文件，网关按服务名发现实例。
- `GatewayServiceClient`：网关不再硬编码 TCP 客户端，而是通过注册中心解析服务实例后创建/复用客户端。

后续接入 Nacos、Consul、etcd 时，业务模块和 HTTP API 不需要调整，只需要替换 `src/libs/config-center` 与 `src/libs/registry` 的适配器实现。

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
|  |  |- config-center/    # 配置中心抽象与本地 .env 适配
|  |  |- contracts/        # 微服务消息契约
|  |  |- microservices/    # ClientProxy 工具
|  |  `- registry/         # 注册中心抽象与本地注册表适配
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
LOCAL_REGISTRY_FILE="" # 可选，默认写入系统临时目录
DATABASE_URL="mysql://root:1111@localhost:3306/yiyang_center"
JWT_SECRET="replace-me"
JWT_EXPIRES_IN="7d"
```

## 常用命令

### 运行

推荐一键启动三个后端入口：

```bash
npm run dev:node
```

也可以分别启动，建议顺序为：

```bash
npm run start:service-auth:dev
npm run start:service-care:dev
npm run start:gateway:dev
```

启动后 `service-auth`、`service-care` 会登记服务实例，`gateway` 会通过服务名发现并转发请求。

如果你在仓库根目录并希望同时启动前后端：

```bash
npm run dev
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
- `npm test` 通过
- 生成器命令可生成模块骨架

如果本地无法联通，优先检查：

- `MySQL` 是否已启动
- `.env` 中端口是否被占用
- `DATABASE_URL` 是否正确
- `gateway / service-auth / service-care` 是否都已启动
- 本地注册表文件是否被异常占用；可以删除 `LOCAL_REGISTRY_FILE` 指向的文件后重启服务
