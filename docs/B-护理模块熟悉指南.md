# B 组：护理模块熟悉指南

## 你负责什么

B 组负责护理模块：

- 护理级别
- 护理内容
- 护理记录

主线要记住：

```txt
先定义护理级别
  -> 再给级别配置护理内容
  -> 最后给客户登记护理执行记录
```

## 最新代码先记住

护理模块已经接入五角色 RBAC，而且“查看权限”和“编辑权限”不是一回事：

- 护理级别、护理内容
  - 管理员、护理主管、护理人员都能进入页面
  - 只有管理员、护理主管可以新增和编辑
- 护理记录
  - 管理员、护理主管：可新增、编辑、删除全部记录
  - 护理人员：只能查看自己负责老人的记录，只能新增和编辑本人记录，不能删除

另外，这一版护理记录页面已经支持：

- 删除护理记录
- `AI生成护理小结`

## 最快熟悉顺序

1. 先看路由和菜单：
   - `YiYang_Vue/src/app/router/modules/nursing.routes.ts`
   - `YiYang_Vue/src/layouts/MainLayout.vue`
2. 再看页面：
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

1. 用户在 `CareRecordPage.vue` 选择客户、护理项目、执行人、执行时间。
2. 页面校验字段后调用 `createCareRecord()`。
3. 前端请求 `POST /api/nursing/care-records`。
4. 请求进入 gateway 的 `nursing.controller.ts`。
5. gateway 先校验 JWT 和角色是否允许进入护理模块。
6. gateway 通过 `GatewayServiceClient` 按 `CARE_SERVICE` 发现 `service-care`。
7. gateway 用 Nest TCP 把消息转给 `service-care`。
8. `service-care` 进入 `modules/nursing/nursing.controller.ts`。
9. controller 调用 `NursingService.createCareRecord()`。
10. service 根据角色决定执行人：
    - 护理人员固定为本人
    - 管理员、护理主管按表单提交的执行人处理
11. 如果是护理人员，后端还会校验客户是否属于“本人负责老人”。
12. 后端校验客户、护理项目、执行员工都存在。
13. Prisma 写入 `CareRecord` 表。
14. 返回数据，页面刷新列表。

简单记法：

```txt
护理页面 -> nursing.api.ts -> /api/nursing/... -> gateway -> GatewayServiceClient -> service-care -> NursingService -> Prisma -> MySQL
```

## 三块业务的关键点

### 1. 护理级别

- 页面是 `CareLevelPage.vue`。
- 列表会展示：
  - 级别编码
  - 级别名称
  - 启停状态
  - 护理内容数
  - 关联客户数
- 新增、编辑时由前端校验编码、名称、说明、启用状态。
- 后端只有管理员和护理主管可维护。

### 2. 护理内容

- 页面是 `CareItemPage.vue`。
- 每条护理内容都会挂在一个护理级别下面。
- 页面会展示频次、标准时长、执行说明、记录数。
- 新增、编辑时后端会先校验护理级别存在。
- 后端同样只允许管理员和护理主管维护。

### 3. 护理记录

- 页面是 `CareRecordPage.vue`。
- 初始化会并行加载：
  - 护理记录
  - 客户列表
  - 护理内容列表
  - 员工列表
- 护理人员进入页面时：
  - 执行人默认锁定为本人
  - 只能看到自己负责老人的记录
  - 只能改自己的记录
- 删除按钮只对管理员和护理主管可见。

## AI 护理小结怎么走

护理记录页新增了一个独立流程：

1. 用户先选择客户、护理项目、执行人、执行时间。
2. 点击 `AI生成护理小结`。
3. 前端请求 `POST /api/nursing/care-records/ai-note`。
4. 请求经过 gateway 转发到 `NursingService.generateCareRecordAiNote()`。
5. 后端会查询客户、护理项目、执行人等上下文，拼装提示词。
6. 再通过 OpenAI 兼容 SDK 调用 GLM 模型生成文本。
7. 前端先弹出“AI护理小结预览”对话框。
8. 用户确认后，生成内容才会写回护理记录备注框。

这条流程和“直接保存护理记录”是分开的，AI 只是辅助生成备注，不会自动落库。

## 删除护理记录怎么走

1. 用户点击“删除”。
2. 前端弹确认框。
3. 调用 `DELETE /api/nursing/care-records/:id`。
4. gateway 转发到 `NursingService.deleteCareRecord()`。
5. 后端先校验记录存在。
6. 再校验当前角色必须是管理员或护理主管。
7. 删除成功后前端提示并刷新列表。

## 接口错误怎么返回

护理模块常见错误来源：

- 客户不存在
- 护理级别不存在
- 护理内容不存在
- 执行员工不存在
- 护理人员试图修改非本人记录
- 护理人员试图操作不属于自己负责范围的老人

后端一般抛：

- `BadRequestException`
- `NotFoundException`
- `ForbiddenException`

最终前端拿到的统一错误格式类似：

```json
{
  "code": 403,
  "message": "护理人员仅可维护本人护理记录",
  "path": "/api/nursing/care-records/12",
  "timestamp": "..."
}
```

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
- `POST /api/nursing/care-records/ai-note`
- `PATCH /api/nursing/care-records/:id`
- `DELETE /api/nursing/care-records/:id`

合计 12 个接口。

## 前后端主要方法

前端主要方法：

- `getCareLevels()` / `createCareLevel()` / `updateCareLevel()`
- `getCareItems()` / `createCareItem()` / `updateCareItem()`
- `getCareRecords()` / `createCareRecord()` / `updateCareRecord()`
- `deleteCareRecord()`
- `generateCareRecordAiNote()`

后端主要方法：

- `listCareLevels()` / `createCareLevel()` / `updateCareLevel()`
- `listCareItems()` / `createCareItem()` / `updateCareItem()`
- `listCareRecords()` / `createCareRecord()` / `updateCareRecord()` / `deleteCareRecord()`
- `generateCareRecordAiNote()`
- `ensureCareLevelExists()`
- `ensureCareItemExists()`
- `ensureResidentExists()`
- `ensureUserExists()`
- `assertResidentAssignedToActor()`

## 数据库重点

重点看这些表：

- `CareLevel`：护理级别
- `CareItem`：护理内容
- `CareRecord`：护理记录
- `Resident`：客户
- `User`：执行员工
- `ServiceTarget`：护理人员负责老人关系

关系要懂：

- 一个 `CareLevel` 可以挂多个 `CareItem`
- 一个 `Resident` 可以绑定默认护理级别
- 一条 `CareRecord` 必须关联客户、护理内容、执行员工
- 护理人员的数据范围来源于 `ServiceTarget.managerUserId`

## 你答辩时可以这样说

我负责护理模块。护理级别用于定义护理分级，护理内容挂在护理级别下面，护理记录用于记录某个员工在某个时间给某个客户执行了哪项护理。最新代码已经接入 RBAC：管理员和护理主管可以维护护理级别、护理内容和全部护理记录；护理人员主要负责自己负责老人范围内的护理记录录入与维护，不能删除记录。前端通过 `nursing.api.ts` 调用 `/api/nursing/...` 接口，请求先进入 gateway 做 JWT 和角色校验，再通过注册中心转发到 `service-care` 的 `NursingService`。后端在写库前会校验客户、护理内容和执行人是否存在，并且对护理人员额外校验负责老人范围。这一版还新增了护理记录删除和 AI 护理小结预览能力。
