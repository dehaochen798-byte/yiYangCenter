# 前端基础复健与项目实战训练计划

这份计划用于在当前 Vue3 + TypeScript 项目中系统练习常见前端场景。核心方法是：先自己写，再让 AI 优化，最后对比差异并重写一遍。

目标不是背代码，而是建立真实项目里的判断力：状态放哪里、事件怎么传、组件怎么拆、类型怎么定义、异常怎么处理、用户操作边界在哪里。

适合节奏：每天 4h-6h。

## 训练原则

每个练习都按同一个闭环走。

1. 先拆需求：状态、事件、组件、边界情况。
2. 自己实现第一版，限时 90-150 分钟。
3. 自己跑通并记录问题。
4. 让 AI 优化代码。
5. 对比自己版本和 AI 版本。
6. 关掉 AI，重新手写一遍。
7. 补一份手动测试清单。
8. 写 5-10 行心得。

每个功能至少写三遍。

第一遍：靠自己写，暴露问题。

第二遍：看 AI 优化，理解差距。

第三遍：关掉 AI，重新写，形成肌肉记忆。

## 每日记录模板

```md
# 今日主题：

## 需求拆解

- 状态：
- 事件：
- 组件：
- 边界情况：

## 我自己一开始怎么写

## AI 优化后主要改了什么

## 我学到的关键点

## 手动测试清单

- [ ] 正常操作可用
- [ ] 空数据状态可用
- [ ] 错误状态可用
- [ ] loading 状态可用
- [ ] 重复点击不会出问题
- [ ] 移动端宽度下不乱

## 下次我会怎么写

## 还没完全理解的问题
```

## Week 0: JS、DOM、异步基础复健

目标：先把 Vue 背后的基础补稳，避免后面只会套写法。

### Day 1: 数据处理

练习内容：

- 数组增删改查
- map、filter、find、some、every、reduce
- 对象合并和拷贝
- 列表按条件筛选
- 列表排序
- 树形数据和扁平数据互转

练习任务：

- 手写一个用户列表筛选工具。
- 输入关键词、状态、角色，输出筛选后的用户列表。

### Day 2: 函数和模块

练习内容：

- 函数参数默认值
- 返回值设计
- 工具函数拆分
- import/export
- 纯函数和副作用

练习任务：

- 把 Day 1 的数据处理逻辑拆成多个工具函数。
- 每个函数只做一件事。

### Day 3: DOM 和事件模型

练习内容：

- click、input、change、submit
- 事件冒泡
- 事件委托
- preventDefault
- stopPropagation
- dataset

练习任务：

- 用原生 DOM 做一个 TodoList。
- 支持新增、删除、切换完成、事件委托。

### Day 4: 异步和请求

练习内容：

- Promise
- async/await
- try/catch
- loading、success、error
- 请求超时
- 防止旧请求覆盖新请求

练习任务：

- 模拟搜索接口。
- 连续输入时，只展示最后一次请求结果。

### Day 5: Web API 小练习

练习内容：

- localStorage
- URLSearchParams
- setTimeout
- setInterval
- AbortController
- IntersectionObserver

练习任务：

- 做一个带本地缓存的搜索页。
- 页面刷新后保留上一次搜索关键词。

## Week 1: Vue 基础事件、表单和响应式

目标：掌握 Vue 页面里最常见的交互、状态和表单写法。

### Day 1: Vue 事件基础

练习内容：

- @click
- @input
- @change
- @submit.prevent
- 事件参数
- 事件修饰符

练习任务：

- 登录表单。
- 按钮 loading。
- 防止重复提交。

### Day 2: 表单校验

练习内容：

- 必填校验
- 手机号校验
- 密码校验
- 确认密码校验
- 错误提示
- 提交前统一校验

练习任务：

- 注册表单。
- 校验失败时显示错误。
- 校验成功时模拟提交。

### Day 3: 响应式基础

