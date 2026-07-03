# C 组：膳食与服务模块熟悉指南

## 你负责什么

C 组负责客户的膳食和服务信息：

- 膳食方案
- 每周伙食菜单
- 服务对象
- 服务关注

这部分的核心是：围绕客户记录个性化服务信息，不负责客户入住状态流转。

## 最快熟悉顺序

1. 先看客户路由：
   - `YiYang_Vue/src/app/router/modules/customer.routes.ts`
2. 再看四个页面：
   - `YiYang_Vue/src/modules/customer/meal/pages/MealPage.vue`
   - `YiYang_Vue/src/modules/customer/meal-calendar/pages/MealCalendarPage.vue`
   - `YiYang_Vue/src/modules/customer/service-target/pages/ServiceTargetPage.vue`
   - `YiYang_Vue/src/modules/customer/service-focus/pages/ServiceFocusPage.vue`
3. 再看前端 API：
   - `YiYang_Vue/src/modules/customer/meal/api/meal.api.ts`
   - `YiYang_Vue/src/modules/customer/meal-calendar/api/meal-calendar.api.ts`
   - `YiYang_Vue/src/modules/customer/service-target/api/service-target.api.ts`
   - `YiYang_Vue/src/modules/customer/service-focus/api/service-focus.api.ts`
4. 最后看后端：
   - `YiYang_Node/src/apps/gateway/http/customer.controller.ts`
   - `YiYang_Node/src/apps/gateway/services/gateway-service-client.ts`
   - `YiYang_Node/src/libs/registry/local-registry.service.ts`
   - `YiYang_Node/src/modules/customer/customer.controller.ts`
   - `YiYang_Node/src/modules/customer/customer.service.ts`

## 数据怎么走

以“新增膳食方案”为例：

1. 用户在 `MealPage.vue` 选择客户，填写方案名称、忌口、过敏原、营养标签等。
2. 页面调用 `createMealPlan()`。
3. 前端请求 `/api/customer/meal-plans`。
4. 请求进入 gateway 的 `customer.controller.ts`。
5. gateway 通过 `GatewayServiceClient` 按 `CARE_SERVICE` 到本地注册中心发现 `service-care` 实例。
6. gateway 使用 Nest TCP 把消息转给 `service-care`。
7. 后端调用 `CustomerService.createMealPlan()`。
8. service 先用 `ensureResidentExists()` 确认客户存在。
9. 再用 Prisma 创建 `MealPlan`。
10. 返回数据，页面刷新列表。

简单记法：

```txt
膳食/服务页面 -> 对应 api.ts -> /api/customer/... -> gateway -> GatewayServiceClient -> LocalRegistryService -> service-care -> CustomerService -> Prisma -> MySQL
```

## 接口错误怎么返回

膳食与服务模块里，客户或健康管家不存在时，service 会抛出 `NotFoundException`；参数或业务状态不允许时，会抛出 `BadRequestException`。请求经过微服务时，`RpcExceptionsFilter` 会把错误状态码和错误信息传回 gateway，gateway 通过 `GatewayServiceClient` 内部的 `sendTcpMessage()` 还原成 HTTP 错误，最后统一返回：

```json
{
  "code": 400,
  "message": "错误原因",
  "path": "/api/customer/...",
  "timestamp": "..."
}
```

如果漏掉了业务提前校验，Prisma 的常见数据库异常也会兜底转换，比如唯一约束冲突会返回 400，记录不存在会返回 404。

## 主要接口

膳食方案：

- `GET /api/customer/meal-plans`
- `POST /api/customer/meal-plans`
- `PATCH /api/customer/meal-plans/:id`

每周菜单：

- `GET /api/customer/meal-calendars`
- `POST /api/customer/meal-calendars`
- `PATCH /api/customer/meal-calendars/:id`

服务对象：

- `GET /api/customer/service-targets`
- `POST /api/customer/service-targets`
- `PATCH /api/customer/service-targets/:id`

服务关注：

- `GET /api/customer/service-focuses`
- `POST /api/customer/service-focuses`
- `PATCH /api/customer/service-focuses/:id`

合计 12 个接口。

## 用了什么方法

前端主要方法：

- `getMealPlans()` / `createMealPlan()` / `updateMealPlan()`
- `getMealCalendars()` / `createMealCalendar()` / `updateMealCalendar()`
- `getServiceTargets()` / `createServiceTarget()` / `updateServiceTarget()`
- `getServiceFocuses()` / `createServiceFocus()` / `updateServiceFocus()`

后端主要方法：

- `listMealPlans()` / `createMealPlan()` / `updateMealPlan()`
- `listMealCalendars()` / `createMealCalendar()` / `updateMealCalendar()`
- `listServiceTargets()` / `createServiceTarget()` / `updateServiceTarget()`
- `listServiceFocuses()` / `createServiceFocus()` / `updateServiceFocus()`
- `ensureResidentExists()`：确认客户存在
- `ensureManagerExists()`：确认健康管家用户存在

## 数据库重点

重点看这些表：

- `MealPlan`：客户个性化膳食方案
- `MealCalendar`：每周伙食菜单
- `ServiceTarget`：客户和健康管家的绑定关系
- `ServiceFocus`：客户购买或关注的服务信息
- `Resident`：客户主档
- `User`：健康管家/员工

关系要懂：

- `MealPlan.residentId` 指向客户。
- `ServiceTarget.residentId` 指向客户。
- `ServiceTarget.managerUserId` 可以指向员工。
- `ServiceFocus.residentId` 指向客户。
- `MealCalendar` 是周菜单，不一定绑定单个客户。

## 你答辩时可以这样说

我负责膳食与服务模块。膳食方案是针对单个客户的个性化方案，每周菜单是养老中心统一展示的周菜单。服务对象用于维护客户和健康管家的关系，服务关注用于记录客户购买或使用的服务。前端通过各自的 `api.ts` 调用 `/api/customer/...` 接口，请求先进入 gateway，gateway 通过注册中心发现 `service-care` 后转发到 `CustomerService`。后端先校验客户或健康管家是否存在，再用 Prisma 对对应表进行查询、新增和修改。
