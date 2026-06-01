<template>
  <div ref="chartRef" class="vchart-panel"></div>
</template>

<script setup lang="ts">
import { VChart, type ISpec } from '@visactor/vchart'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  spec: ISpec
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chart: VChart | null = null

function renderChart() {
  if (!chartRef.value) {
    return
  }

  if (chart) {
    chart.release()
    chart = null
  }

  chart = new VChart(props.spec, {
    dom: chartRef.value,
  })
  chart.renderSync()
}

onMounted(() => {
  renderChart()
})

watch(
  () => props.spec,
  () => {
    renderChart()
  },
  {
    deep: true,
  }
)

onBeforeUnmount(() => {
  chart?.release()
  chart = null
})
</script>

<style scoped lang="scss">
.vchart-panel {
  width: 100%;
  height: 320px;
}
</style>
