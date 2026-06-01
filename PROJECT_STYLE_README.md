# Zzz Project Style README

这份文档用于总结当前项目已经形成的代码风格，后续新增页面、接口、状态管理、样式时，优先遵循这里的写法。

目标不是追求“最标准”，而是尽量和仓库现有代码保持一致，减少风格跳变。

## 1. 总体原则

- 优先延续现有项目写法，不主动引入新的架构层级。
- 能直接写清楚的逻辑，不为了“抽象”而抽象。
- 小功能优先用直白写法，避免过早拆分 composable、helper、常量文件。
- 先保证能看懂，再考虑“高级写法”。
- 如果要做增强，尽量在现有文件结构里自然生长，不突然切成完全不同的一套。

## 2. 前端风格

前端技术栈：

- Vue 3
- `script setup`
- TypeScript
- Pinia
- Vue Router
- Element Plus
- SCSS

### 2.1 组件写法

- 使用单文件组件 `.vue`
- 默认结构：
  1. `template`
  2. `script setup lang="ts"`
  3. `style scoped lang="scss"`
- 页面组件逻辑通常直接写在当前文件，不急着拆出去。
- 组件内函数命名偏直接：
  - `handleLogin`
  - `handleRegister`
  - `handleLogout`
  - `toggleSidebar`
- 表单数据一般用 `reactive`
- 简单布尔状态一般用 `ref`
- 派生值用 `computed`
- 路由同步场景再使用 `watch`

### 2.2 页面复杂度偏好

当前项目整体偏“轻量页面”风格：

- 页面内保留少量状态
- 事件函数就近定义
- 很少为了一个页面再单独抽 service hook、form hook、view model
- 不默认写很多中间层

如果新增功能不大，优先保持这种写法。

### 2.3 类型使用风格

- 组件里使用 TypeScript，但不过度类型体操。
- 接口类型放在 API 文件里更符合当前项目习惯。
- Store 中必要时定义简单 interface。
- 避免引入过多局部 `type` / 泛型工具类型，只保留真正能提升可读性的类型。

推荐：

- API 请求/响应类型放在 `src/modules/**/api/*.ts`
- Store 里定义简单状态类型
- 组件里只补必要类型

不推荐：

- 为了严谨堆很多复杂联合类型
- 把简单页面写得像基础框架层

### 2.4 路由风格

路由按模块拆分：

- `src/app/router/index.ts`
- `src/app/router/modules/*.routes.ts`

约定：

- 每个业务模块单独一个 routes 文件
- 路由 `meta` 常放：
  - `title`
  - `requiresAuth`
  - `menuKey`
- 页面标题、菜单激活态优先依赖 `meta`

新增页面时，优先补齐：

- `name`
- `meta.title`
- `meta.menuKey`

### 2.5 Store 风格

当前项目 store 整体偏简洁：

- 一个 store 管一类状态
- 组合式写法 `defineStore('xx', () => {})`
- 状态和动作写在一起
- 不做过多封装

推荐风格：

```ts
export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    sidebarCollapsed,
    toggleSidebar,
  }
})
```

如果某个 store 开始承担明显不同的职责，优先拆 store，而不是在一个 store 里越堆越大。

### 2.6 API 层风格

当前前端 API 风格：

- 每个业务模块自己有 `api/*.ts`
- 请求函数命名直接：
  - `loginApi`
  - `registerApi`
- 类型和请求函数放在同一个文件中
- 统一通过 `request()` 发请求

推荐：

```ts
export function loginApi(data: LoginPayload) {
  return request<LoginResponse>({
    url: '/api/auth/login',
    method: 'post',
    data,
  })
}
```

### 2.7 表单交互风格

当前项目更偏“轻验证”：

- 不一定先接完整 `el-form` rules
- 常先用手写 `validateForm()`
- 校验失败直接 `ElMessage.warning`
- 提交时加 `submitting` 防重入

推荐顺序：

1. 校验空值
2. 设置 loading
3. 调接口
4. 成功提示并跳转
5. 失败提示
6. finally 关闭 loading

### 2.8 样式风格

当前项目前端不是默认后台模板风格，而是有一定设计感：

- 柔和浅色背景
- 绿色系主色
- 圆角偏大
- 卡片、渐变、轻阴影较常见
- 布局看起来比默认 Element 更精致

样式写法习惯：

