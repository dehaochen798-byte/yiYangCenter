# YiYang Node 学习与开发说明

这个目录是东软颐养中心项目的后端，技术栈是：

- `NestJS`
- `Prisma`
- `MySQL`
- `TypeScript`

这份文档不是只告诉你“怎么跑”，而是希望你能一边看代码、一边理解后端项目是怎么组织起来的。

## 1. 先建立整体认识

你可以先把这个后端理解成一句话：

**NestJS 负责搭后端结构，Prisma 负责连数据库，MySQL 负责存数据。**

在这个项目里：

- 前端发请求给 NestJS
- NestJS 在 controller 里接收请求
- service 里写业务逻辑
- Prisma 负责把数据存进 MySQL

所以你学习时，脑子里先记住这条链路：

`前端 -> Controller -> Service -> Prisma -> MySQL`

## 2. 建议你先看哪些目录

### 应该重点看

- `src/`
- `prisma/`
- `.env`
- `package.json`
- `tsconfig.json`

### 先不用细看

- `dist/`
- `node_modules/`

原因：

- `dist/` 是编译后的产物，不是你平时手写的源码
- `node_modules/` 是依赖包源码，初学阶段不用进去研究

## 3. 目录结构解释

```txt
YiYang_Node
├─ prisma/                 # Prisma 数据库模型、迁移、种子脚本
├─ src/                    # 后端核心源码
│  ├─ common/              # 公共层
│  ├─ config/              # 配置层
│  ├─ modules/             # 业务模块
│  └─ prisma/              # PrismaService 封装
├─ .env                    # 本地运行环境变量
├─ package.json            # 依赖和脚本
├─ tsconfig.json           # TypeScript 配置
└─ README.md               # 当前这份说明
```

## 4. 根目录每个关键文件是干嘛的

### `package.json`

这个文件主要做两件事：

1. 声明项目依赖
2. 定义项目命令

你现在最常用的是这些：

```bash
npm run start:dev
npm run build
npm run prisma:generate
npm run prisma:migrate:dev
npm run lint
```

你可以把它理解成：

- `start:dev`：启动开发服务器
- `build`：检查代码是否能编译通过
- `prisma:generate`：根据 schema 生成 Prisma Client
- `prisma:migrate:dev`：把数据库模型真正同步成表
- `lint`：检查代码规范

### `.env`

这里放运行环境变量。

当前最重要的是：

```env
DATABASE_URL="mysql://root:1111@localhost:3306/yiyang_center"
```

它的作用是告诉 Prisma：

- 数据库类型是 MySQL
- 用户名是 `root`
- 密码是 `1111`
- 连接本机 `3306`
- 使用库 `yiyang_center`

### `prisma.config.ts`

这是 Prisma 7 新增的重要配置入口。

你可以把它理解成：

**Prisma CLI 自己的运行配置文件。**

它现在主要负责：

- 告诉 Prisma schema 在哪里
- 告诉 Prisma 从哪里读取数据库连接地址

从 Prisma 7 开始，数据库 URL 不再只靠 `schema.prisma` 里的 `datasource url = env(...)` 来驱动，
而是更推荐在 `prisma.config.ts` 中集中声明。

### `tsconfig.json`

这是 TypeScript 配置文件。

你现在不用一下子把所有选项都记住，先重点理解几项：

- `module: "commonjs"`：当前后端输出为 CommonJS 模块
- `target: "es2021"`：编译目标 JS 版本
- `strict: true`：开启严格类型检查
- `outDir: "./dist"`：编译结果输出到 `dist`

### `nest-cli.json`

Nest CLI 的配置文件。

现在最关键的是：

- `sourceRoot: "src"`  

表示 Nest 主要从 `src` 目录找源码。

### `eslint.config.mjs`

这个文件负责代码规范。

它会检查：

- TypeScript 写法是否合理
- 有没有未使用变量
- 是否符合当前项目的规范

### `prettier.config.mjs`

负责代码格式化。

比如：

- 单引号
- 不加分号
- 每行长度

## 5. `src` 目录怎么理解

`src` 是整个后端最核心的地方。

### `src/main.ts`

这是程序入口。

可以把它理解成：

**后端项目从这里启动。**

它现在主要做了这些事：

- 创建 Nest 应用
- 统一加上 `/api` 前缀
- 开启跨域
- 注册全局参数校验
- 注册全局异常处理
- 启动服务端口

如果你想知道“项目到底从哪里开始跑”，先看它。

### `src/app.module.ts`

这是根模块。

可以理解成：

**整个后端模块的总装配中心。**

它把这些模块组装起来：

- `AuthModule`
- `DashboardModule`
- `CustomerModule`
- `NursingModule`
- `SystemModule`
- `PrismaModule`

当你以后新增模块，比如 `bill`、`assessment`，通常也要在这里注册。

