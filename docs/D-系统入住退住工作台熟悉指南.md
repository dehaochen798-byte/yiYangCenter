# D 组：系统基础、入住退住、工作台熟悉指南

## 你负责什么

D 组负责三块内容：

- 登录注册和权限基础
- 工作台统计
- 入住登记、退住登记

入住登记、退住登记原来属于 A 组，现在分给 D 组。D 组要重点理解“入住会占床，退住会释放床位”。

## 最快熟悉顺序

1. 先看登录和布局入口：
   - `YiYang_Vue/src/modules/auth/pages/LoginPage.vue`
   - `YiYang_Vue/src/modules/auth/pages/RegisterPage.vue`
   - `YiYang_Vue/src/app/guards/authGuard.ts`
   - `YiYang_Vue/src/layouts/MainLayout.vue`
2. 再看工作台：
   - `YiYang_Vue/src/modules/dashboard/pages/DashboardPage.vue`
   - `YiYang_Vue/src/modules/dashboard/api/dashboard.api.ts`
3. 再看入住退住页面：
   - `YiYang_Vue/src/modules/customer/check-in/pages/CheckInPage.vue`
   - `YiYang_Vue/src/modules/customer/check-out/pages/CheckOutPage.vue`
4. 再看入住退住 API：
   - `YiYang_Vue/src/modules/customer/check-in/api/check-in.api.ts`
   - `YiYang_Vue/src/modules/customer/check-out/api/check-out.api.ts`
5. 最后看后端：
   - `YiYang_Node/src/apps/gateway/http/auth.controller.ts`
   - `YiYang_Node/src/apps/gateway/http/dashboard.controller.ts`
   - `YiYang_Node/src/apps/gateway/http/customer.controller.ts`
   - `YiYang_Node/src/apps/gateway/services/gateway-service-client.ts`
   - `YiYang_Node/src/libs/registry/local-registry.service.ts`
   - `YiYang_Node/src/modules/auth/auth.service.ts`
   - `YiYang_Node/src/modules/dashboard/dashboard.service.ts`
   - `YiYang_Node/src/modules/customer/customer.service.ts`

## 登录数据怎么走

以“登录”为例：

1. 用户在 `LoginPage.vue` 输入手机号和密码。
2. 页面调用 `loginApi()`。
3. 前端请求 `/api/auth/login`。
4. gateway 的 `auth.controller.ts` 接收请求。
5. gateway 通过 `GatewayServiceClient` 按 `AUTH_SERVICE` 到本地注册中心发现 `service-auth` 实例。
6. gateway 使用 Nest TCP 把消息转到 auth 服务。
7. `AuthService` 校验手机号和密码。
8. 校验成功后生成 JWT token。
9. 前端保存 token，后续请求带上 token。
10. 路由守卫 `authGuard.ts` 根据登录状态控制能不能进入后台页面。

## 入住数据怎么走

以“办理入住”为例：

1. 用户在 `CheckInPage.vue` 选择客户、空床和入住时间。
2. 页面调用 `createCheckIn()`。
3. 前端请求 `/api/customer/check-ins`。
4. 请求进入 gateway 的 `customer.controller.ts`。
5. gateway 通过 `GatewayServiceClient` 按 `CARE_SERVICE` 到本地注册中心发现 `service-care` 实例。
6. gateway 使用 Nest TCP 把消息转给 `service-care`。
7. 后端调用 `CustomerService.createCheckIn()`。
8. service 先查客户和床位是否存在。
9. 如果客户已经有床位，报错。
10. 如果床位不是空床，报错。
11. 通过后开启 Prisma 事务 `$transaction`。
12. 创建 `CheckIn` 入住记录。
13. 更新 `Resident.status = ACTIVE`，并写入 `Resident.currentBedId`。
14. 更新 `Bed.status = OCCUPIED`。
15. 返回入住记录，页面刷新列表。

## 退住数据怎么走

以“办理退住”为例：

