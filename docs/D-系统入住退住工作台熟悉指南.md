# D 组：系统基础、入住退住、工作台熟悉指南

## 你负责什么

D 组负责三块内容：

- 登录注册和权限基础
- 工作台统计
- 入住登记、退住登记

这一组最核心的业务链路是：

```txt
登录后进入工作台
  -> 根据角色显示不同菜单和快捷入口
  -> 前台/管理员办理入住退住
  -> 入住占床，退住释放床位
```

## 最新代码先记住

这一版系统基础已经接入 RBAC，前后端都做了权限控制：

- 路由守卫会校验登录状态和角色，不符合权限直接进 `/403`
- 工作台所有角色可见
- 入住登记、退住登记只允许管理员和前台人员进入
- 登录后访问 `/auth/login` 或 `/auth/register` 会被重定向到 `/dashboard`

## 最快熟悉顺序

1. 先看登录和路由守卫：
   - `YiYang_Vue/src/modules/auth/pages/LoginPage.vue`
   - `YiYang_Vue/src/modules/auth/pages/RegisterPage.vue`
   - `YiYang_Vue/src/app/guards/authGuard.ts`
   - `YiYang_Vue/src/modules/auth/store/auth.store.ts`
2. 再看布局和菜单：
   - `YiYang_Vue/src/layouts/MainLayout.vue`
3. 再看工作台：
   - `YiYang_Vue/src/modules/dashboard/pages/DashboardPage.vue`
   - `YiYang_Vue/src/modules/dashboard/api/dashboard.api.ts`
4. 再看入住退住页面：
   - `YiYang_Vue/src/modules/customer/check-in/pages/CheckInPage.vue`
   - `YiYang_Vue/src/modules/customer/check-out/pages/CheckOutPage.vue`
5. 再看后端：
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
3. 前端请求 `POST /api/auth/login`。
4. gateway 的 `auth.controller.ts` 接收请求。
5. gateway 通过 `GatewayServiceClient` 按 `AUTH_SERVICE` 发现 `service-auth`。
6. gateway 使用 Nest TCP 把消息转给认证服务。
7. `AuthService.login()` 根据手机号查询用户并校验密码。
8. 校验成功后生成 JWT token。
9. 后端同时返回 `profile`，其中包含 `roleName` 和 `roleKey`。
10. 前端调用 `authStore.setAuth()` 保存 token 和用户资料。
11. 路由守卫 `authGuard.ts` 后续根据 `isLoggedIn` 和 `roles` 判断是否允许访问页面。

## 注册数据怎么走

注册流程仍然保留：

1. 用户在 `RegisterPage.vue` 填写手机号、姓名、年龄、性别和密码。
2. 页面调用 `registerApi()`。
3. 前端请求 `POST /api/auth/register`。
4. gateway 转发到 `AuthService.register()`。
5. 后端先校验手机号是否已注册。
6. 再把密码哈希后写入 `User` 表。
7. 返回“注册成功”，用户再回到登录页登录。

## 路由守卫怎么工作

前端守卫逻辑是：

1. 访问需要登录的页面时，如果 `authStore.isLoggedIn === false`，强制跳转 `/auth/login`。
2. 会把原目标地址放到 `redirect` 参数里，登录成功后再跳回原页面。
3. 已登录用户如果访问 `/auth/login` 或 `/auth/register`，直接跳转 `/dashboard`。
4. 对需要角色的页面，会读取路由 `meta.roles`。
5. 如果当前 `profile.roleKey` 不在允许范围内，跳转 `/403`。

这说明当前系统不是“只隐藏菜单”，而是真正做了路由级准入控制。

## 工作台数据怎么走

以“加载工作台”为例：

1. 用户进入 `/dashboard`。
2. 页面调用 `getDashboardSummary()`。
3. 前端请求 `GET /api/dashboard/summary`。
4. gateway 的 `dashboard.controller.ts` 先校验用户已登录且有工作台访问权限。
5. gateway 把请求转发到 `service-care`。
6. `DashboardService.getSummary()` 并行统计多张业务表。
7. 后端返回：
   - 客户总数、在住数、待入住数、已退住数
   - 空床数、占床数、停用床数
   - 今日护理记录数
   - 外出中人数
   - 进行中服务数
   - 最近入住、最近外出、最近护理记录
   - 护理级别分布、房间占用概览
8. 前端把这些数据渲染成卡片、图表、时间线和快捷入口。

## 入住数据怎么走

以“办理入住”为例：

