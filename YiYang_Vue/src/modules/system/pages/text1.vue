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
          style="width: 140px"
          value-key=""
          placeholder="请选择"
          clearable
          filterable
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
    <el-button type="primary" size="default" style="width: 100%" @click="onAddItem()"
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

//增删改查
function onAddItem() {
  tableData.push(...generateMockList(1))
}
function onDeleteItem(item: ListItem) {
  const deleteIndex = tableData.findIndex((data) => data.id === item.id)
  if (deleteIndex !== -1) {
    tableData.splice(deleteIndex, 1)
  }
}
function inputChange() {}
</script>
