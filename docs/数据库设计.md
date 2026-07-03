# 东软颐养中心项目数据库设计与实现说明

## 1. 目标与设计原则

本次实现围绕两类目标展开：

1. 满足题目中的必须做项，优先打通客户管理与护理模块的业务闭环。
2. 在不把系统复杂度拉得过高的前提下，为后续审批、套餐、统计、费用等扩展预留结构。

核心设计原则如下：

- 以 `Resident` 作为养老客户主档，所有入住、膳食、外出、护理记录都围绕客户主档展开。
- 以 `Room` + `Bed` 作为床位资源池，入住和退住通过状态流转驱动床位占用变化。
- 以 `User` 作为员工账号主体，健康管家和护理执行人都绑定到员工账号，避免纯文本关系难维护。
- 以“主数据 + 业务记录”的方式拆表，减少字段耦合，便于后续扩展流程。
- 对必须做项直接落地；对建议预留项尽量通过字段或关联关系预留，不提前引入复杂审批表。

---

## 2. 数据库表设计

### 2.1 用户与客户基础数据

#### `User`

用途：

- 系统员工账号
- 护理记录执行人
- 健康管家绑定主体

关键字段：

- `mobile`：登录和唯一识别手机号
- `realName` / `nickName`：姓名展示兼容
- `status`：启用、停用
- `roleName` / `departmentName`：岗位、部门预留

这样设计的原因：

- 题目里的“用户管理”不仅是登录用户，还要为服务对象、护理记录提供真实员工主体。
- 先用轻量字段满足“基础编辑、启停状态”，未来再升级为角色、岗位、部门、RBAC。

#### `Resident`

用途：

- 养老客户主档
- 其他业务表的核心外键对象

关键字段：

- `currentBedId`：当前占用床位，一对一绑定当前床位
- `careLevelId`：默认护理级别
- `status`：待入住、在住、已退住
- `idCard`、`emergencyContactName`、`emergencyContactPhone`：档案扩展

这样设计的原因：

- “入住登记、退住登记、膳食管理、护理记录”都依赖统一客户主档。
- `currentBedId` 能快速判断客户是否在住、当前在哪张床，避免每次从入住记录推导实时状态。
- `careLevelId` 让客户档案和护理模块形成直接关联。

---

### 2.2 床位管理

#### `Room`

用途：

- 房间主数据

关键字段：

- `building`、`floor`、`roomNo`
- `roomType`
- `bedCount`
- `isActive`

这样设计的原因：

- 当前必须做项只要求房间和床位配置，但用户后续判断里明确提到了楼栋、楼层、房型预留。
- `bedCount` 采用冗余存储，便于列表直接展示，服务层在床位增减后自动回写。

#### `Bed`

用途：

- 实际可分配床位

关键字段：

- `roomId`
- `bedNo`
- `label`
- `status`：空床、占床、停用

这样设计的原因：

- 原来的 `isOccupied` 只能表达是否占用，无法表达“停用床位”，因此升级为 `status` 更适合业务。
- `label` 可满足“床位标签”预留，例如靠窗、护理床等。
- `Resident.currentBedId` 与 `Bed.currentResident` 形成一对一当前占床关系，入住退住时直接联动。

---

### 2.3 膳食管理

#### `MealPlan`

用途：

- 单个客户的个性化膳食方案

关键字段：

- `residentId`
- `title`
- `description`
- `dietaryRestrictions`
- `allergens`
- `nutritionTags`
- `startDate` / `endDate`

这样设计的原因：

- 题目要求“对每个客户进行定制”，所以方案必须以客户为中心，而不是全局菜单。
- 忌口、过敏、营养标签属于建议预留项，本次直接纳入字段，后续可继续拆成标签体系。

#### `MealCalendar`

用途：

- 每周伙食菜单

关键字段：

- `campus`
- `weekLabel`
- `weekStartDate`
- `monday` ~ `sunday`

这样设计的原因：

- 当前必须做项是“每周伙食菜单”，按周七天平铺字段是最快落地且易维护的做法。
- 预留了 `campus`，便于后续多园区菜单。
- 当前不拆早餐/午餐/晚餐，是为了保持页面和表结构复杂度适中；后续可以扩展为子表。

---

### 2.4 入住、退住、外出流程

#### `CheckIn`

用途：

- 客户入住记录

关键字段：

- `residentId`
- `bedId`
- `checkInAt`
- `note`

这样设计的原因：

- 入住记录负责保留历史，`Resident.currentBedId` 负责保存当前状态。
- 这样既能追溯历史，又能高效查询实时占床情况。

#### `CheckOut`

用途：

- 客户退住记录

关键字段：

- `residentId`
- `bedId`
- `checkOutAt`
- `reason`
- `handoverNote`

这样设计的原因：

- 退住不仅要释放床位，还要保留“退住原因”和“交接说明”，满足必须做项并兼顾后续费用清算、回访扩展。

#### `Outing`

用途：

- 客户外出与归院登记

关键字段：

- `residentId`
- `startAt`
- `expectedReturnAt`
- `actualReturnAt`
- `destination`
- `reason`
- `status`

这样设计的原因：

- 外出登记必须形成状态流转，所以单独保留预计归院和实际归院时间。
- 当前不做审批子表，但结构已经支持以后加审批人、超时告警等逻辑。

---

### 2.5 服务对象与服务关注

#### `ServiceTarget`

用途：

- 客户与健康管家的绑定关系

关键字段：

- `residentId`
- `managerUserId`
- `managerName`
- `managerMobile`
- `startDate` / `endDate`
- `relationNote`