### `src/app.controller.ts`

这是应用级控制器。

当前主要提供：

- `/health`

它常用于健康检查，确认服务是不是活着。

### `src/app.service.ts`

这是应用级 service。

当前逻辑比较少，主要就是给健康检查返回状态。

## 6. `src/config` 是干嘛的

### `src/config/app.config.ts`

这个文件专门负责把环境变量整理成配置对象。

比如：

- 端口
- JWT 密钥
- JWT 过期时间
- 数据库连接地址

为什么要这么做？

因为直接在代码里到处写 `process.env.xxx` 会很乱。  
集中管理更清晰。

## 7. `src/common` 是干嘛的

这里放的是“公共能力”，也就是很多模块都可能复用的东西。

### 目前已有的内容

#### `src/common/filters/all-exceptions.filter.ts`

全局异常过滤器。

作用：

- 捕获异常
- 统一返回错误结构

你可以把它理解成：

**后端出错时，不让错误格式乱七八糟。**

#### `src/common/enums/gender.enum.ts`

性别枚举。

作用：

- 让 `gender` 字段只能是固定值
- 比直接写字符串更安全

#### `src/common/dto/api-response.dto.ts`

这是通用响应 DTO 的雏形。

当前还没有大规模接入，但后面如果你想统一所有接口返回结构，可以继续扩展它。

### 这些空目录为什么先建了

你会看到：

- `decorators/`
- `guards/`
- `interceptors/`
- `pipes/`

现在里面可能还没代码，但提前建好是为了以后扩展时不乱。

比如以后你很可能会加：

- 登录守卫
- 自定义装饰器
- 响应拦截器
- 自定义参数管道

## 8. `src/prisma` 是干嘛的

### `src/prisma/prisma.module.ts`

把 PrismaService 注册成全局模块。

这样其他模块里都能直接注入 PrismaService。

### `src/prisma/prisma.service.ts`

这是对 PrismaClient 的一层封装。

作用：

- 统一连接数据库
- 让 Nest 的依赖注入系统能管理 Prisma
- 适配 Prisma 7 的 MariaDB/MySQL driver adapter

以后 service 里操作数据库，基本就是通过它。

## 9. `src/modules` 是最重要的业务层

这里是按业务拆分的，和你前端结构保持一致。

当前有：

- `auth`
- `dashboard`
- `customer`
- `nursing`
- `system`

### 为什么要按模块拆

因为业务系统会越来越大。

如果所有 controller、service、dto 都堆在一起，后面会非常难维护。  
按模块拆之后，每个模块都能独立演进。

## 10. 以 `auth` 模块为例，理解 Nest 的基本结构

`src/modules/auth/` 是你现在最值得学习的地方。

里面主要有：

- `auth.module.ts`
- `auth.controller.ts`
- `auth.service.ts`
- `dto/login.dto.ts`
- `dto/register.dto.ts`

### `auth.module.ts`

负责把认证模块组装起来。

你可以理解成：

**这是 auth 模块自己的总入口。**

### `auth.controller.ts`

负责接收前端请求。

当前提供接口：

- `POST /api/auth/register`
- `POST /api/auth/login`

所以 controller 的职责是：

- 定义路由
- 接收参数
- 调用 service

### `auth.service.ts`

负责真正的业务逻辑。

比如：

- 注册前查重
- 密码加密
- 登录时比对密码
- 生成 JWT token

所以 service 的职责是：

**写业务，不直接面向 HTTP。**

### `dto/login.dto.ts`

DTO = Data Transfer Object

你可以理解成：

**请求参数的数据结构定义。**

它会约束登录接口必须传：

- `mobile`
- `password`

而且会配合 `class-validator` 做校验。

### `dto/register.dto.ts`

负责注册参数校验。

当前会校验：

- 手机号
- 密码
- 真实姓名
- 年龄
- 性别

## 11. `customer / nursing / dashboard / system` 目前是什么状态

### `dashboard`

当前提供一个简单的统计接口骨架。

主要作用：

- 给你看一个“工作台模块”大概怎么写

### `customer`

现在是客户管理总模块骨架。

已经先对齐了前端子模块目录：

- `bed`
- `meal`
- `meal-calendar`
- `check-in`
- `check-out`
- `outing`
- `service-focus`
- `service-target`
- `user`

当前这些子目录还没真正展开 controller/service，主要是先占业务位置。

### `nursing`

和前端一样，先按三块拆了：

- `care-level`
- `care-item`
- `care-record`

当前同样是模块骨架优先。

### `system`

提供一个最简单的 `ping` 接口，用于占位和测试。

## 12. `prisma` 目录怎么学

这个目录非常关键。

### `prisma/schema.prisma`

这是数据库模型定义文件。

你可以理解成：

