<template>
  <div></div>
</template>

<script setup>
//day1
//1
// let score = 100
// const getLevel = (score) => {
//   if (score >= 90) {
//     return 'A'
//   } else if (score >= 80) {
//     return 'B'
//   } else if (score >= 60) {
//     return 'C'
//   } else {
//     return 'D'
//   }
// }
// getLevel(score)
// //2
// const goods = [
//   { id: 1, name: '苹果', price: 80 },
//   { id: 2, name: '香蕉', price: 120 },
//   { id: 3, name: '西瓜', price: 200 },
// ]
// let result = goods.filter((item) => item.price > 100)
// console.log(result)
// //3
// const searchList = (key) => {
//   const list = [
//     { id: 1, name: '苹果' },
//     { id: 2, name: '香蕉' },
//     { id: 3, name: '苹果汁' },
//   ]
//   if (key) {
//     return list.filter((item) => item.name.includes(key))
//   }
//   return list
// }
// const result2 = searchList('苹果')
// console.log(result2)
// //4
// const users = [
//   { id: 1, name: 'Tom', age: 16 },
//   { id: 2, name: 'Jack', age: 20 },
//   { id: 3, name: 'Lucy', age: 22 },
// ]
// const adultUser = users.find((item) => item.age >= 18)
// console.log(adultUser)
// //5
// let todos = [
//   { id: 1, text: '吃饭' },
//   { id: 2, text: '睡觉' },
//   { id: 3, text: '敲代码' },
// ]
// const removeToDo = (id) => {
//   todos = todos.filter((item) => item.id != id)
//   console.log(todos)
// }
// removeToDo(2)

// day1
// 第 2 组题：比上一组高半级，重点是把筛选、查找、映射、条件判断拼起来用

// // 1. 商品搜索 + 价格过滤
// // 现有数据如下：
// const goodsList = [
//   { id: 1, name: '苹果', price: 80 },
//   { id: 2, name: '苹果汁', price: 120 },
//   { id: 3, name: '香蕉', price: 150 },
//   { id: 4, name: '西瓜', price: 90 },
// ]
// //
// // 请写一个函数 searchGoods(keyword)
// // 要求：
// // - 返回 name 里包含 keyword 的商品
// // - 并且这些商品的 price 必须大于 100
// // - 如果 keyword 是空字符串，返回所有 price 大于 100 的商品
// const searchGoods = (keyword) => {
//   let arr
//   if (keyword) {
//     arr = goodsList.filter((item) => item.name.includes(keyword))
//   } else {
//     arr = goodsList
//   }
//   return arr.filter((item) => item.price > 100)
// }
// searchGoods('西瓜')
// // 2. 处理用户名数组
// // 现有数据如下：
// const usersList = [
//   { id: 1, name: 'tom' },
//   { id: 2, name: 'jack' },
//   { id: 3, name: 'lucy' },
// ]
// //
// // 请写代码得到一个新数组 nameList
// // 要求：
// // - 数组内容只包含 name
// // - 结果格式：['tom', 'jack', 'lucy']
// let nameList = usersList.map((item) => item.name)
// console.log('namelist:', nameList)
// // 3. 查找符合条件的第一个商品
// // 现有数据如下：
// const productList = [
//   { id: 1, name: '键盘', stock: 0 },
//   { id: 2, name: '鼠标', stock: 5 },
//   { id: 3, name: '屏幕', stock: 10 },
// ]
// //
// // 请写代码找到第一个 stock 大于 0 的商品
// // 结果赋值给 firstAvailableProduct
// let firstAvailableProduct = productList.find((item) => item.stock > 0)
// console.log(firstAvailableProduct)
// // 4. 状态判断函数
// // 请写一个函数 getStatusText(status)
// // 要求：
// // - status === 0 返回 '待开始'
// // - status === 1 返回 '进行中'
// // - status === 2 返回 '已完成'
// // - 其他返回 '未知状态'
// const getStatusText = (status) => {
//   if (status === 0) {
//     return '待开始'
//   } else if (status === 1) {
//     return '进行中'
//   } else if (status === 2) {
//     return '已完成'
//   } else {
//     return '未知状态'
//   }
// }
// getStatusText(1)
// // 5. 删除指定分类商品
// // 现有数据如下：
// let cartList = [
//   { id: 1, name: '苹果', category: 'fruit' },
//   { id: 2, name: '可乐', category: 'drink' },
//   { id: 3, name: '香蕉', category: 'fruit' },
//   { id: 4, name: '牛奶', category: 'drink' },
// ]
// //
// // 请写一个函数 removeByCategory(category)
// // 要求：
// // - 调用 removeByCategory('fruit') 后
// // - cartList 中只保留 category 不等于 'fruit' 的项
// // - 直接修改 cartList 变量
// const removeByCategory = (category) => {
//   cartList = cartList.filter((item) => item.category != category)
// }
// removeByCategory('fruit')
// console.log(cartList)
// // 6. 组合题：先筛选，再转换
// // 现有数据如下：
// const scoreList = [
//   { id: 1, name: '小明', score: 56 },
//   { id: 2, name: '小红', score: 87 },
//   { id: 3, name: '小刚', score: 92 },
// ]
// //
// // 请写代码得到一个新数组 passedNames
// // 要求：
// // - 先找出 score 大于等于 60 的人
// // - 再把这些人的 name 取出来
// // - 结果格式：['小红', '小刚']
// let passedNames = scoreList.filter((item) => item.score >= 60).map((item) => item.name)
// console.log(passedNames)