这样设计的原因：

- 现状判断里提到当前更像文本关系，所以本次核心优化是加入 `managerUserId`。
- 同时保留 `managerName`、`managerMobile`，兼容未建账号的线下录入场景。
- 起止时间让关系可追溯，也方便后续一客多服务人员扩展。

#### `ServiceFocus`

用途：

- 客户购买或使用的服务信息

关键字段：

- `residentId`
- `serviceName`
- `detail`
- `serviceStartAt` / `serviceEndAt`
- `status`

这样设计的原因：

- 当前必须做项是“服务信息录入、查询”，因此表保持轻量。
- 服务开始/结束时间、状态是建议预留项，本次直接补齐。
- 后续如做服务套餐、续费、到期提醒，可在此基础上扩展。

---

### 2.6 护理模块

#### `CareLevel`

用途：

- 护理级别定义

关键字段：

- `code`
- `name`
- `description`
- `isActive`

这样设计的原因：

- 题目要求“定义级别”，同时建议预留“级别编码、启停状态”，因此本次直接落地。
- 客户档案通过 `careLevelId` 关联护理级别，护理内容也以级别为归属。

#### `CareItem`

用途：

- 护理内容配置

关键字段：

- `careLevelId`
- `name`
- `description`
- `frequency`
- `durationMinutes`
- `instructions`
- `isActive`

这样设计的原因：

- 题目要求“设置护理内容、关联护理级别”，而频次、标准时长、执行说明是很高价值的轻量预留。
- 后续如要做护理包、模板复用，可以在此基础上继续抽象。

#### `CareRecord`

用途：

- 护理执行记录

关键字段：

- `residentId`
- `careItemId`
- `operatorId`
- `executedAt`
- `note`

这样设计的原因：

- 这是护理闭环最核心的业务表，必须同时知道“给谁做、做了什么、谁做的、什么时候做的”。
- `operatorId` 绑定 `User`，避免执行人只是文本，后续统计才可用。

---

## 3. 为什么采用“状态冗余 + 记录表”双轨设计

本项目多个场景都采用了这种模式：

- `Resident.status` + `CheckIn/CheckOut`
- `Resident.currentBedId` + `CheckIn`
- `Bed.status` + `CheckIn/CheckOut`
- `Outing.status` + `actualReturnAt`

原因是：

- 纯记录表适合追溯历史，但不适合高频查询“当前状态”。
- 纯状态字段适合展示当前页面，但会丢失历史流程。
- 双轨结合后，既能快速做页面查询，也能保留审计轨迹。

这非常适合养老中心这类“当前状态很重要，同时历史过程也必须可回溯”的业务。

---

## 4. 本次完成的前后端功能

### 4.1 后端

已完成：

- Prisma schema 优化与扩展
- 客户管理模块 REST 接口
- 护理模块 REST 接口
- 入住占床、退住释放床位、外出归院等状态流转逻辑

主要接口分组：

- `/api/customer/residents`
- `/api/customer/users`
- `/api/customer/rooms`
- `/api/customer/beds`
- `/api/customer/meal-plans`
- `/api/customer/meal-calendars`
- `/api/customer/check-ins`
- `/api/customer/check-outs`
- `/api/customer/outings`
- `/api/customer/service-targets`
- `/api/customer/service-focuses`
- `/api/nursing/care-levels`
- `/api/nursing/care-items`
- `/api/nursing/care-records`

### 4.2 前端

已完成必须做项页面：

- 用户与客户档案管理
- 房间与床位管理
- 膳食方案管理
- 每周伙食菜单
- 入住登记
- 退住登记
- 外出登记与归院
- 服务对象关系维护
- 服务关注信息维护
- 护理级别
- 护理内容
- 护理记录

---

## 5. 已实现的关键业务闭环

### 入住登记

- 选择未入住客户
- 选择空床
- 创建入住记录
- 客户状态变为 `ACTIVE`
- 床位状态变为 `OCCUPIED`
- 客户当前床位写入 `currentBedId`

### 退住登记

- 选择当前在住客户
- 创建退住记录
- 客户状态变为 `CHECKED_OUT`
- 客户当前床位清空
- 床位状态变为 `VACANT`

### 外出登记

- 仅允许在住客户发起外出
- 同一客户存在未归院记录时不可重复外出
- 归院登记后写入 `actualReturnAt`
- 外出状态更新为 `RETURNED`

### 护理记录

- 记录必须绑定客户
- 必须绑定护理内容
- 必须绑定执行员工
- 支持按执行时间录入和查询

---

## 6. 后续建议扩展

建议下一阶段优先考虑：

1. 为后端接口补 DTO 校验类，减少当前 `Record<string, unknown>` 的宽松输入。
2. 为 Prisma schema 新增迁移脚本并在真实数据库执行迁移。
3. 给用户账号补默认密码生成与重置密码流程。
4. 给入住、退住、外出补审批流或操作日志。
5. 给护理记录补统计看板、漏执行提示和移动端录入。
6. 给服务关注补到期提醒、续费、套餐能力。

---

## 7. 本次验证情况

已验证：

- `YiYang_Node` 后端 `npm run prisma:generate`
- `YiYang_Node` 后端 `npm run build`
- `YiYang_Vue` 前端 `npm run build`
- `YiYang_Vue` 前端 `npm run type-check`

说明：

- 当前实现已经通过代码层面的构建和类型验证。
- 若要完成真实数据库联调，还需要将本次 `schema.prisma` 变更同步到实际 MySQL/MariaDB 数据库结构。
