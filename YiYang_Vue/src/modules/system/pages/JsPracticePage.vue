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

// 1. 商品搜索 + 价格过滤
// 现有数据如下：
const goodsList = [
  { id: 1, name: '苹果', price: 80 },
  { id: 2, name: '苹果汁', price: 120 },
  { id: 3, name: '香蕉', price: 150 },
  { id: 4, name: '西瓜', price: 90 },
]
//
// 请写一个函数 searchGoods(keyword)
// 要求：
// - 返回 name 里包含 keyword 的商品
// - 并且这些商品的 price 必须大于 100
// - 如果 keyword 是空字符串，返回所有 price 大于 100 的商品
const searchGoods = (keyword) => {
  let arr
  if (keyword) {
    arr = goodsList.filter((item) => item.name.includes(keyword))
  } else {
    arr = goodsList
  }
  return arr.filter((item) => item.price > 100)
}
searchGoods('西瓜')
// 2. 处理用户名数组
// 现有数据如下：
const usersList = [
  { id: 1, name: 'tom' },
  { id: 2, name: 'jack' },
  { id: 3, name: 'lucy' },
]
//
// 请写代码得到一个新数组 nameList
// 要求：
// - 数组内容只包含 name
// - 结果格式：['tom', 'jack', 'lucy']
let nameList = usersList.map((item) => item.name)
console.log('namelist:', nameList)
// 3. 查找符合条件的第一个商品
// 现有数据如下：
const productList = [
  { id: 1, name: '键盘', stock: 0 },
  { id: 2, name: '鼠标', stock: 5 },
  { id: 3, name: '屏幕', stock: 10 },
]
//
// 请写代码找到第一个 stock 大于 0 的商品
// 结果赋值给 firstAvailableProduct
let firstAvailableProduct = productList.find((item) => item.stock > 0)
console.log(firstAvailableProduct)
// 4. 状态判断函数
// 请写一个函数 getStatusText(status)
// 要求：
// - status === 0 返回 '待开始'
// - status === 1 返回 '进行中'
// - status === 2 返回 '已完成'
// - 其他返回 '未知状态'
const getStatusText = (status) => {
  if (status === 0) {
    return '待开始'
  } else if (status === 1) {
    return '进行中'
  } else if (status === 2) {
    return '已完成'
  } else {
    return '未知状态'
  }
}
getStatusText(1)
// 5. 删除指定分类商品
// 现有数据如下：
let cartList = [
  { id: 1, name: '苹果', category: 'fruit' },
  { id: 2, name: '可乐', category: 'drink' },
  { id: 3, name: '香蕉', category: 'fruit' },
  { id: 4, name: '牛奶', category: 'drink' },
]
//
// 请写一个函数 removeByCategory(category)
// 要求：
// - 调用 removeByCategory('fruit') 后
// - cartList 中只保留 category 不等于 'fruit' 的项
// - 直接修改 cartList 变量
const removeByCategory = (category) => {
  cartList = cartList.filter((item) => item.category != category)
}
removeByCategory('fruit')
console.log(cartList)
// 6. 组合题：先筛选，再转换
// 现有数据如下：
const scoreList = [
  { id: 1, name: '小明', score: 56 },
  { id: 2, name: '小红', score: 87 },
  { id: 3, name: '小刚', score: 92 },
]
//
// 请写代码得到一个新数组 passedNames
// 要求：
// - 先找出 score 大于等于 60 的人
// - 再把这些人的 name 取出来
// - 结果格式：['小红', '小刚']
let passedNames = scoreList.filter((item) => item.score >= 60).map((item) => item.name)
console.log(passedNames)

// day1
// 第 3 组题：开始加入多条件、判空、简单统计，还是以数组处理和条件判断为主

// 1. 多条件搜索商品
// 现有数据如下：
const shopList = [
  { id: 1, name: '苹果', price: 80, category: 'fruit' },
  { id: 2, name: '苹果汁', price: 120, category: 'drink' },
  { id: 3, name: '香蕉', price: 150, category: 'fruit' },
  { id: 4, name: '可乐', price: 90, category: 'drink' },
]
//
// 请写一个函数 filterShopList(keyword, category)
// 要求：
// - name 里包含 keyword
// - category 必须等于传入的 category
// - 如果 keyword 是空字符串，就只按 category 过滤
// - 返回过滤后的新数组
const filterShopList=(keyword, category)=>{
  
}
// 2. 找出第一个未完成任务
// 现有数据如下：
// const taskList = [
//   { id: 1, title: '写页面', done: true },
//   { id: 2, title: '联调接口', done: false },
//   { id: 3, title: '提测', done: false },
// ]
//
// 请写代码找到第一个 done 为 false 的任务
// 结果赋值给 firstUndoTask

// 3. 只保留库存大于 0 的商品名
// 现有数据如下：
// const stockList = [
//   { id: 1, name: '键盘', stock: 0 },
//   { id: 2, name: '鼠标', stock: 3 },
//   { id: 3, name: '耳机', stock: 8 },
// ]
//
// 请写代码得到一个新数组 stockNameList
// 要求：
// - 先筛选出 stock 大于 0 的项
// - 再把这些项的 name 组成一个新数组
// - 结果格式：['鼠标', '耳机']

// 4. 统计及格人数
// 现有数据如下：
// const examList = [
//   { id: 1, name: '小明', score: 58 },
//   { id: 2, name: '小红', score: 76 },
//   { id: 3, name: '小刚', score: 91 },
//   { id: 4, name: '小丽', score: 43 },
// ]
//
// 请写代码统计 score 大于等于 60 的人数
// 结果赋值给 passCount

// 5. 判空返回提示
// 请写一个函数 getKeywordText(keyword)
// 要求：
// - 如果 keyword 是空字符串，返回 '请输入关键词'
// - 如果 keyword 不是空字符串，返回 '正在搜索：' + keyword

// 6. 删除未完成任务
// 现有数据如下：
// let todoTaskList = [
//   { id: 1, title: '写文档', done: true },
//   { id: 2, title: '修 bug', done: false },
//   { id: 3, title: '发版本', done: true },
//   { id: 4, title: '补测试', done: false },
// ]
//
// 请写一个函数 removeUndoTask()
// 要求：
// - 删除所有 done 为 false 的项
// - 直接修改 todoTaskList

// 7. 综合题：先过滤，再返回名称
// 现有数据如下：
// const orderList = [
//   { id: 1, name: '订单A', status: 0 },
//   { id: 2, name: '订单B', status: 1 },
//   { id: 3, name: '订单C', status: 2 },
// ]
//
// 请写一个函数 getProcessingOrderNames()
// 要求：
// - 先找出 status === 1 的订单
// - 再返回这些订单的 name 组成的新数组
// - 结果格式：['订单B']

</script>
