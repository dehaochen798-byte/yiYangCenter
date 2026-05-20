# 东软颐养中心前端项目

基于 `Vue 3 + Vite` 的养老中心管理系统前端起步工程，当前已接入：

- `Vue Router`
- `Pinia`
- `Element Plus`
- `SCSS`
- `ESLint`
- `Prettier`
- `Stylelint`
- `EditorConfig`

适用场景：

- 单人开发时先快速起步
- 后续逐步扩展为多人协作项目
- 中后台管理系统、表单系统、业务录入系统

## 启动项目

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run lint:fix
npm run format
npm run stylelint
npm run stylelint:fix
```

## 当前技术栈

- `Vue 3`：前端基础框架
- `Vue Router`：页面路由和导航守卫
- `Pinia`：状态管理
- `Element Plus`：UI 组件库
- `SCSS`：样式方案
- `ESLint`：脚本和 Vue 组件规范
- `Prettier`：代码格式化
- `Stylelint`：样式规范
- `EditorConfig`：编辑器基础格式统一

## 目录结构

```txt
src
├─ api/                     # 全局请求封装
├─ app/                     # 应用级配置
│  ├─ guards/               # 路由守卫
│  ├─ router/               # 路由入口和模块路由
│  └─ store/                # pinia 注册
├─ components/              # 通用组件
│  ├─ base/                 # 基础组件
│  └─ common/               # 业务公共组件
├─ composables/             # 组合式逻辑复用
├─ constants/               # 常量
├─ layouts/                 # 页面布局
├─ modules/                 # 按业务模块组织
│  ├─ auth/                 # 注册、登录
│  ├─ customer/             # 客户管理
│  ├─ dashboard/            # 首页工作台
│  └─ nursing/              # 护理模块
├─ stores/                  # 全局 store
├─ styles/                  # 全局样式、变量、Element Plus 主题覆盖
└─ utils/                   # 工具函数
```

## 模块划分原则

### 1. 优先按业务域拆分

例如：

- `modules/auth`
- `modules/customer`
- `modules/nursing`

不要把所有页面都堆到统一的 `views/` 里，也不要把所有接口都堆到一个巨大的 `api/` 文件里。

### 2. 业务代码尽量就近放置

推荐一个模块内部继续这样组织：

```txt
modules/customer/bed
├─ api/
├─ components/
├─ pages/
└─ store/
```

这样页面、接口、状态更容易一起维护。

### 3. 全局和局部状态分开

- `stores/` 放全局状态，例如侧边栏、权限、字典
- `modules/**/store/` 放业务模块自己的状态
- 只在当前页面里使用的状态，优先放在页面组件内部

## UI 与样式约定

### UI 组件

后续页面默认优先使用 `Element Plus`，尤其适用于：

- 登录注册表单
- 客户列表和护理记录表格
- 弹窗、抽屉、分页、消息提示
- 后台布局、菜单、面包屑

### 样式方案

项目主样式方案为 `SCSS`，不以 `Tailwind` 作为主方案。

原因：

- 当前项目是典型中后台系统
- 已明确使用 `Element Plus`
- `SCSS` 更适合沉淀主题变量、页面结构样式和组件局部样式

推荐写法：

```vue
<style scoped lang="scss">
.page-demo {
  padding: 24px;
}
</style>
```

### 样式目录说明

- `styles/reset.scss`：基础重置
- `styles/variables.scss`：颜色、圆角、阴影等设计变量
- `styles/element.scss`：`Element Plus` 主题覆盖
- `styles/helpers.scss`：少量通用样式
- `styles/index.scss`：全局样式入口

## 代码规范

### ESLint

负责检查：

- JavaScript 语法问题
- Vue 单文件组件规范
- 常见不合理写法

执行命令：

```bash
npm run lint
npm run lint:fix
```

### Prettier

负责统一：

- 引号风格
- 分号风格
- 换行宽度
- 尾随逗号

执行命令：

```bash
npm run format
```

### Stylelint

负责检查：

- `scss/css` 书写规范
- 样式属性顺序
- `.vue` 文件中的样式代码

执行命令：

```bash
npm run stylelint
npm run stylelint:fix
```

### EditorConfig

负责统一：

- 缩进为 2 个空格
- 文件编码为 `utf-8`
- 行尾为 `lf`
- 自动补最终换行

建议编辑器安装 `EditorConfig` 支持。

## 页面开发约定

### 1. 页面组件命名

页面组件统一放在 `pages/` 下，并使用 `Page` 结尾，例如：

- `LoginPage.vue`
- `DashboardPage.vue`
- `BedPage.vue`

### 2. Vue 单文件组件顺序

项目内的 `.vue` 文件统一使用以下顺序：

```vue
<template>
</template>

<script setup>
</script>

<style scoped lang="scss">
</style>
```

也就是：

- 先 `template`
- 再 `script`
- 最后 `style`

### 3. store 命名

统一使用：

- 文件名：`xxx.store.js`
- 导出：`useXxxStore`

例如：

- `auth.store.js`
- `app.store.js`

### 4. api 命名

统一使用：

- 文件名：`xxx.api.js`
- 方法名：`xxxApi`

例如：

- `auth.api.js`
- `loginApi`
- `registerApi`

### 5. 新增业务模块时的建议步骤

1. 在 `modules/` 下创建业务目录
2. 建立 `pages / components / store / api`
3. 在 `app/router/modules/` 中注册路由
4. 需要跨模块复用时，再提升到 `components/` 或 `stores/`

## 推荐开发顺序

建议优先完成以下链路：

1. 注册 / 登录
2. 主布局 / 路由守卫 / 首页
3. 客户管理中的入住登记、床位管理、用户管理
4. 护理级别、护理内容、护理记录
5. 膳食管理、膳食日历、服务关系

## 新成员快速上手

如果后续有新成员加入，建议先看这几个位置：

- `src/app/router/`：看项目页面怎么组织
- `src/layouts/`：看整体布局怎么搭
- `src/modules/`：看业务代码怎么拆
- `src/styles/`：看主题和全局样式怎么写
- `eslint.config.js`、`.stylelintrc.json`、`prettier.config.mjs`：看规范配置

建议第一天按这个顺序熟悉项目：

1. 跑起项目
2. 看 `README`
3. 看 `App.vue`、`main.js`
4. 看 `router` 和 `layout`
5. 进入某个业务模块仿照现有结构继续开发