1. 用户在 `CheckInPage.vue` 选择客户、空床、入住时间和备注。
2. 页面调用 `createCheckIn()`。
3. 前端请求 `POST /api/customer/check-ins`。
4. gateway 先校验角色必须是管理员或前台人员。
5. gateway 通过注册中心发现 `service-care`。
6. 后端调用 `CustomerService.createCheckIn()`。
7. service 先确认客户和床位存在。
8. 如果客户已经有当前床位，直接报错。
9. 如果床位不是空床，直接报错。
10. 通过后开启 Prisma 事务 `$transaction`。
11. 创建 `CheckIn` 入住记录。
12. 更新 `Resident.status = ACTIVE`。
13. 更新 `Resident.currentBedId = bed.id`。
14. 更新 `Bed.status = OCCUPIED`。
15. 返回入住记录，页面刷新列表。

## 退住数据怎么走

以“办理退住”为例：

1. 用户在 `CheckOutPage.vue` 选择当前在住客户，填写退住时间、原因和交接说明。
2. 页面调用 `createCheckOut()`。
3. 前端请求 `POST /api/customer/check-outs`。
4. gateway 校验角色必须是管理员或前台人员。
5. 请求转发到 `service-care`。
6. `CustomerService.createCheckOut()` 先确认客户存在。
7. 如果客户没有当前床位，说明未入住，直接报错。
8. 通过后开启 Prisma 事务 `$transaction`。
9. 创建 `CheckOut` 退住记录。
10. 更新 `Resident.status = CHECKED_OUT`。
11. 清空 `Resident.currentBedId`。
12. 更新 `Bed.status = VACANT`。
13. 返回退住记录，页面刷新列表。

简单记法：

```txt
入住：创建入住记录 + 客户改为在住 + 床位改为占床
退住：创建退住记录 + 客户改为退住 + 床位改为空床
```

## 接口错误怎么返回

登录、工作台、入住、退住常见错误来源：

- 手机号或密码错误
- 未登录访问后台页面
- 角色不匹配
- 客户不存在
- 床位不存在
- 床位不可分配
- 客户未入住却办理退住

后端一般抛：

- `UnauthorizedException`
- `ForbiddenException`
- `BadRequestException`
- `NotFoundException`

最终前端会收到统一格式，例如：

```json
{
  "code": 400,
  "message": "当前床位不可分配",
  "path": "/api/customer/check-ins",
  "timestamp": "..."
}
```

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

- `GET /api/customer/overview`
- `GET /api/health`
- `GET /api/system/ping`

严格算核心业务接口是 7 个，加上辅助接口后约 10 个。

## 前后端主要方法

前端主要方法：

- `loginApi()`：登录
- `registerApi()`：注册
- `getDashboardSummary()`：获取工作台数据
- `getCheckIns()` / `createCheckIn()`
- `getCheckOuts()` / `createCheckOut()`

后端主要方法：

- `AuthService.login()`：登录并生成 token
- `AuthService.register()`：注册用户
- `DashboardService.getSummary()`：聚合工作台统计
- `CustomerService.listCheckIns()` / `createCheckIn()`
- `CustomerService.listCheckOuts()` / `createCheckOut()`

## 数据库重点

认证相关：

- `User`：账号、密码哈希、岗位

工作台相关：

- `Resident`：客户状态统计
- `Bed`：床位资源统计
- `CareRecord`：今日护理统计
- `Outing`：外出统计
- `ServiceFocus`：进行中服务统计
- `CheckIn`：最近入住

入住退住相关：

- `CheckIn`：入住历史
- `CheckOut`：退住历史
- `Resident.currentBedId`：当前床位
- `Resident.status`：客户状态
- `Bed.status`：床位状态

## 你答辩时可以这样说

我负责系统基础、工作台和入住退住。登录注册通过 auth 模块完成，登录成功后后端返回 token 和带 `roleKey` 的用户资料，前端存入 `authStore`，路由守卫再根据登录状态和路由 `meta.roles` 控制页面访问，无权访问会跳到 `403`。工作台通过 `DashboardService.getSummary()` 聚合客户、床位、护理、外出和服务数据，前端渲染成卡片、图表和时间线。入住和退住是典型的状态流转场景，后端使用 Prisma 的 `$transaction` 保证“记录创建 + 客户状态变更 + 床位状态变更”要么一起成功，要么一起失败，避免出现客户已入住但床位没占用，或者客户已退住但床位没释放的问题。