练习内容：

- ref
- reactive
- computed
- watch
- watchEffect
- shallowRef
- toRef
- toRefs

练习任务：

- 商品筛选页。
- 搜索、分类、价格区间、排序结果用 computed 实现。

### Day 4: 键盘和鼠标事件

练习内容：

- Enter 提交
- Esc 关闭弹窗
- 右键菜单
- 点击外部关闭
- hover 状态
- 组合键

练习任务：

- 搜索框支持 Enter 搜索。
- 弹窗支持 Esc 关闭。
- 自定义右键菜单。

### Day 5: 滚动、resize、防抖和节流

练习内容：

- scroll
- resize
- 防抖
- 节流
- 返回顶部
- 滚动加载
- 吸顶栏

练习任务：

- 搜索框防抖请求。
- 列表滚动到底加载更多。
- 页面滚动后显示返回顶部按钮。

### Day 6-Day 7: 综合练习

练习任务：

- 用户信息编辑页。
- 包含表单、校验、提交、loading、错误提示、滚动区域、快捷键提交。

本周结束后应该能独立完成：

- 表单输入
- 基础校验
- 错误提示
- loading 状态
- 防重复提交
- 回车提交
- 搜索防抖
- 滚动加载

## Week 2: 父子组件通信和插槽

目标：理解组件之间如何传数据、传事件、传结构。

练习内容：

- props：父传子
- emit：子传父
- v-model：封装双向绑定组件
- defineExpose：父组件调用子组件方法
- provide/inject：跨层级通信
- slot：内容分发
- 具名 slot：列表、弹窗、表格场景
- 作用域 slot：把数据暴露给外部自定义渲染

练习任务：

- BaseDialog
- BaseInput
- SearchBar
- UserCard
- UserEditor
- SlotTable

重点思考：

- 数据应该由父组件管理，还是由子组件管理？
- 子组件应该暴露哪些事件？
- 什么内容适合用 slot 交给外部？
- 什么场景适合用 v-model？
- defineExpose 会不会让组件耦合变高？

## Week 3: 组件封装和 Element Plus 二次封装

目标：从能写页面，进阶到能设计组件。

### 基础组件

建议手搓：

- BaseButton：类型、尺寸、loading、disabled
- BaseInput：错误提示、清空按钮、字数限制
- BaseForm：统一校验、统一提交
- BaseModal：打开、关闭、遮罩、Esc 关闭
- BaseTable：列配置、空状态、loading、操作列
- Pagination：分页器
- Tabs：标签切换
- Upload：本地预览、删除、限制类型

### Element Plus 专项

当前项目已使用 Element Plus，可以重点练这些真实业务封装：

- ElForm 二次封装
- ElTable 二次封装
- ElDialog 二次封装
- ElPagination 和搜索条件联动
- ElMessage 和 ElMessageBox 的统一调用
- 表格操作列
- 表单编辑回显
- 表单重置
- 动态表单项

重点思考：

- 哪些参数应该通过 props 传入？
- 哪些状态应该组件内部维护？
- 哪些事件需要 emit 暴露？
- 组件是否足够通用？
- 组件是否过度封装？
- Element Plus 原有能力是否被封装丢失？

## Week 4: TypeScript 和 Composable

目标：把业务逻辑从组件里抽出来，并让类型真正服务开发。

### TypeScript 专项

练习内容：

- ref 类型
- reactive 类型
- props 类型
- emit 类型
- 表单 model 类型
- 接口返回类型
- 表格行数据类型
- 可空值处理
- Partial、Pick、Omit
- Record
- 泛型函数

练习任务：

- 定义 User、Role、SearchParams、PageResult 类型。
- 给列表、表单、详情页补齐类型。

### Composable 专项

建议手搓：

- useBoolean
- useDebounce
- useThrottle
- useModal
- useRequest
- usePagination
- useTable
- useForm
- useLocalStorage

重点思考：