// day2
// 第 3 组题：开始加入多条件、判空、简单统计，还是以数组处理和条件判断为主

// 1. 多条件搜索商品
// 现有数据如下：
// const shopList = [
//   { id: 1, name: '苹果', price: 80, category: 'fruit' },
//   { id: 2, name: '苹果汁', price: 120, category: 'drink' },
//   { id: 3, name: '香蕉', price: 150, category: 'fruit' },
//   { id: 4, name: '可乐', price: 90, category: 'drink' },
// ]
// //
// // 请写一个函数 filterShopList(keyword, category)
// // 要求：
// // - name 里包含 keyword
// // - category 必须等于传入的 category
// // - 如果 keyword 是空字符串，就只按 category 过滤
// // - 返回过滤后的新数组
// const filterShopList = (keyword, category) => {
//   let newArr
//   if (keyword) {
//     newArr = shopList.map((item) => {
//       if (item.name.includes(keyword)) {
//         return item
//       }
//       return false
//     })
//   }
//   // return newArr
//   return newArr.filter((item) => item.category === category)
// }
// console.log('filterShopList:', filterShopList('苹果', 'fruit'))
// // 2. 找出第一个未完成任务
// // 现有数据如下：
// const taskList = [
//   { id: 1, title: '写页面', done: true },
//   { id: 2, title: '联调接口', done: false },
//   { id: 3, title: '提测', done: false },
// ]
// //
// // 请写代码找到第一个 done 为 false 的任务
// // 结果赋值给 firstUndoTask
// const firstUndoTask = taskList.find((item) => !item.done)
// console.log('firstUndoTask:', firstUndoTask)
// // 3. 只保留库存大于 0 的商品名
// // 现有数据如下：
// const stockList = [
//   { id: 1, name: '键盘', stock: 0 },
//   { id: 2, name: '鼠标', stock: 3 },
//   { id: 3, name: '耳机', stock: 8 },
// ]
// //
// // 请写代码得到一个新数组 stockNameList
// // 要求：
// // - 先筛选出 stock 大于 0 的项
// // - 再把这些项的 name 组成一个新数组
// // - 结果格式：['鼠标', '耳机']
// const stockNameList = stockList.filter((item) => item.stock > 0).map((item) => item.name)
// console.log('stockNameList:', stockNameList)
// // 4. 统计及格人数
// // 现有数据如下：
// const examList = [
//   { id: 1, name: '小明', score: 58 },
//   { id: 2, name: '小红', score: 76 },
//   { id: 3, name: '小刚', score: 91 },
//   { id: 4, name: '小丽', score: 43 },
// ]
// //
// // 请写代码统计 score 大于等于 60 的人数
// // 结果赋值给 passCount
// let passCount = 0
// examList.map((item) => {
//   if (item.score >= 60) {
//     passCount += 1
//   }
// })
// console.log('passCount:', passCount)
// // 5. 判空返回提示
// // 请写一个函数 getKeywordText(keyword)
// // 要求：
// // - 如果 keyword 是空字符串，返回 '请输入关键词'
// // - 如果 keyword 不是空字符串，返回 '正在搜索：' + keyword
// const getKeywordText = (keyword) => {
//   if (!keyword) return '请输入关键词'
//   return '正在搜索：' + keyword
// }
// console.log('getKeywordText:', getKeywordText(''))
// // 6. 删除未完成任务
// // 现有数据如下：
// let todoTaskList = [
//   { id: 1, title: '写文档', done: true },
//   { id: 2, title: '修 bug', done: false },
//   { id: 3, title: '发版本', done: true },
//   { id: 4, title: '补测试', done: false },
// ]
// //
// // 请写一个函数 removeUndoTask()
// // 要求：
// // - 删除所有 done 为 false 的项
// // - 直接修改 todoTaskList
// const removeUndoTask = () => {
//   todoTaskList = todoTaskList.filter((item) => item.done)
// }
// removeUndoTask()
// console.log(todoTaskList)
// // 7. 综合题：先过滤，再返回名称
// // 现有数据如下：
// const orderList = [
//   { id: 1, name: '订单A', status: 0 },
//   { id: 2, name: '订单B', status: 1 },
//   { id: 3, name: '订单C', status: 2 },
// ]
// //
// // 请写一个函数 getProcessingOrderNames()
// // 要求：
// // - 先找出 status === 1 的订单
// // - 再返回这些订单的 name 组成的新数组
// // - 结果格式：['订单B']
// const getProcessingOrderNames = () => {
//   return orderList.filter((item) => item.status === 1).map((item) => item.name)
// }
// console.log('getProcessingOrderNames:', getProcessingOrderNames())

