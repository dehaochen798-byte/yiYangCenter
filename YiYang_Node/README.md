# YiYang Node

东软颐养中心后端项目，基于 `NestJS + Prisma + MySQL`。

## 技术选型

- `NestJS`：模块化后端框架
- `Prisma`：数据库 ORM 与类型安全查询
- `MySQL`：业务数据库
- `JWT`：登录认证
- `class-validator`：请求参数校验

## 架构建议

当前采用的是适合中后台业务系统的 `模块化单体` 架构：

- `src/modules/auth`：注册、登录、身份认证
- `src/modules/customer`：客户管理及其子域
- `src/modules/nursing`：护理相关业务
- `src/prisma`：PrismaService 与数据库访问基础设施
- `src/common`：全局过滤器、通用 DTO、枚举和守卫

这套结构适合你当前前端的模块拆分，后续如果业务继续变大，也可以在不拆微服务的前提下逐步细化领域边界。

## 环境准备

1. 安装 MySQL
2. 创建数据库：

```sql
CREATE DATABASE yiyang_center DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. 复制 `.env.example` 为 `.env`

默认数据库连接：

```env
DATABASE_URL="mysql://root:1111@localhost:3306/yiyang_center"
```

## 常用命令

```bash
npm install
npm run prisma:generate
npm run prisma:migrate:dev
npm run start:dev
```

## 当前领域模型

首版 Prisma schema 已覆盖：

- 用户注册 / 登录
- 客户档案
- 房间与床位
- 膳食方案与每周菜单
- 入住 / 退住 / 外出登记
- 服务对象与服务关注
- 护理级别 / 护理内容 / 护理记录

后续可以继续扩展：

- 权限角色
- 健康管家
- 费用账单
- 健康评估
- 运营统计
