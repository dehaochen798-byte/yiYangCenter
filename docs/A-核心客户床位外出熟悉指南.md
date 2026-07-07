# A 组：客户、床位、外出模块熟悉指南

## 你负责什么

A 组负责客户管理里的基础资源模块：

- 客户档案
- 员工账号
- 房间管理
- 床位管理
- 外出登记与归院

注意两点：

- 入住登记、退住登记已经划给 D 组。
- `客户档案` 和 `员工账号` 在最新代码里已经拆成两个独立入口，不再共用一个页面。

## 最新代码先记住

当前前端路由入口是：

- `/customer/residents`
  - `YiYang_Vue/src/modules/customer/resident/pages/ResidentPage.vue`
- `/customer/users`
  - `YiYang_Vue/src/modules/customer/user/pages/UserAccountPage.vue`
- `/customer/bed`
  - `YiYang_Vue/src/modules/customer/bed/pages/BedPage.vue`
- `/customer/outing`
  - `YiYang_Vue/src/modules/customer/outing/pages/OutingPage.vue`

仓库里还保留了旧的 `YiYang_Vue/src/modules/customer/user/pages/UserPage.vue`，但当前路由已经不再指向它，答辩和讲解时要以前面 4 个最新入口为准。

## 最快熟悉顺序

1. 先看路由和菜单，知道入口拆分与角色范围：
   - `YiYang_Vue/src/app/router/modules/customer.routes.ts`
   - `YiYang_Vue/src/layouts/MainLayout.vue`
2. 再看页面：
   - `YiYang_Vue/src/modules/customer/resident/pages/ResidentPage.vue`
   - `YiYang_Vue/src/modules/customer/user/pages/UserAccountPage.vue`
   - `YiYang_Vue/src/modules/customer/bed/pages/BedPage.vue`
   - `YiYang_Vue/src/modules/customer/outing/pages/OutingPage.vue`
3. 再看前端 API：
   - `YiYang_Vue/src/modules/customer/user/api/resident.api.ts`
   - `YiYang_Vue/src/modules/customer/user/api/user.api.ts`
   - `YiYang_Vue/src/modules/customer/bed/api/room.api.ts`
   - `YiYang_Vue/src/modules/customer/bed/api/bed.api.ts`
   - `YiYang_Vue/src/modules/customer/outing/api/outing.api.ts`
4. 最后看后端：
   - `YiYang_Node/src/apps/gateway/http/customer.controller.ts`
   - `YiYang_Node/src/apps/gateway/services/gateway-service-client.ts`
   - `YiYang_Node/src/libs/registry/local-registry.service.ts`
   - `YiYang_Node/src/modules/customer/customer.controller.ts`
   - `YiYang_Node/src/modules/customer/customer.service.ts`

## 角色权限怎么理解

这一版代码已经接入五角色 RBAC，A 组模块不是所有人都能改：

- 客户档案
  - 页面入口所有角色可见
  - 只有管理员可新增、编辑
  - 护理人员只能看到自己负责的老人
- 员工账号
  - 仅管理员可见、可维护、可重置密码
- 房间、床位、外出
  - 仅管理员和前台人员可见、可维护

简单记法：

```txt
管理员：A 组全部可管
前台：床位/入住/退住/外出可管
护理主管/护理人员/膳食管理员：客户档案以查看为主
```

## 数据怎么走

以“新增床位”为例：

1. 用户在 `BedPage.vue` 点击“新建床位”。
2. 页面校验所属房间、床位编号、床位状态。
3. 前端调用 `createBed()`，请求 `POST /api/customer/beds`。
4. 请求先到 gateway：`YiYang_Node/src/apps/gateway/http/customer.controller.ts`。
5. gateway 先校验 JWT 和角色，确认当前用户属于管理员或前台人员。
6. gateway 通过 `GatewayServiceClient` 按 `CARE_SERVICE` 发现 `service-care`。
7. gateway 用 Nest TCP 把消息转给 `service-care`。
8. `service-care` 进入 `modules/customer/customer.controller.ts`。
9. controller 调用 `CustomerService.createBed()`。
10. service 校验房间存在、床位编号不能为空、同房间内床位编号不重复。
11. Prisma 写入 `Bed` 表。
12. 调用 `refreshRoomBedCount()` 回写房间的 `bedCount`。
13. 数据返回前端，页面提示成功并刷新列表。

简单记法：

```txt
Vue 页面 -> 前端 API -> /api/customer/... -> gateway -> GatewayServiceClient -> service-care -> CustomerService -> Prisma -> MySQL
```

## 四块业务的关键点

### 1. 客户档案

- 页面是 `ResidentPage.vue`，不再和员工账号混在一起。
- 初始化会并行请求 `getResidents()` 和 `getCareLevels()`。
- 新增、编辑时会校验姓名、手机号、年龄、性别、护理级别等字段。
- 后端会校验：
  - 客户是否存在
  - 手机号是否唯一
  - 护理级别是否存在
- 查询列表时会把 `currentBed`、`careLevel` 一起带回，所以表格里可以直接展示床位和护理级别。

### 2. 员工账号

- 页面是 `UserAccountPage.vue`。
- 初始化调用 `getUsers()`。
- 新增和编辑都要校验姓名、手机号、年龄、状态、岗位、部门等字段。
- 后端会校验手机号唯一。
- 新建员工账号时，默认密码是 `123456`，后端会哈希后写入 `passwordHash`。
- 页面支持“重置密码”，走 `PATCH /api/customer/users/:id/reset-password`，重置后仍然回到 `123456`。