// day2
// 第 4 组题：更接近真实页面业务，开始模拟“搜索、筛选、状态、展示数据”

// 1. 商品列表搜索
// 现有数据如下：
// const pageGoodsList = [
//   { id: 1, name: '苹果', price: 80, category: 'fruit' },
//   { id: 2, name: '苹果汁', price: 120, category: 'drink' },
//   { id: 3, name: '香蕉', price: 150, category: 'fruit' },
//   { id: 4, name: '牛奶', price: 110, category: 'drink' },
// ]
// //
// // 请写一个函数 getSearchGoodsList(keyword)
// // 要求：
// // - 如果 keyword 是空字符串，返回原数组
// // - 如果 keyword 不为空，返回 name 里包含 keyword 的商品数组
// const getSearchGoodsList = (keyword) => {
//   if (!keyword) {
//     return pageGoodsList
//   }
//   return pageGoodsList.filter((item) => item.name.includes(keyword))
// }
// console.log('1:', getSearchGoodsList('苹果'))
// // 2. 商品分类页筛选
// // 现有数据如下：
// const categoryGoodsList = [
//   { id: 1, name: '苹果', category: 'fruit', price: 80 },
//   { id: 2, name: '可乐', category: 'drink', price: 90 },
//   { id: 3, name: '香蕉', category: 'fruit', price: 150 },
//   { id: 4, name: '牛奶', category: 'drink', price: 110 },
// ]
// //
// // 请写一个函数 getCategoryGoods(category)
// // 要求：
// // - 返回 category 等于传入值的商品数组
// // - 如果 category 是空字符串，返回原数组
// const getCategoryGoods = (category) => {
//   if (!category) {
//     return categoryGoodsList
//   }
//   return categoryGoodsList.filter((item) => item.category === category)
// }
// console.log('2:', getCategoryGoods('drink'))