- 哪些逻辑适合抽成 composable？
- composable 返回值应该是 ref，还是普通函数？
- 一个 composable 是否只解决一个问题？
- 组件中还剩多少业务逻辑？

综合练习：

- 用 useRequest + usePagination + useTable 重写一个用户列表页。

## Week 5: 路由、Pinia、权限和业务闭环

目标：掌握真实业务页面里最常见的流程。

练习内容：

- router.push
- router.replace
- 命名路由
- 动态参数
- params 和 query
- 路由守卫
- 登录拦截
- 权限判断
- 页面 loading
- 请求成功、空数据、错误状态
- 列表分页
- 搜索和筛选
- 详情页返回列表保留状态
- Pinia 用户信息
- Pinia token 状态
- Pinia 菜单状态

综合练习：

- 用户列表
- 用户详情
- 用户新增
- 用户编辑
- 用户删除
- 搜索筛选
- 分页联动
- 返回列表状态恢复
- 按钮权限控制

重点思考：

- 状态应该放在页面、组件，还是 Pinia？
- URL query 是否应该保存筛选条件？
- 返回列表时是否要恢复搜索条件？
- 权限判断应该写在路由、页面，还是按钮组件？

## Week 6: 请求层、异常处理和真实业务状态

目标：让页面从“能跑”变成“遇到异常也稳”。

练习内容：

- 请求封装
- 统一错误提示
- 业务错误码处理
- token 失效处理
- 请求取消
- 请求重试
- 旧请求覆盖新请求
- 空状态
- loading 状态
- error 状态
- disabled 状态
- 删除确认
- 乐观更新
- 接口字段映射

专项练习：

- 搜索接口连续触发，只保留最后一次结果。
- 删除列表项，先乐观删除，失败后恢复。
- token 过期后跳转登录。
- 列表页同时处理 loading、empty、error、success。

重点思考：

- 错误提示应该统一处理，还是页面单独处理？
- 请求取消和防抖有什么区别？
- 什么时候适合乐观更新？
- 后端字段是否应该直接进入页面组件？

## Week 7: 样式适配、可访问性和交互体验

目标：让页面不只是能用，还要稳定、耐看、适配好。

### 样式适配

练习内容：

- Flex 常见布局
- Grid 常见布局
- 移动端适配
- 响应式断点
- 文本溢出省略
- 固定头部
- 固定底部
- 弹窗层级
- 抽屉层级
- 下拉菜单层级
- 表格窄屏适配
- 表单 label 对齐
- 错误提示布局

### 可访问性

练习内容：

- label for
- aria-label
- aria-invalid
- 键盘可操作
- 焦点管理
- 弹窗打开后聚焦
- 弹窗关闭后恢复焦点
- Esc 关闭
- Tab 顺序
- 错误提示和输入框关联

综合练习：

- 将用户模块适配到移动端。
- 检查按钮、输入框、弹窗、表格在窄屏下是否可用。
- 为表单补齐 label、错误提示和键盘操作。
- 为列表页补齐 empty、loading、error 状态。

## Week 8: 性能优化、测试和复盘重构

目标：开始建立工程判断，知道什么时候该优化、怎么验证优化有效。

### 性能优化

练习内容：

- computed 和普通函数的区别
- watch 使用场景
- watchEffect 使用场景
- 防抖搜索减少请求
- 大列表渲染优化
- 组件拆分边界
- 避免无意义的响应式数据
- 图片懒加载
- 路由懒加载
- 表单大对象更新优化
- 异步请求取消
- 防止旧请求覆盖新请求
- VChart 图表 resize
- 图表空状态

### 测试和调试

练习内容：

- 手动测试清单
- Vue DevTools
- Network 面板
- Console 调试
- TypeScript type-check
- ESLint
- Stylelint
- 组件最小测试
- 业务流程 E2E 思路

建议执行命令：

