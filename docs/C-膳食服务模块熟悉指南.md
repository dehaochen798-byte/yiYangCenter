# C 组：膳食与服务模块熟悉指南

## 你负责什么

C 组负责客户的膳食与服务信息：

- 膳食方案
- 每周伙食菜单
- 服务对象分配
- 服务关注

这一组的核心特点是：

- 围绕客户维护个性化服务信息
- 不负责客户入住、退住、床位状态流转
- 同样已经接入五角色 RBAC

## 最新代码先记住

当前四个页面入口分别是：

- `YiYang_Vue/src/modules/customer/meal/pages/MealPage.vue`
- `YiYang_Vue/src/modules/customer/meal-calendar/pages/MealCalendarPage.vue`
- `YiYang_Vue/src/modules/customer/service-target/pages/ServiceTargetPage.vue`
- `YiYang_Vue/src/modules/customer/service-focus/pages/ServiceFocusPage.vue`

权限要先分清：

- 膳食方案、膳食日历
  - 管理员、膳食管理员可看可改
- 服务对象分配
  - 管理员、护理主管可看可改
- 服务关注
  - 管理员可新增、编辑
  - 护理人员只能看自己负责老人的服务关注信息

## 最快熟悉顺序

1. 先看路由和菜单：
   - `YiYang_Vue/src/app/router/modules/customer.routes.ts`
   - `YiYang_Vue/src/layouts/MainLayout.vue`
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

1. 用户在 `MealPage.vue` 选择客户，填写方案名称、忌口、过敏原、营养标签等信息。
2. 前端校验字段后调用 `createMealPlan()`。
3. 前端请求 `POST /api/customer/meal-plans`。
4. 请求进入 gateway 的 `customer.controller.ts`。
5. gateway 先校验登录态和角色，确认当前用户属于管理员或膳食管理员。
6. gateway 通过 `GatewayServiceClient` 按 `CARE_SERVICE` 发现 `service-care`。
7. gateway 使用 Nest TCP 把消息转给 `service-care`。
8. 后端调用 `CustomerService.createMealPlan()`。
9. service 先用 `ensureResidentExists()` 校验客户存在。
10. 再用 Prisma 写入 `MealPlan` 表。
11. 返回数据，页面提示成功并刷新列表。

简单记法：

```txt
膳食/服务页面 -> 对应 api.ts -> /api/customer/... -> gateway -> GatewayServiceClient -> service-care -> CustomerService -> Prisma -> MySQL
```

## 四块业务的关键点

### 1. 膳食方案

- 页面是 `MealPage.vue`。
- 方案是“针对单个客户”的个性化配置。
- 初始化会加载膳食方案列表和客户列表。
- 后端要求客户必须存在。
- 当前已支持删除方案。

### 2. 每周伙食菜单

- 页面是 `MealCalendarPage.vue`。
- 周菜单是“面向全院”的统一菜单，不绑定单个客户。
- 新增、编辑时主要维护周标签、起始日期和周一到周日菜单。
- 当前也支持删除周菜单。

### 3. 服务对象分配

- 页面是 `ServiceTargetPage.vue`。
- 用来建立客户与负责人员的绑定关系。
- 可选系统内员工，也支持手工录入负责人员姓名和电话。
- 后端会校验：
  - 客户存在
  - 若选择系统内负责人员，则该员工存在
- 这张关系表会被护理模块复用，用于确定“护理人员负责哪些老人”。

### 4. 服务关注

- 页面是 `ServiceFocusPage.vue`。
- 记录客户购买或正在享受的服务内容。
- 管理员可新增和编辑。
- 护理人员可以进入页面查看，但后端只返回自己负责老人的服务关注信息。
- 状态字段包括：
  - `ACTIVE`
  - `PAUSED`
  - `ENDED`

## 删除功能怎么走

这一版膳食模块已经补上删除能力：

### 删除膳食方案

1. 点击删除。
2. 前端弹确认框。
3. 调用 `DELETE /api/customer/meal-plans/:id`。
4. gateway 转发到 `CustomerService.deleteMealPlan()`。
5. 后端确认记录存在后执行删除。
6. 页面刷新列表。