// // 3. 页面统计数量
// // 现有数据如下：
// const messageList = [
//   { id: 1, title: '系统通知', read: true },
//   { id: 2, title: '活动消息', read: false },
//   { id: 3, title: '订单提醒', read: false },
// ]
// //
// // 请写代码得到 unreadCount
// // 要求：
// // - 统计 read 为 false 的消息数量
// const unreadCount = messageList.filter((item) => !item.read).length
// console.log('3:', unreadCount)
// // 4. 页面展示文本
// // 现有数据如下：
// const userInfo = {
//   name: 'Tom',
//   vip: true,
// }
// //
// // 请写一个函数 getUserDesc(user)
// // 要求：
// // - 如果 user.vip 为 true，返回 'Tom（VIP用户）'
// // - 如果 user.vip 为 false，返回 'Tom（普通用户）'
// const getUserDesc = (user) => {
//   if (user.vip === true) {
//     return user.name + '（VIP用户）'
//   } else if (user.vip === false) {
//     return user.name + '（普通用户）'
//   }
//   return '错误'
// }
// console.log('4:', getUserDesc(userInfo))
// // 5. 页面空状态判断
// // 请写一个函数 getListEmptyText(list)
// // 要求：
// // - 如果 list.length === 0，返回 '暂无数据'
// // - 否则返回 '列表加载完成'
// const getListEmptyText = (list) => {
//   if (Array.isArray(list) && list.length) {
//     return '列表加载完成'
//   }
//   return '暂无数据'
// }
// console.log('5:', getListEmptyText())
// // 6. 订单状态筛选
// // 现有数据如下：
// const allOrderList = [
//   { id: 1, name: '订单A', status: 'pending' },
//   { id: 2, name: '订单B', status: 'done' },
//   { id: 3, name: '订单C', status: 'pending' },
// ]
// //
// // 请写一个函数 getPendingOrders()
// // 要求：
// // - 返回所有 status === 'pending' 的订单数组
// const getPendingOrders = (list) => {
//   return list.filter((item) => item.status === 'pending')
// }
// console.log('6:', getPendingOrders(allOrderList))

// // 7. 页面展示名称列表
// // 现有数据如下：
// const menuList = [
//   { id: 1, name: '首页' },
//   { id: 2, name: '商品' },
//   { id: 3, name: '我的' },
// ]
// //
// // 请写代码得到 pageMenuNames
// // 要求：
// // - 返回只包含 name 的新数组
// // - 结果格式：['首页', '商品', '我的']
// const pageMenuNames = menuList.map((item) => item.name)
// console.log('7:', pageMenuNames)

// // 8. 综合题：搜索后统计数量
// // 现有数据如下：
// const articleList = [
//   { id: 1, title: 'Vue 入门', category: 'frontend' },
//   { id: 2, title: 'React 基础', category: 'frontend' },
//   { id: 3, title: 'Java 基础', category: 'backend' },
// ]
// //
// // 请写一个函数 getFrontendArticleCount(keyword)
// // 要求：
// // - 先筛选出 category === 'frontend' 的文章
// // - 如果 keyword 不为空，再筛选 title 里包含 keyword 的文章
// // - 最后返回文章数量
// const getFrontendArticleCount = (keyword) => {
//   if (keyword) {
//     return articleList.filter(
//       (item) => item.category === 'frontend' && item.title.includes(keyword)
//     ).length
//   }
//   return articleList.filter((item) => item.category === 'frontend').length
// }
// console.log('8:', getFrontendArticleCount(''))

// day3
// 第 5 组题：进入更真实的页面数据处理，开始组合“筛选、排序、分页、汇总、数据清洗”

// 1. 商品列表综合筛选
// 现有数据如下：
// const goodsList = [
//   { id: 1, name: '苹果', category: 'fruit', price: 80, stock: 10 },
//   { id: 2, name: '苹果汁', category: 'drink', price: 120, stock: 0 },
//   { id: 3, name: '香蕉', category: 'fruit', price: 150, stock: 5 },
//   { id: 4, name: '牛奶', category: 'drink', price: 110, stock: 8 },
//   { id: 5, name: '西瓜', category: 'fruit', price: 90, stock: 0 },
// ]
// // // 请写函数 filterGoods(list, keyword, category)
// // // 要求：
// // // - 先筛选 category
// // // - 如果 keyword 不为空，再筛选 name 里包含 keyword
// // // - 返回筛选后的商品数组
// // // - 如果 category 是空字符串，表示不过滤分类
// const filterGoods = (list, keyword, category) => {
//   let arr = list
//   if (category) {
//     arr = list.filter((item) => item.category === category)
//   }
//   if (keyword) {
//     arr = arr.filter((item) => item.name.includes(keyword))
//   }
//   return arr
// }
// console.log('1:', filterGoods(goodsList, '苹', ''))

