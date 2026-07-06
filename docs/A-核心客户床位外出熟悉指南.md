# A 组：客户、床位、外出模块熟悉指南

## 你负责什么

A 组负责客户管理里最基础的资源部分：

- 客户档案
- 员工/用户管理
- 房间管理
- 床位管理
- 外出登记与归院

注意：入住登记、退住登记已经分给 D 组。

## 最快熟悉顺序

按这个顺序看，不要一上来就看全部代码：

1. 先看路由，知道页面入口在哪里：
   - `YiYang_Vue/src/app/router/modules/customer.routes.ts`
2. 再看页面，知道按钮和表单长什么样：
   - `YiYang_Vue/src/modules/customer/user/pages/UserPage.vue`
   - `YiYang_Vue/src/modules/customer/bed/pages/BedPage.vue`
   - `YiYang_Vue/src/modules/customer/outing/pages/OutingPage.vue`
3. 再看前端 API，知道页面调用了哪些接口：
   - `YiYang_Vue/src/modules/customer/user/api/resident.api.ts`
   - `YiYang_Vue/src/modules/customer/user/api/user.api.ts`
   - `YiYang_Vue/src/modules/customer/bed/api/room.api.ts`
   - `YiYang_Vue/src/modules/customer/bed/api/bed.api.ts`
   - `YiYang_Vue/src/modules/customer/outing/api/outing.api.ts`
4. 最后看后端业务逻辑：
   - `YiYang_Node/src/apps/gateway/http/customer.controller.ts`
   - `YiYang_Node/src/apps/gateway/services/gateway-service-client.ts`
   - `YiYang_Node/src/libs/registry/local-registry.service.ts`
   - `YiYang_Node/src/modules/customer/customer.controller.ts`
   - `YiYang_Node/src/modules/customer/customer.service.ts`

## 数据怎么走

以“新增床位”为例：

1. 用户在 `BedPage.vue` 点击新增，填写房间、床位号、床位状态。
2. 页面调用 `createBed()`。
3. `createBed()` 通过 `request()` 请求 `/api/customer/beds`。
4. 请求先到 gateway：`apps/gateway/http/customer.controller.ts`。
5. gateway 不直接查数据库，而是通过 `GatewayServiceClient` 按 `CARE_SERVICE` 到本地注册中心发现 `service-care` 实例。
6. gateway 使用 Nest TCP 把消息转给 `service-care`。
7. `service-care` 进入 `modules/customer/customer.controller.ts`。
8. controller 调用 `CustomerService.createBed()`。
9. service 先校验房间是否存在、床位编号是否重复，再使用 Prisma 写入 `Bed` 表。
10. 创建后调用 `refreshRoomBedCount()`，刷新房间床位数量。
11. 数据返回前端，页面刷新列表。

简单记法：

```txt
Vue 页面 -> 前端 API -> request/http -> gateway -> GatewayServiceClient -> LocalRegistryService -> service-care -> CustomerService -> Prisma -> MySQL
```

## AI 调用模块位置

当前项目里的 AI 调用功能是“护理记录 AI 小结”，入口不在 A 组客户页面里，而是在护理记录页面。A 组如果需要说明或排查 AI 接口，可以按下面这条链路找：

```txt
CareRecordPage.vue
  -> nursing.api.ts
  -> gateway nursing.controller.ts
  -> GatewayServiceClient
  -> service-care CareMessageController
  -> NursingService.generateCareRecordAiNote()
  -> OpenAI SDK chat.completions
  -> BigModel / GLM 文本模型
```

关键文件位置：

- 前端按钮和预览弹窗：
  - `YiYang_Vue/src/modules/nursing/care-record/pages/CareRecordPage.vue`
  - 点击 `AI生成护理小结` 后先生成内容，再弹出 `AI护理小结预览`，用户确认后才写回备注。
- 前端接口封装：
  - `YiYang_Vue/src/modules/nursing/api/nursing.api.ts`
  - 方法：`generateCareRecordAiNote()`
  - 请求地址：`POST /api/nursing/care-records/ai-note`
- gateway HTTP 入口：
  - `YiYang_Node/src/apps/gateway/http/nursing.controller.ts`
  - 方法：`generateCareRecordAiNote()`
- 微服务消息协议：
  - `YiYang_Node/src/libs/contracts/care.contract.ts`
  - pattern：`careRecordsGenerateAiNote`
- service-care 接收端：
  - `YiYang_Node/src/apps/service-care/transport/care-message.controller.ts`
  - 方法：`generateCareRecordAiNote()`
- AI 核心调用：
  - `YiYang_Node/src/modules/nursing/nursing.service.ts`
  - 方法：`generateCareRecordAiNote()`、`getOpenAiClient()`、`createAiCompletion()`
  - SDK 调用：`openai.chat.completions.create(...)`
- AI 配置读取：
  - `YiYang_Node/src/libs/config-center/local-env-config-center.ts`
  - 环境变量来自：`YiYang_Node/.env`