1. 用户在 `CheckOutPage.vue` 选择当前在住客户，填写退住时间和原因。
2. 页面调用 `createCheckOut()`。
3. 前端请求 `/api/customer/check-outs`。
4. 请求进入 gateway，gateway 通过注册中心发现 `service-care`。
5. 后端调用 `CustomerService.createCheckOut()`。
6. service 先确认客户存在。
7. 如果客户没有当前床位，说明未入住，直接报错。
8. 通过后开启 Prisma 事务 `$transaction`。
9. 创建 `CheckOut` 退住记录。
10. 更新 `Resident.status = CHECKED_OUT`，并清空 `Resident.currentBedId`。
11. 更新 `Bed.status = VACANT`。
12. 返回退住记录，页面刷新列表。

简单记法：

```txt
入住：创建入住记录 + 客户变在住 + 床位变占用
退住：创建退住记录 + 客户变退住 + 床位变空床
```

## 接口错误怎么返回

登录、入住、退住等接口出现业务错误时，service 会抛出 `BadRequestException`、`UnauthorizedException` 或 `NotFoundException`。请求经过微服务时，`RpcExceptionsFilter` 会把错误状态码和错误信息传回 gateway，gateway 通过 `GatewayServiceClient` 内部的 `sendTcpMessage()` 还原成 HTTP 错误，最后统一返回：

```json
{
  "code": 400,
  "message": "错误原因",
  "path": "/api/...",
  "timestamp": "..."
}
```

如果漏掉了业务提前校验，Prisma 的常见数据库异常也会兜底转换，比如唯一约束冲突会返回 400，记录不存在会返回 404。

## 主要接口

认证：

- `POST /api/auth/login`
- `POST /api/auth/register`

工作台：

- `GET /api/dashboard/summary`

入住：

- `GET /api/customer/check-ins`
- `POST /api/customer/check-ins`

退住：

- `GET /api/customer/check-outs`
- `POST /api/customer/check-outs`

辅助理解接口：

- `GET /api/health`
- `GET /api/system/ping`
- `GET /api/customer/overview`

严格算业务接口约 7 个，加上健康检查、系统 ping、客户概览后约 10 个。

## 用了什么方法

前端主要方法：

- `loginApi()`：登录
- `registerApi()`：注册
- `getDashboardSummary()`：获取工作台数据
- `getCheckIns()`：查询入住记录
- `createCheckIn()`：办理入住
- `getCheckOuts()`：查询退住记录
- `createCheckOut()`：办理退住

后端主要方法：

- `AuthService.login()`：登录校验并生成 token
- `AuthService.register()`：注册用户
- `DashboardService.getSummary()`：统计客户、床位、护理、外出等数据
- `CustomerService.listCheckIns()`：查询入住记录
- `CustomerService.createCheckIn()`：办理入住
- `CustomerService.listCheckOuts()`：查询退住记录
- `CustomerService.createCheckOut()`：办理退住

## 数据库重点

登录相关：

- `User`：用户账号和密码哈希

工作台相关：

- `Resident`：客户数量和状态统计
- `Bed`：空床、占床、停用床统计
- `CareRecord`：今日护理记录统计
- `Outing`：当前外出统计
- `ServiceFocus`：服务关注统计

入住退住相关：

- `CheckIn`：入住历史记录
- `CheckOut`：退住历史记录
- `Resident.currentBedId`：客户当前占用床位
- `Resident.status`：客户状态
- `Bed.status`：床位状态

## 你答辩时可以这样说

我负责系统基础、工作台和入住退住。登录注册通过 auth 模块完成，请求进入 gateway 后会通过注册中心发现 `service-auth`；工作台和入住退住会通过注册中心发现 `service-care`。登录成功后返回 token，前端路由守卫根据 token 控制页面访问。工作台通过 `DashboardService.getSummary()` 聚合客户、床位、护理、外出和服务数据。入住和退住是状态流转最关键的部分，后端使用 Prisma 的 `$transaction` 保证记录创建、客户状态更新、床位状态更新同时成功或同时失败，避免出现客户入住了但床位没变、或者床位释放了但退住记录没写的情况。
