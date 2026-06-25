<template>
  <div class="oneweek-oneday">
    <el-input
      v-model="inputOfName"
      style="width: 100%"
      :placeholder="`${searchType}搜索`"
      clearable
      @input="inputChange()"
    >
      <template #prepend>
        <el-select
          v-model="searchType"
          value-key=""
          placeholder="请选择"
          clearable
          filterable
          @change=""
          style="width: 140px"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </template>
    </el-input>
    <el-table :data="showData" style="width: 100%">
      <el-table-column prop="id" label="Date" width="180" />
      <el-table-column prop="name" label="Name" width="180" />
      <el-table-column prop="phone" label="Phone" />
      <el-table-column fixed="right" prop="phone" label="操作">
        <template #default="scope">
          <el-button type="primary" size="default" @click="onDeleteItem(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-button type="primary" size="default" @click="onAddItem()" style="width: 100%"
      >增加行</el-button
    >
  </div>
</template>
<script setup lang="ts">
const tableData = reactive<ListItem[]>(generateMockList(10))
const searchType = ref<string>('')
const inputOfName = ref<string>('')
let options = [
  {
    value: 'id',
    label: 'id',
  },
  {
    value: 'name',
    label: '名称',
  },
]
const showData = computed(() => {
  if (inputOfName) {
    return tableData.filter((item) => item.name.includes(inputOfName.value))
  } else {
    return tableData
  }
})

//树形假数据模版
interface TreeNode {
  id: number
  parentId: number
  label: string
  children?: TreeNode[]
}

/**
 * 生成树形测试假数据
 * @param level 树最大层级
 * @param childCount 每一层子节点数量
 * @param parentId 父ID（递归内部使用，外部不用传）
 * @returns 标准树形数组
 */
function generateTreeData(level: number, childCount: number, parentId = 0): TreeNode[] {
  const tree: TreeNode[] = []
  for (let i = 1; i <= childCount; i++) {
    const id = parentId * 10 + i
    // 显式标注 node 类型为 TreeNode，TS识别 children 是可选属性
    const node: TreeNode = {
      id,
      parentId,
      label: `节点-${parentId === 0 ? '根' : parentId}-${id}`,
    }
    if (level > 1) {
      node.children = generateTreeData(level - 1, childCount, id)
    }
    tree.push(node)
  }
  return tree
}

// 使用示例
const treeList = generateTreeData(3, 2)
// console.log(treeList)

// 定义列表项类型，可自行增删字段
interface ListItem {
  id: number
  name: string
  phone: string
  amountCent: number // 金额 分为单位
  status: 0 | 1 // 0禁用 1正常
  createTime: string
}

/**
 * 生成模拟列表数组
 * @param count 生成多少条数据
 * @returns ListItem[] 模拟数组
 */
function generateMockList(count: number): ListItem[] {
  const list: ListItem[] = []
  for (let i = 1; i <= count; i++) {
    list.push({
      id: i,
      name: `测试用户${i}`,
      phone: `138${Math.floor(Math.random() * 90000000 + 10000000)}`,
      amountCent: Math.floor(Math.random() * 200000), // 0 ~ 2000元
      status: Math.random() > 0.4 ? 1 : 0,
      createTime: `2026-0${Math.floor(Math.random() * 9 + 1)}-${Math.floor(Math.random() * 28 + 1)} 10:30:00`,
    })
  }
  return list
}

// 使用
console.log(tableData)

//增删改查
function onAddItem() {
  tableData.push(...generateMockList(1))
  console.log('增加后', tableData)
}
function onDeleteItem(item: ListItem) {
  console.log('item:', item)
  const deleteIndex = tableData.findIndex((data) => data.id === item.id)
  if (deleteIndex !== -1) {
    tableData.splice(deleteIndex, 1)
    console.log('删除后：', tableData)
  } else {
    console.warn('没有找到删除对象：', item)
  }
}
function inputChange() {}
</script>
