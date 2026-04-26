<script setup>
</script>

<template>
  <main class="auth-layout">
    <div class="auth-card">
      <slot></slot>
    </div>
  </main>
</template>

<style scoped>
.auth-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  padding: 20px;
}

.auth-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
</style>