**这是后端的数据世界总设计图。**

它描述了：

- 有哪些表
- 每张表有哪些字段
- 表和表之间怎么关联

你现在这版已经升级到 Prisma 7，所以这里还有两个值得注意的点：

- `generator client` 使用的是 `provider = "prisma-client"`
- client 会生成到 `generated/prisma/`

这和 Prisma 6 时代默认生成到 `node_modules/@prisma/client` 的体验不一样。
也正因为这样，后端代码里现在是从：

`generated/prisma/client`

导入 Prisma Client。

### 你现在应该重点看哪些模型

建议先按这个顺序看：

1. `User`
2. `Resident`
3. `Room`
4. `Bed`
5. `CheckIn`
6. `CareLevel`
7. `CareItem`
8. `CareRecord`

因为这些最贴近你当前前端需求。

### Prisma 模型和 MySQL 表的关系

例如：

```prisma
model User {
  id       Int    @id @default(autoincrement())
  mobile   String @unique
  realName String
}
```

大致就会映射成 MySQL 里的 `user` 表。

### `prisma/migrations/`

这里放的是数据库迁移记录。

你执行：

```bash
npm run prisma:migrate:dev
```

后，Prisma 会把 schema 的变化转换成 SQL，并记录在这里。

这意味着：

- schema 改了
- migration 会记录改动历史
- 数据库可以按迁移历史逐步演进

### `prisma/seed.ts`

种子脚本。

通常用来初始化一些基础数据，比如：

- 默认管理员
- 初始房间
- 初始床位
- 护理级别字典

## 13. 你现在这套后端架构适合怎么学

我建议你按这条顺序学，不要一上来把所有内容都看完：

### 第一阶段：理解 Nest 的运行结构

先看：

1. `src/main.ts`
2. `src/app.module.ts`
3. `src/app.controller.ts`
4. `src/app.service.ts`

目标：

搞懂“项目从哪里启动、模块怎么装配、接口从哪里进来”。

### 第二阶段：理解一个完整模块

再看：

1. `src/modules/auth/auth.module.ts`
2. `src/modules/auth/auth.controller.ts`
3. `src/modules/auth/auth.service.ts`
4. `src/modules/auth/dto/*.ts`

目标：

搞懂“controller、service、dto 各自负责什么”。

### 第三阶段：理解数据库层

再看：

1. `src/prisma/prisma.service.ts`
2. `prisma/schema.prisma`
3. `prisma/migrations/`

目标：

搞懂“代码是怎么映射到数据库表的”。

### 第四阶段：开始自己写业务模块

推荐从这两个开始：

1. `床位管理`
2. `入住登记`

因为它们最能帮你把：

- controller
- service
- Prisma
- 数据表关系

串成一条完整链路。

## 14. 现在你自己写代码时，推荐遵守的习惯

### 新增模块时

尽量保持这套结构：

```txt
src/modules/xxx
├─ xxx.module.ts
├─ xxx.controller.ts
├─ xxx.service.ts
└─ dto/
```

### 写接口时

优先遵循这个思路：

1. 先写 DTO
2. 再写 Controller 路由
3. 再写 Service 业务逻辑
4. 最后接 Prisma

### 改数据库结构时

顺序通常是：

1. 改 `prisma/schema.prisma`
2. 执行 `npm run prisma:migrate:dev`
3. 再写 service 中的数据库操作

## 15. 你接下来最适合做什么

如果你想边学边写，我建议你下一步按这个顺序：

1. 先跑通 `auth/register`
2. 再跑通 `auth/login`
3. 再对接前端登录注册页
4. 再做 `room + bed` 的增删改查
5. 再做 `check-in`

这样你会同时学到：

- Nest 模块化
- DTO 参数校验
- Prisma 查询写法
- MySQL 表结构设计
- 前后端联调

## 16. 你以后有疑惑时，可以先问自己这几个问题

### 一个请求是从哪里进来的

先找 `controller`

### 业务逻辑写在哪里

先找 `service`

### 请求参数怎么校验

先找 `dto`

### 数据库操作写在哪里

先找 `PrismaService` 被注入到哪个 service 里

### 一张表怎么来的

先看 `prisma/schema.prisma`

## 17. 一句话总结整个后端

这个后端现在已经具备了一个标准业务系统的学习骨架：

- `NestJS` 负责模块和接口
- `Service` 负责业务逻辑
- `Prisma` 负责数据访问
- `MySQL` 负责存储
- `Prisma schema` 负责定义数据结构

你后面每做一个功能，都可以按这条线去写：

`DTO -> Controller -> Service -> Prisma -> MySQL`

如果你愿意，下一步我可以继续给你补第二份文档：

**“从登录注册开始，手把手讲一个 NestJS 模块是怎么写出来的”**。  
那份会更偏实战学习路线。