// 2. 增加价格区间和库存过滤
// 继续使用上面的 goodsList
// //
// // 请写函数 getAvailableGoods(list, minPrice, maxPrice)
// // 要求：
// // - 只返回 stock > 0 的商品
// // - 只返回 price 在 minPrice 和 maxPrice 之间的商品
// // - 最后按 price 从低到高排序
// // - 返回新数组
// const getAvailableGoods = (list, minPrice, maxPrice) => {
//   let arr = list
//   arr = arr.filter(
//     (item) => item.stock > 0 && item.price >= minPrice && item.price <= maxPrice
//   )
//   for (let i = 0; i < arr.length - 1; i++) {
//     for (let j = 0; j < arr.length - i - 1; j++) {
//       if (arr[j].price > arr[j + 1].price) {
//         let temp = arr[j]
//         arr[j] = arr[j + 1]
//         arr[j + 1] = temp
//       }
//     }
//   }
//   return arr
// }
// console.log('2:', getAvailableGoods(goodsList, 100, 200))
// for (let i = 0; i < 20 - 1; i++) {
//   for (let j = 0; j < 20 - i - 1; j++) {
//     // console.log('i:', i)
//     // console.log('j:', j, 'j+1:', j + 1)
//   }
// }
// // 3. 分页
// // 继续使用上面的 goodsList
// // //
// // // 请写函数 getPageData(list, page, pageSize)
// // // 要求：
// // // - 返回一个对象
// // // - 格式如下：
// // // {
// // //   total: 总条数,
// // //   list: 当前页数据
// // // }
// // // - 例如：page = 2, pageSize = 2
// // // - 就返回第 3、4 条数据组成的新数组

// const getPageData = (list, page, pageSize) => {
//   return {
//     total: list.length,
//     list: list.slice((page - 1) * pageSize, page * pageSize),
//   }
// }
// console.log('3:', getPageData(goodsList, 2, 2))

// // 4. 购物车合并
// // 现有数据如下：
// let cartList = [
//   { skuId: 'a1', name: '苹果', price: 8, count: 2 },
//   { skuId: 'b1', name: '牛奶', price: 12, count: 1 },
// ]
// // //
// // // 请写函数 addCartItem(item)
// // // 要求：
// // // - 如果 cartList 中已经有相同 skuId，就把 count 累加
// // // - 如果没有，就直接新增进去
// // // - 直接修改 cartList
// // //
// // // 再写函数 getCartTotalPrice()
// // // 要求：
// // // - 返回购物车总价
// // // - 总价 = 每项 price * count 后再求和
// const addCartItem = (item) => {
//   const hasItem = cartList.find((i) => i.skuId === item.skuId)
//   if (hasItem) {
//     cartList = cartList.map((i) => {
//       if (i.skuId === item.skuId) {
//         return { ...i, count: i.count + item.count }
//       } else {
//         return i
//       }
//     })
//   } else {
//     cartList = [...cartList, { ...item, count: item.count || 1 }]
//   }
// }
// const getCartTotalPric = () => {
//   let count = 0
//   cartList.forEach((item) => {
//     count += item.price * item.count
//   })
//   return count
// }
// addCartItem({ skuId: 'a1', name: '苹果', price: 8, count: 2 })
// console.log('4:', cartList, getCartTotalPric())

// // 5. 订单统计
// // 现有数据如下：
// const orderList = [
//   { id: 1, name: '订单A', status: 'pending', amount: 120 },
//   { id: 2, name: '订单B', status: 'done', amount: 260 },
//   { id: 3, name: '订单C', status: 'pending', amount: 90 },
//   { id: 4, name: '订单D', status: 'cancel', amount: 300 },
//   { id: 5, name: '订单E', status: 'done', amount: 180 },
// ]
// // //
// // // 请写函数 getOrderSummary(list)
// // // 要求：
// // // - 返回一个对象
// // // - 格式如下：
// // // {
// // //   pendingCount: 0,
// // //   doneCount: 0,
// // //   cancelCount: 0,
// // //   totalAmount: 0
// // // }
// // // - totalAmount 是所有订单金额之和
// const getOrderSummary = (list) => {
//   let data = {
//     pendingCount: 0,
//     doneCount: 0,
//     cancelCount: 0,
//     totalAmount: 0,
//   }

//   list.forEach((i) => {
//     if (i.status === 'pending') {
//       data.pendingCount++
//     } else if (i.status === 'done') {
//       data.doneCount++
//     } else if (i.status === 'cancel') {
//       data.cancelCount++
//     }
//     data.totalAmount += i.amount
//   })

