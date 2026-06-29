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
   - `YiYang_Node/src/modules/customer/customer.controller.ts`
   - `YiYang_Node/src/modules/customer/customer.service.ts`

## 数据怎么走

以“新增膳食方案”为例：

1. 用户在 `MealPage.vue` 选择客户，填写方案名称、忌口、过敏原、营养标签等。
2. 页面调用 `createMealPlan()`。
3. 前端请求 `/api/customer/meal-plans`。
4. 请求进入 gateway 的 `customer.controller.ts`。
5. gateway 转给 customer 服务。
6. 后端调用 `CustomerService.createMealPlan()`。
7. service 先用 `ensureResidentExists()` 确认客户存在。
8. 再用 Prisma 创建 `MealPlan`。
9. 返回数据，页面刷新列表。

简单记法：

```txt
膳食/服务页面 -> 对应 api.ts -> /api/customer/... -> gateway -> CustomerService -> Prisma -> MySQL
```

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

我负责膳食与服务模块。膳食方案是针对单个客户的个性化方案，每周菜单是养老中心统一展示的周菜单。服务对象用于维护客户和健康管家的关系，服务关注用于记录客户购买或使用的服务。前端通过各自的 `api.ts` 调用 `/api/customer/...` 接口，后端在 `CustomerService` 中先校验客户或健康管家是否存在，再用 Prisma 对对应表进行查询、新增和修改。