### 3. 床位管理

- `BedPage.vue` 同页维护“房间列表”和“床位列表”。
- 初始化并行加载 `getRooms()` 与 `getBeds()`。
- 床位新增、修改时，后端会校验：
  - 房间是否存在
  - 床位编号是否为空
  - 同房间内床位编号是否重复
  - 如果床位已有入住客户，不能直接改为空床
- 后端还实现了 `DELETE /api/customer/beds/:id`：
  - 删除方式是软删除
  - 已入住床位不能删除
  - 删除后会刷新房间床位数并发布审计事件
- 当前前端页面没有直接放出“删除床位”按钮，但后端接口已经准备好了。

### 4. 外出管理

- `OutingPage.vue` 初始化会并行请求 `getOutings()` 与 `getResidents()`。
- 新增外出时，客户下拉只显示 `ACTIVE` 在住客户。
- 后端会校验：
  - 客户必须存在
  - 客户必须是在住状态
  - 不能存在未归院的外出记录
- 外出登记成功后，状态写为 `OUTING`。
- 归院登记时会回写 `actualReturnAt`，并把状态改为 `RETURNED`。

## 消息中间件与审计日志

A 组里有 3 类成功操作会发领域事件：

- `customer.bed.deleted`
- `customer.outing.created`
- `customer.outing.returned`

流程是：

```txt
CustomerService 完成写库
  -> MessageBrokerService.publish()
  -> Redis Stream: yiyang:domain-events
  -> message-consumer
  -> AuditLog 审计日志表
```

答辩时可以讲“主流程先成功返回，审计记录异步落表”，这就是异步解耦。

## 接口错误怎么返回

业务校验失败时，后端一般抛：

- `BadRequestException`
- `NotFoundException`
- `ForbiddenException`

错误先在微服务里被 `RpcExceptionsFilter` 包装，再由 gateway 还原成统一 HTTP 返回。最终前端拿到的格式类似：

```json
{
  "code": 400,
  "message": "该房间已存在相同床位编号",
  "path": "/api/customer/beds",
  "timestamp": "..."
}
```

## 主要接口

客户档案：

- `GET /api/customer/residents`
- `POST /api/customer/residents`
- `PATCH /api/customer/residents/:id`

员工账号：

- `GET /api/customer/users`
- `POST /api/customer/users`
- `PATCH /api/customer/users/:id`
- `PATCH /api/customer/users/:id/reset-password`

房间管理：

- `GET /api/customer/rooms`
- `POST /api/customer/rooms`
- `PATCH /api/customer/rooms/:id`

床位管理：

- `GET /api/customer/beds`
- `POST /api/customer/beds`
- `PATCH /api/customer/beds/:id`
- `DELETE /api/customer/beds/:id`

外出管理：

- `GET /api/customer/outings`
- `POST /api/customer/outings`
- `PATCH /api/customer/outings/:id/return`

合计 17 个接口。

## 前后端主要方法

前端主要方法：

- `getResidents()` / `createResident()` / `updateResident()`
- `getUsers()` / `createUser()` / `updateUser()` / `resetUserPassword()`
- `getRooms()` / `createRoom()` / `updateRoom()`
- `getBeds()` / `createBed()` / `updateBed()`
- `getOutings()` / `createOuting()` / `returnOuting()`

后端主要方法：

- `listResidents()` / `createResident()` / `updateResident()`
- `listUsers()` / `createUser()` / `updateUser()` / `resetUserPassword()`
- `listRooms()` / `createRoom()` / `updateRoom()`
- `listBeds()` / `createBed()` / `updateBed()` / `deleteBed()`
- `listOutings()` / `createOuting()` / `returnOuting()`
- `refreshRoomBedCount()`：回写房间床位数

## 数据库重点

重点看这些表：

- `Resident`：客户档案
- `User`：员工账号
- `Room`：房间
- `Bed`：床位
- `Outing`：外出记录

关键字段：

- `Resident.status`：待入住、在住、已退住
- `Resident.currentBedId`：当前床位
- `Resident.careLevelId`：默认护理级别
- `Bed.status`：空床、占床、停用
- `Bed.isDelete`：软删除标识
- `Room.bedCount`：房间床位数冗余字段
- `Outing.status`：外出状态
- `Outing.actualReturnAt`：实际归院时间

## 你答辩时可以这样说

我负责客户档案、员工账号、房间床位和外出模块。最新代码里，客户档案和员工账号已经拆成两个独立页面，路由分别是 `/customer/residents` 和 `/customer/users`。前端页面通过 API 调用 `/api/customer/...` 接口，请求先进入 gateway，gateway 完成 JWT 和 RBAC 校验后，通过注册中心发现 `service-care`，再用 Nest TCP 转发到 `CustomerService`。后端主要使用 Prisma 操作 `Resident`、`User`、`Room`、`Bed`、`Outing` 等表。床位模块会校验房间存在、编号唯一，并在增删改后自动刷新房间床位数；外出模块会校验客户必须是在住状态且不能有未归院记录，归院时更新实际归院时间和状态。床位删除、外出登记、归院登记成功后还会发布 Redis Stream 事件，由消费者异步写入审计日志表。