//   return data
// }
// console.log('5:', getOrderSummary(orderList))

// // 6. 数据清洗
// // 现有数据如下：
// const apiUserList = [
//   { id: 1, nickname: 'Tom', age: 20, vip: true },
//   { id: 2, nickname: '', age: 18, vip: false },
//   { id: 3, age: 25, vip: true },
//   { id: 4, nickname: 'Lucy', age: -3, vip: false },
//   { id: 5, nickname: 'Jack', age: 30 },
// ]
// // //
// // // 请写函数 formatUserList(list)
// // // 要求：
// // // - 过滤掉 age <= 0 的项
// // // - 如果没有 nickname 或者是空字符串，补成 '匿名用户'
// // // - 如果没有 vip，补成 false
// // // - 最后返回新数组，格式如下：
// // // [
// // //   { id: 1, name: 'Tom', age: 20, vipText: 'VIP用户' },
// // //   { id: 2, name: '匿名用户', age: 18, vipText: '普通用户' },
// // // ]
// const formatUserList = (list) => {
//   let newList = list
//   newList = newList
//     .filter((i) => i.age >= 0)
//     .map((i) => {
//       const name = i.nickname ? i.nickname : '匿名用户'
//       const vipText = i.vip ? 'VIP用户' : '普通用户'
//       return {
//         id: i.id,
//         name: name,
//         age: i.age,
//         vipText: vipText,
//       }
//     })
//   return newList
// }
// console.log('6:', formatUserList(apiUserList))

// // 7. 综合一点的订单列表处理
// // 现有数据如下：
// const orderPageList = [
//   { id: 1, title: 'Vue 课程', status: 'paid', amount: 199, createTime: '2026-05-01' },
//   {
//     id: 2,
//     title: 'React 课程',
//     status: 'pending',
//     amount: 299,
//     createTime: '2026-05-03',
//   },
//   { id: 3, title: 'Java 课程', status: 'paid', amount: 399, createTime: '2026-05-02' },
//   { id: 4, title: 'Go 课程', status: 'cancel', amount: 99, createTime: '2026-05-04' },
//   { id: 5, title: 'Vue 实战', status: 'paid', amount: 259, createTime: '2026-05-05' },
// ]
// // //
// // // 请写函数 getOrderPageList(list, keyword, status, sortType)
// // // 要求：
// // // - 如果 keyword 不为空，筛选 title 包含 keyword
// // // - 如果 status 不为空，筛选对应状态
// // // - 如果 sortType === 'amountDesc'，按金额从高到低排序
// // // - 如果 sortType === 'timeDesc'，按时间从新到旧排序
// // // - 返回处理后的新数组
// const getOrderPageList = (list, keyword, status, sortType) => {
//   let newArr = list
//   if (keyword) {
//     newArr = newArr.filter((i) => i.title.includes(keyword))
//   }
//   if (status) {
//     newArr = newArr.filter((i) => i.status === status)
//   }
//   if (sortType === 'amountDesc') {
//     newArr.sort((a, b) => b.amount - a.amount)
//   } else if (sortType === 'timeDesc') {
//     newArr.sort((a, b) => b.createTime.localeCompare(a.createTime))
//   }
//   return newArr
// }
// console.log('7:', getOrderPageList(orderPageList, '', '', 'timeDesc'))
// // 8. 最终综合题
// // 基于第 7 题数据，再写函数 getOrderPageResult(list, params)
// // 其中 params 格式如下：
// // {
// //   keyword: '',
// //   status: '',
// //   sortType: 'timeDesc',
// //   page: 1,
// //   pageSize: 2
// // }
// // //
// // // 要求：
// // // - 先完成搜索、状态筛选、排序
// // // - 再做分页
// // // - 最后返回：
// // // {
// // //   total: 0,
// // //   list: [],
// // //   emptyText: ''
// // // }
// // // - emptyText 规则：
// // //   - 如果结果为空，返回 '暂无数据'
// // //   - 否则返回 '列表加载完成'
// const getOrderPageResult = (list, params) => {
//   let newArr = list
//   let param = params
//   if (param.keyword) {
//     newArr = newArr.filter((i) => i.title.includes(param.keyword))
//   }
//   if (param.status) {
//     newArr = newArr.filter((i) => i.status === param.status)
//   }
//   if (param.sortType === 'timeDesc') {
//     newArr = newArr.sort((a, b) => b.createTime.localeCompare(a.createTime))
//   } else if (param.sortType === 'amountDesc') {
//     newArr = newArr.sort((a, b) => b.amount - a.amount)
//   }

