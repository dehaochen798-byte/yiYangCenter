# B 组：护理模块熟悉指南

## 你负责什么

B 组负责护理模块：

- 护理级别
- 护理内容
- 护理记录

这部分的核心是：先定义护理级别，再给级别配置护理内容，最后给客户登记护理执行记录。

## 最快熟悉顺序

1. 先看护理路由：
   - `YiYang_Vue/src/app/router/modules/nursing.routes.ts`
2. 再看三个页面：
   - `YiYang_Vue/src/modules/nursing/care-level/pages/CareLevelPage.vue`
   - `YiYang_Vue/src/modules/nursing/care-item/pages/CareItemPage.vue`
   - `YiYang_Vue/src/modules/nursing/care-record/pages/CareRecordPage.vue`
3. 再看前端 API：
   - `YiYang_Vue/src/modules/nursing/api/nursing.api.ts`
4. 最后看后端：
   - `YiYang_Node/src/apps/gateway/http/nursing.controller.ts`
   - `YiYang_Node/src/apps/gateway/services/gateway-service-client.ts`
   - `YiYang_Node/src/libs/registry/local-registry.service.ts`
   - `YiYang_Node/src/modules/nursing/nursing.controller.ts`
   - `YiYang_Node/src/modules/nursing/nursing.service.ts`

## 数据怎么走

以“新增护理记录”为例：

1. 用户在 `CareRecordPage.vue` 选择客户、护理内容、执行员工、执行时间。
2. 页面调用 `createCareRecord()`。
3. 前端请求 `/api/nursing/care-records`。
4. 请求进入 gateway 的 `nursing.controller.ts`。
5. gateway 通过 `GatewayServiceClient` 按 `CARE_SERVICE` 到本地注册中心发现 `service-care` 实例。
6. gateway 使用 Nest TCP 把消息转给 `service-care`。
7. `service-care` 进入 `modules/nursing/nursing.controller.ts`。
8. controller 调用 `NursingService.createCareRecord()`。
9. service 先检查客户、护理内容、员工是否存在。
10. 检查通过后，用 Prisma 创建 `CareRecord`。
11. 返回护理记录，页面刷新列表。

简单记法：

```txt
护理页面 -> nursing.api.ts -> /api/nursing/... -> gateway -> GatewayServiceClient -> LocalRegistryService -> service-care -> NursingService -> Prisma -> MySQL
```

## 接口错误怎么返回

护理模块里，客户、护理内容或执行员工不存在时，service 会抛出 `NotFoundException`；参数或业务状态不允许时，会抛出 `BadRequestException`。请求经过微服务时，`RpcExceptionsFilter` 会把错误状态码和错误信息传回 gateway，gateway 通过 `GatewayServiceClient` 内部的 `sendTcpMessage()` 还原成 HTTP 错误，最后统一返回：

```json
{
  "code": 400,
  "message": "错误原因",
  "path": "/api/nursing/...",
  "timestamp": "..."
}
```

如果漏掉了业务提前校验，Prisma 的常见数据库异常也会兜底转换，比如唯一约束冲突会返回 400，记录不存在会返回 404。

## 主要接口

模块信息：

- `GET /api/nursing/modules`

护理级别：

- `GET /api/nursing/care-levels`
- `POST /api/nursing/care-levels`
- `PATCH /api/nursing/care-levels/:id`

护理内容：

- `GET /api/nursing/care-items`
- `POST /api/nursing/care-items`
- `PATCH /api/nursing/care-items/:id`

护理记录：

- `GET /api/nursing/care-records`
- `POST /api/nursing/care-records`
- `PATCH /api/nursing/care-records/:id`

合计 10 个接口。

## 用了什么方法

前端主要方法：

- `getCareLevels()`：查询护理级别
- `createCareLevel()`：新增护理级别
- `updateCareLevel()`：修改护理级别
- `getCareItems()`：查询护理内容
- `createCareItem()`：新增护理内容
- `updateCareItem()`：修改护理内容
- `getCareRecords()`：查询护理记录
- `createCareRecord()`：新增护理记录
- `updateCareRecord()`：修改护理记录

后端主要方法：

- `listCareLevels()` / `createCareLevel()` / `updateCareLevel()`
- `listCareItems()` / `createCareItem()` / `updateCareItem()`
- `listCareRecords()` / `createCareRecord()` / `updateCareRecord()`
- `ensureCareLevelExists()`：确认护理级别存在
- `ensureCareItemExists()`：确认护理内容存在
- `ensureResidentExists()`：确认客户存在
- `ensureUserExists()`：确认执行员工存在

## 数据库重点

重点看这些表：

- `CareLevel`：护理级别
- `CareItem`：护理内容
- `CareRecord`：护理记录
- `Resident`：客户
- `User`：护理执行员工

关系要懂：

- 一个 `CareLevel` 可以有多个 `CareItem`。
- 一个 `Resident` 可以绑定一个默认护理级别。
- 一个 `CareRecord` 必须绑定客户、护理内容、执行员工。

## 你答辩时可以这样说

我负责护理模块。护理级别用于定义护理等级，护理内容挂在护理级别下面，护理记录用于记录某个员工在某个时间给某个客户执行了某项护理。前端通过 `nursing.api.ts` 调用 `/api/nursing/...` 接口，请求先进入 gateway，gateway 通过注册中心发现 `service-care` 后转发到 `NursingService`。后端通过 Prisma 操作 `CareLevel`、`CareItem`、`CareRecord` 三张核心表，创建护理记录前会先校验客户、护理内容和执行人是否存在。