```bash
npm run type-check
npm run lint
npm run stylelint
npm run build
```

综合练习：

- 优化一个搜索、筛选、分页、表格页面。
- 减少无效请求。
- 拆分复杂组件。
- 梳理状态归属。
- 补齐加载、空数据和错误状态。
- 给关键流程补手动测试清单。

## 常见专项题库

后续不知道练什么时，从这里抽题。

### 表单专项

- 登录表单
- 注册表单
- 动态表单
- 联动校验
- 异步校验
- 编辑回显
- 表单重置
- 脏数据判断
- 离开页面前确认

### 列表专项

- 搜索
- 筛选
- 分页
- 排序
- 批量选择
- 删除确认
- 刷新保留条件
- 空状态
- 错误状态

### 弹窗专项

- 新增弹窗
- 编辑弹窗
- 详情弹窗
- 确认弹窗
- 关闭前校验
- Esc 关闭
- 点击遮罩关闭
- 焦点管理

### 上传专项

- 文件类型限制
- 文件大小限制
- 本地预览
- 删除文件
- 上传失败重试
- 上传进度
- 多文件上传

### 权限专项

- 登录拦截
- 菜单权限
- 按钮权限
- 路由权限
- 无权限页面
- token 过期处理

### 图表专项

- 接口数据转图表数据
- loading 状态
- 空状态
- resize 自适应
- 图表筛选联动
- 图表和表格联动

### 性能专项

- 大列表
- 频繁输入
- 请求竞态
- 重复渲染
- 大表单
- 路由懒加载
- 图片懒加载

## 建议练习页面

建议在项目里建立练习页面：

```txt
src/modules/system/pages/practice/EventBasicPage.vue
src/modules/system/pages/practice/FormValidatePage.vue
src/modules/system/pages/practice/ComponentCommunicationPage.vue
src/modules/system/pages/practice/BaseComponentsPage.vue
src/modules/system/pages/practice/ElementPlusPracticePage.vue
src/modules/system/pages/practice/TypeScriptPracticePage.vue
src/modules/system/pages/practice/ComposablePracticePage.vue
src/modules/system/pages/practice/RouterPiniaPracticePage.vue
src/modules/system/pages/practice/RequestStatePracticePage.vue
src/modules/system/pages/practice/LayoutA11yPracticePage.vue
src/modules/system/pages/practice/PerformancePracticePage.vue
src/modules/system/pages/practice/ChartPracticePage.vue
```

建议在路由里挂载这些页面，保证每个练习都能真实打开、点击、调试。

## 每周产出

每周结束时留下 3 个东西：

- 一组能运行的练习页面
- 一份心得记录
- 一份“我现在能独立写出来的清单”

示例：

```md
# Week 1 总结

## 我现在能独立完成

- 表单输入
- 基础校验
- 错误提示
- loading 状态
- 防重复提交
- 回车提交
- 搜索防抖
- 滚动加载

## 我还不熟的地方

## 下周重点
```

## 判断自己是否真的掌握

一个知识点通过以下 5 个检查，才算真正掌握。

- 不看之前代码，能重新写出来。
- 能说清楚状态为什么放在这里。
- 能说清楚组件为什么这样拆。
- 能处理 loading、empty、error、disabled。
- 能列出至少 3 个边界情况。

如果做不到，就把这个主题放进下一周继续复练。

## 参考方向

这份计划主要参考以下学习路径做了归纳：

- Vue 官方文档：响应式、事件、表单、组件、插槽、provide/inject、路由、状态、测试、性能、可访问性、TypeScript。
- MDN Web Docs：HTML、CSS、JavaScript、DOM、Web API、异步、工具链。
- web.dev：性能优化、Core Web Vitals、可访问性和真实用户体验。

学习时优先顺序：

1. 先跑通功能。
2. 再补类型。
3. 再拆组件。
4. 再抽 composable。
5. 再补异常和体验。
6. 最后做性能和测试。