### 删除膳食日历

1. 点击删除。
2. 前端弹确认框。
3. 调用 `DELETE /api/customer/meal-calendars/:id`。
4. gateway 转发到 `CustomerService.deleteMealCalendar()`。
5. 后端确认记录存在后执行删除。
6. 页面刷新列表。

## 接口错误怎么返回

膳食与服务模块里常见错误来源：

- 客户不存在
- 负责人员不存在
- 删除的记录不存在
- 当前角色没有访问权限

后端一般抛：

- `BadRequestException`
- `NotFoundException`
- `ForbiddenException`

最终前端拿到的错误格式类似：

```json
{
  "code": 403,
  "message": "仅管理员和膳食管理员可维护膳食方案",
  "path": "/api/customer/meal-plans",
  "timestamp": "..."
}
```

## 主要接口

膳食方案：

- `GET /api/customer/meal-plans`
- `POST /api/customer/meal-plans`
- `PATCH /api/customer/meal-plans/:id`
- `DELETE /api/customer/meal-plans/:id`

每周菜单：

- `GET /api/customer/meal-calendars`
- `POST /api/customer/meal-calendars`
- `PATCH /api/customer/meal-calendars/:id`
- `DELETE /api/customer/meal-calendars/:id`

服务对象分配：

- `GET /api/customer/service-targets`
- `POST /api/customer/service-targets`
- `PATCH /api/customer/service-targets/:id`

服务关注：

- `GET /api/customer/service-focuses`
- `POST /api/customer/service-focuses`
- `PATCH /api/customer/service-focuses/:id`

合计 14 个接口。

## 前后端主要方法

前端主要方法：

- `getMealPlans()` / `createMealPlan()` / `updateMealPlan()` / `deleteMealPlan()`
- `getMealCalendars()` / `createMealCalendar()` / `updateMealCalendar()` / `deleteMealCalendar()`
- `getServiceTargets()` / `createServiceTarget()` / `updateServiceTarget()`
- `getServiceFocuses()` / `createServiceFocus()` / `updateServiceFocus()`

后端主要方法：

- `listMealPlans()` / `createMealPlan()` / `updateMealPlan()` / `deleteMealPlan()`
- `listMealCalendars()` / `createMealCalendar()` / `updateMealCalendar()` / `deleteMealCalendar()`
- `listServiceTargets()` / `createServiceTarget()` / `updateServiceTarget()`
- `listServiceFocuses()` / `createServiceFocus()` / `updateServiceFocus()`
- `ensureResidentExists()`
- `ensureManagerExists()`
- `getAssignedResidentIds()`

## 数据库重点

重点看这些表：

- `MealPlan`：客户个性化膳食方案
- `MealCalendar`：每周伙食菜单
- `ServiceTarget`：客户和负责人员的关系
- `ServiceFocus`：客户购买或正在享受的服务
- `Resident`：客户主档
- `User`：员工账号

关系要懂：

- `MealPlan.residentId` 指向客户
- `ServiceTarget.residentId` 指向客户
- `ServiceTarget.managerUserId` 可选指向系统内员工
- `ServiceFocus.residentId` 指向客户
- `ServiceTarget` 会影响护理人员的数据可见范围

## 你答辩时可以这样说

我负责膳食与服务模块。膳食方案是针对单个客户的个性化配置，每周伙食菜单是全院统一周菜单；服务对象分配用于维护客户与负责人员的关系，服务关注用于记录客户购买或正在享受的服务内容。当前代码已经接入 RBAC：膳食方案和膳食日历由管理员、膳食管理员维护，服务对象分配由管理员、护理主管维护，服务关注由管理员维护，护理人员只能查看自己负责老人的服务关注信息。前端通过各自的 `api.ts` 调用 `/api/customer/...` 接口，请求先进入 gateway 做权限校验，再通过注册中心转发到 `service-care` 的 `CustomerService`。后端先校验客户或负责人员存在，再用 Prisma 对对应表做查询、新增、更新和删除。
