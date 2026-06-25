<template>
  <div class="crud-page-shell">
    <el-card shadow="never" class="crud-page-shell__hero">
      <div class="crud-page-shell__hero-content">
        <div>
          <p class="crud-page-shell__eyebrow">{{ eyebrow }}</p>
          <h2>{{ title }}</h2>
          <span>{{ description }}</span>
        </div>
        <slot name="hero-extra" />
      </div>
    </el-card>

    <el-row :gutter="18" class="crud-page-shell__content">
      <el-col :xs="24" :xl="fullWidth ? 24 : 16">
        <el-card shadow="never" class="crud-page-shell__card">
          <template #header>
            <div class="crud-page-shell__section-header">
              <div>
                <h3>{{ tableTitle }}</h3>
                <p>{{ tableDescription }}</p>
              </div>
              <slot name="table-actions" />
            </div>
          </template>

          <slot name="table" />
        </el-card>
      </el-col>

      <el-col v-if="!fullWidth" :xs="24" :xl="8">
        <el-card shadow="never" class="crud-page-shell__card">
          <template #header>
            <div class="crud-page-shell__section-header">
              <div>
                <h3>{{ formTitle }}</h3>
                <p>{{ formDescription }}</p>
              </div>
              <slot name="form-actions" />
            </div>
          </template>

          <slot name="form" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
  tableTitle: string
  tableDescription: string
  formTitle?: string
  formDescription?: string
  fullWidth?: boolean
}>()
</script>

<style scoped lang="scss">
.crud-page-shell {
  display: grid;
  gap: 18px;

  &__hero,
  &__card {
    background: var(--yy-color-surface);
    border: 1px solid var(--yy-color-border);
    border-radius: var(--yy-radius-lg);
    box-shadow: var(--yy-shadow-card);
  }

  &__hero {
    overflow: hidden;
    background:
      radial-gradient(circle at top right, rgb(250 236 194 / 50%), transparent 26%),
      linear-gradient(135deg, rgb(242 248 244 / 96%), rgb(255 255 255 / 96%));
  }

  &__hero-content {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    justify-content: space-between;

    h2 {
      margin: 0 0 10px;
      font-size: 28px;
      color: var(--yy-color-text);
    }

    span {
      display: block;
      max-width: 680px;
      line-height: 1.7;
      color: var(--yy-color-text-secondary);
    }
  }

  &__eyebrow {
    margin: 0 0 10px;
    font-size: 12px;
    font-weight: 700;
    color: var(--yy-color-primary);
    text-transform: uppercase;
    letter-spacing: 0.14em;
  }

  &__content {
    margin: 0;
  }

  &__section-header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;

    h3 {
      margin: 0 0 6px;
      font-size: 18px;
      color: var(--yy-color-text);
    }

    p {
      margin: 0;
      font-size: 13px;
      color: var(--yy-color-text-secondary);
    }
  }
}

@media (max-width: 900px) {
  .crud-page-shell {
    &__hero-content,
    &__section-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}
</style>
