<template>
  <div class="js-lab-page">
    <div class="js-lab-page__topbar">
      <el-button plain round @click="router.push('/auth/login')">返回登录</el-button>
      <el-tag type="success" effect="light">独立测试页</el-tag>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :xl="15">
        <el-card shadow="never" class="js-lab-page__hero">
          <template #header>
            <div class="page-header">
              <div>
                <h2>JavaScript 基本功测试页</h2>
                <span>这个页面只用于练习，不和业务系统其他界面关联。</span>
              </div>
            </div>
          </template>

          <el-space wrap>
            <el-tag v-for="topic in practiceTopics" :key="topic" round>
              {{ topic }}
            </el-tag>
          </el-space>

          <div class="js-lab-page__section">
            <h3>数组练习</h3>
            <el-input
              v-model="numbersInput"
              placeholder="请输入逗号分隔的数字"
            />
            <el-button type="primary" @click="runArrayPractice">
              运行数组练习
            </el-button>
          </div>

          <div class="js-lab-page__section">
            <h3>字符串练习</h3>
            <el-input
              v-model="sentenceInput"
              type="textarea"
              :rows="3"
              placeholder="输入一句练习文本"
            />
            <el-button type="primary" @click="runStringPractice">
              运行字符串练习
            </el-button>
          </div>

          <div class="js-lab-page__section">
            <h3>对象练习</h3>
            <p>点击后会展示一个养老客户对象的常见 JS 操作结果。</p>
            <el-button type="primary" @click="runObjectPractice">
              运行对象练习
            </el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :xl="9">
        <el-card shadow="never" class="js-lab-page__result">
          <template #header>
            <div class="page-header">
              <div>
                <h2>输出结果</h2>
                <span>建议先猜结果，再点按钮验证。</span>
              </div>
              <el-button link @click="clearOutput">清空</el-button>
            </div>
          </template>

          <el-empty
            v-if="output.length === 0"
            description="运行任意练习后会在这里显示结果"
          />

          <div v-else class="js-lab-page__output-list">
            <div
              v-for="item in output"
              :key="item.label"
              class="js-lab-page__output-item"
            >
              <strong>{{ item.label }}</strong>
              <pre>{{ item.value }}</pre>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const numbersInput = ref('3, 7, 2, 9, 4, 12')
const sentenceInput = ref('颐养中心欢迎你坚持练习 JavaScript 基本功')
const output = ref([])

const parsedNumbers = computed(() =>
  numbersInput.value
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((item) => !Number.isNaN(item))
)

function setOutput(items) {
  output.value = items
}

function runArrayPractice() {
  const numbers = parsedNumbers.value

  setOutput([
    { label: '原始数组', value: JSON.stringify(numbers) },
    { label: 'map * 2', value: JSON.stringify(numbers.map((item) => item * 2)) },
    { label: 'filter 偶数', value: JSON.stringify(numbers.filter((item) => item % 2 === 0)) },
    { label: 'reduce 求和', value: numbers.reduce((sum, item) => sum + item, 0) },
    { label: 'sort 升序', value: JSON.stringify([...numbers].sort((a, b) => a - b)) },
  ])
}

function runStringPractice() {
  const text = sentenceInput.value.trim()
  const words = text.split(/\s+/).filter(Boolean)

  setOutput([
    { label: '原始字符串', value: text },
    { label: '长度', value: text.length },
    { label: '去空格后', value: text.replace(/\s+/g, '') },
    { label: '按空格分词', value: JSON.stringify(words) },
    { label: '是否包含 JavaScript', value: text.includes('JavaScript') ? '是' : '否' },
  ])
}

function runObjectPractice() {
  const resident = {
    id: 'C20260520',
    realName: '张阿姨',
    age: 68,
    room: '2-302',
    tags: ['膳食定制', '护理二级'],
  }

  const { realName, room, tags } = resident

  setOutput([
    { label: '原对象', value: JSON.stringify(resident, null, 2) },
    { label: '解构后的姓名', value: realName },
    { label: '模板字符串', value: `${realName} 当前入住 ${room}` },
    { label: '展开运算符合并', value: JSON.stringify({ ...resident, status: '在住' }) },
    { label: 'tags join', value: tags.join('、') },
  ])
}

function clearOutput() {
  output.value = []
}

const practiceTopics = [
  '变量、作用域、数据类型',
  '数组 map / filter / reduce / sort',
  '字符串 split / trim / includes / replace',
  '对象解构、展开运算符、模板字符串',
  '条件判断、循环、函数封装',
]
</script>

<style scoped lang="scss">
.js-lab-page {
  width: min(1200px, 100%);
  margin: 0 auto;

  &__topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__hero,
  &__result {
    border-radius: 24px;
  }

  &__section {
    display: grid;
    gap: 12px;
    padding-top: 24px;
    margin-top: 24px;
    border-top: 1px solid rgb(79 120 97 / 14%);

    h3,
    p {
      margin: 0;
    }

    h3 {
      font-size: 18px;
      color: #1e3a33;
    }

    p {
      font-size: 14px;
      color: #6d857c;
    }
  }

  &__output-list {
    display: grid;
    gap: 14px;
  }

  &__output-item {
    padding: 16px;
    color: #33554a;
    background: #f4f8f5;
    border: 1px solid rgb(79 120 97 / 12%);
    border-radius: 16px;

    strong {
      display: block;
      margin-bottom: 8px;
    }

    pre {
      margin: 0;
      overflow-x: auto;
      font-family: 'Cascadia Code', Consolas, monospace;
      font-size: 13px;
      line-height: 1.6;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }
  }
}

@media (max-width: 960px) {
  .js-lab-page {
    &__topbar {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
  }
}
</style>
