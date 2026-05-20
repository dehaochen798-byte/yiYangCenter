<template>
  <div class="auth-layout">
    <div class="auth-layout__panel">
      <router-view />
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgb(232 244 236 / 96%), transparent 34%),
    linear-gradient(180deg, #f8fbf8 0%, #edf5ef 100%);

  &__panel {
    width: min(100%, 1120px);
  }
}
</style>