//   return {
//     total: newArr.length,
//     list: newArr.slice((param.page - 1) * param.pageSize, param.page * param.pageSize),
//     emptyText: newArr.length ? '列表加载完成' : '暂无数据',
//   }
// }
// console.log(
//   '8:',
//   getOrderPageResult(orderPageList, {
//     keyword: '',
//     status: '',
//     sortType: 'timeDesc',
//     page: 2,
//     pageSize: 2,
//   })
// )

// day4
// 第 5 组题：表单和校验。重点练输入处理、必填校验、格式判断、提交前检查。

// 1. 用户名校验
// 请写一个函数 validateUsername(username)
// 要求：
// - 如果 username 是空字符串，返回 '用户名不能为空'
// - 如果 username 长度小于 3，返回 '用户名不能少于3位'
// - 否则返回 '校验通过'

// 2. 密码校验
// 请写一个函数 validatePassword(password)
// 要求：
// - 如果 password 是空字符串，返回 '密码不能为空'
// - 如果 password 长度小于 6，返回 '密码不能少于6位'
// - 否则返回 '校验通过'

// 3. 手机号校验
// 请写一个函数 validatePhone(phone)
// 要求：
// - 如果 phone 是空字符串，返回 '手机号不能为空'
// - 如果 phone 长度不等于 11，返回 '手机号长度不正确'
// - 否则返回 '校验通过'

// 4. 登录表单整体校验
// 现有数据如下：
// const loginForm = {
//   username: '',
//   password: '',
// }
//
// 请写一个函数 validateLoginForm(form)
// 要求：
// - 先校验 username
// - 再校验 password
// - 只要有一项不通过，就直接返回对应提示
// - 都通过时返回 '登录表单校验通过'

// 5. 注册表单校验
// 现有数据如下：
// const registerForm = {
//   username: '',
//   password: '',
//   confirmPassword: '',
// }
//
// 请写一个函数 validateRegisterForm(form)
// 要求：
// - username 不能为空
// - password 不能为空且长度不能少于 6
// - confirmPassword 必须和 password 一致
// - 全部通过返回 '注册表单校验通过'

// 6. 表单重置
// 现有数据如下：
// let searchForm = {
//   keyword: '苹果',
//   category: 'fruit',
// }
//
// 请写一个函数 resetSearchForm()
// 要求：
// - 调用后把 searchForm 重置成：
//   {
//     keyword: '',
//     category: '',
//   }
// - 直接修改 searchForm

// 7. 提交按钮状态
// 请写一个函数 getSubmitDisabled(form)
// 现有表单格式如下：
// {
//   username: '',
//   password: '',
// }
//
// 要求：
// - 只要 username 或 password 有一个为空字符串，返回 true
// - 否则返回 false

// 8. 表单提示文本
// 请写一个函数 getFormTip(form)
// 现有表单格式如下：
// {
//   keyword: '',
//   status: '',
// }
//
// 要求：
// - 如果 keyword 和 status 都为空，返回 '请先输入筛选条件'
// - 否则返回 '正在筛选数据'

// 9. 编辑表单回填
// 现有数据如下：
// const detailData = {
//   id: 1,
//   title: 'Vue 实战',
//   category: 'frontend',
// }
//
// let editForm = {
//   title: '',
//   category: '',
// }
//
// 请写一个函数 fillEditForm(data)
// 要求：
// - 把 data.title 赋值给 editForm.title
// - 把 data.category 赋值给 editForm.category
// - 直接修改 editForm

// 10. 综合题：提交前校验
// 现有数据如下：
// const submitForm = {
//   username: 'tom',
//   password: '123456',
//   phone: '13800138000',
// }
//
// 请写一个函数 handleSubmit(form)
// 要求：
// - 依次校验 username、password、phone
// - 只要有一项不通过，直接返回对应提示
// - 如果全部通过，返回 '提交成功'
</script>