AI 相关环境变量：

```env
ZAI_API_KEY="..."
ZAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4/"
ZAI_MODEL="glm-4.7"
ZAI_PROXY_URL=""
```

这里接的是 GLM 的 OpenAI 兼容文本对话模型，代码使用的是 `chat.completions`，所以同类别文本模型一般只需要改 `ZAI_MODEL`。如果改成图片、向量、语音等不同类别模型，就不能只改模型名，需要换接口和入参。

注意：AI 生成可能比普通业务接口慢，当前后端已经把 AI SDK 超时和 gateway 到 service-care 的 TCP 响应超时调大，相关文件是：

- `YiYang_Node/src/modules/nursing/nursing.service.ts`
- `YiYang_Node/src/libs/microservices/client-proxy.util.ts`

## 消息中间件与审计日志

A 组的床位和外出模块已经接入 Redis Stream 消息中间件，核心目的是异步记录关键业务操作：

```txt
CustomerService 完成业务写库
  -> MessageBrokerService.publish()
  -> Redis Stream: yiyang:domain-events
  -> message-consumer
  -> AuditLog 审计日志表
```

当前 A 组会发布这些事件：

- `customer.bed.deleted`：床位删除成功后发布
- `customer.outing.created`：外出登记成功后发布
- `customer.outing.returned`：归院登记成功后发布

消费者消费成功后会写入 `AuditLog`，同时在控制台打印类似：

```txt
[message-consumer] customer.outing.created eventId=... summary=张三 已办理外出登记
```

这部分答辩时重点讲“异步解耦”：床位删除、外出、归院的主流程先正常返回，审计日志由消费者异步写入，后续可以扩展成家属通知、外出风险提醒、统计分析。

## 接口错误怎么返回

业务校验失败时，后端会抛出 `BadRequestException` 或 `NotFoundException`，例如重复创建同房间的同名床位会返回“该房间已存在相同床位编号”。请求经过微服务时，`RpcExceptionsFilter` 会把错误状态码和错误信息传回 gateway，gateway 通过 `GatewayServiceClient` 内部的 `sendTcpMessage()` 还原成 HTTP 错误，最后统一返回：

```json
{
  "code": 400,
  "message": "该房间已存在相同床位编号",
  "path": "/api/customer/beds",
  "timestamp": "..."
}
```

如果漏掉了业务提前校验，Prisma 的常见数据库异常也会兜底转换，比如唯一约束冲突会返回 400，记录不存在会返回 404。

## 主要接口

客户档案：

- `GET /api/customer/residents`
- `POST /api/customer/residents`
- `PATCH /api/customer/residents/:id`

用户管理：

- `GET /api/customer/users`
- `POST /api/customer/users`
- `PATCH /api/customer/users/:id`

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

合计约 16 个接口。

## 用了什么方法

前端主要方法：

- `getResidents()`：查询客户列表
- `createResident()`：新增客户
- `updateResident()`：修改客户
- `getUsers()` / `createUser()` / `updateUser()`：用户管理
- `getRooms()` / `createRoom()` / `updateRoom()`：房间管理
- `getBeds()` / `createBed()` / `updateBed()`：床位管理
- `getOutings()` / `createOuting()` / `returnOuting()`：外出和归院

后端主要方法：

- `listResidents()` / `createResident()` / `updateResident()`
- `listUsers()` / `createUser()` / `updateUser()`
- `listRooms()` / `createRoom()` / `updateRoom()`
- `listBeds()` / `createBed()` / `updateBed()` / `deleteBed()`
- `listOutings()` / `createOuting()` / `returnOuting()`

## 数据库重点

重点看这些表：

- `Resident`：客户档案
- `User`：员工/系统用户
- `Room`：房间
- `Bed`：床位
- `Outing`：外出记录

几个关键字段要懂：

- `Resident.status`：客户状态，比如待入住、在住、已退住
- `Resident.currentBedId`：客户当前床位
- `Bed.status`：床位状态，比如空床、占床、停用
- `Bed.isDelete`：床位是否软删除
- `Outing.status`：外出状态
- `Outing.actualReturnAt`：实际归院时间

## 你答辩时可以这样说

我负责客户、员工、房间、床位和外出模块。前端页面通过 API 文件调用 `/api/customer/...` 接口，请求先进入 gateway，gateway 通过注册中心按 `CARE_SERVICE` 发现 `service-care`，再用 Nest TCP 转到 customer service。后端主要用 Prisma 的 `findMany`、`create`、`update` 操作数据库。床位模块会校验房间是否存在，删除床位时采用软删除；外出模块会校验客户必须是在住状态，并且不能有未归院记录。归院时更新外出记录的实际归院时间和状态。床位删除、外出登记、归院登记成功后还会发布 Redis Stream 消息，由 `message-consumer` 异步写入 `AuditLog` 审计日志表。
