<template>
  <div class="page-section-header">
    <div>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
    <slot name="extra" />
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
})
</script>