- 使用 `scss`
- 使用 `scoped`
- 类名多用 BEM 风格：
  - `.auth-page`
  - `.auth-page__card`
  - `.main-layout__header`
- 少量 `:deep(...)` 用于覆盖 Element Plus
- 尽量不用 `!important`

### 2.9 对 Element Plus 的使用方式

- 直接使用 Element Plus 组件
- 轻度定制样式
- 不额外封装一层通用 UI 组件体系
- 只有真正重复时，才抽共用组件

## 3. 后端风格

后端技术栈：

- NestJS
- Prisma
- MySQL / MariaDB adapter
- class-validator
- JWT

### 3.1 模块组织风格

后端按 Nest 标准模块组织：

- `module.ts`
- `controller.ts`
- `service.ts`
- `dto/*.ts`

当前 `auth` 模块就是典型参考。

推荐新增模块时保持：

- controller 只接参数、调 service
- 主要业务逻辑放 service
- DTO 做参数校验

### 3.2 Controller 风格

- 路由简洁直接
- 不在 controller 写复杂逻辑
- 通过 DTO 接收入参

示例倾向：

```ts
@Post('login')
login(@Body() dto: LoginDto) {
  return this.authService.login(dto)
}
```

### 3.3 Service 风格

当前 service 风格偏直接：

- 顺序清楚
- 先查、再判、再写
- 业务异常直接抛 Nest 内置异常

推荐：

- `BadRequestException`
- `UnauthorizedException`

不推荐：

- 过度拆 helper
- service 内引入太多层级调用

### 3.4 DTO 风格

当前 DTO 使用 `class-validator`，风格简单直接：

- `@IsString()`
- `@IsNotEmpty()`
- `@IsInt()`
- `@Min()`
- `@Max()`
- `@IsEnum()`

每个字段只写必要校验，不追求一次写满所有边界规则。

### 3.5 Prisma / 数据模型风格

当前 Prisma 风格：

- schema 结构清晰
- 唯一字段直接用 `@unique`
- 枚举用于明确状态字段
- 模型命名直接对应业务概念

如果新增字段或表：

- 优先保持现有命名方式
- 字段名用英文驼峰
- 表达唯一约束时优先用 `@unique`
- 多字段唯一约束用 `@@unique`

### 3.6 数据库迁移风格

当前项目已经使用 Prisma migration。

约定：

- 改 schema 后同步补 migration
- 如果是兼容历史数据的字段调整，migration 里要考虑数据回填
- 不要只改 schema 不改迁移

## 4. 当前项目不太推荐的写法

后续为了保持风格统一，尽量少做这些事：

- 小功能引入很多新抽象层
- 在页面里大量写复杂类型工具
- 把一个简单 store 做成大型状态中心
- 为了“通用”提前封装很多其实只用一次的函数
- 不加判断就大量使用 `!important`
- 突然引入和现有项目视觉完全不同的布局风格

## 5. 如果让 AI 按当前项目风格写代码

给 AI 文件时，优先提供这些：

### 前端

- 一个同类型页面
- 一个布局文件
- 一个 store
- 一个 routes 文件
- 一个 API 文件

建议最小参考组合：

- `YiYang_Vue/src/layouts/MainLayout.vue`
- `YiYang_Vue/src/modules/auth/pages/LoginPage.vue`
- `YiYang_Vue/src/modules/auth/pages/RegisterPage.vue`
- `YiYang_Vue/src/stores/app.store.ts`
- `YiYang_Vue/src/app/router/modules/customer.routes.ts`

### 后端

- 一个现有模块的 controller / service / dto
- `prisma/schema.prisma`

建议最小参考组合：

- `YiYang_Node/src/modules/auth/auth.controller.ts`
- `YiYang_Node/src/modules/auth/auth.service.ts`
- `YiYang_Node/src/modules/auth/dto/register.dto.ts`
- `YiYang_Node/prisma/schema.prisma`

## 6. 一句话版本

这个项目当前更适合：

- 写得直白一点
- 状态轻一点
- 抽象少一点
- 风格统一一点
- 在现有结构里自然扩展

而不是：

- 一上来做很重的工程化封装
- 写得明显比仓库原代码复杂一大截

## 7. 后续执行优先级

如果风格选择有冲突，优先级按下面来：

1. 先和现有同目录文件保持一致
2. 再和这份 README 保持一致
3. 最后才考虑通用最佳实践

也就是说：

同目录已有写法 > 本文档 > 通用习惯

