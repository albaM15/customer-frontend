<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthLayout from './AuthLayout.vue'

const router = useRouter()
const route = useRoute()
const displayEmail = computed(() => route.query.email || 'your email address')
const code = ref(['', '', '', '', '', ''])
const inputRefs = ref([])

const handleInput = (e, index) => {
  const value = e.target.value
  
  if (value && index < 5) {
    inputRefs.value[index + 1].focus()
  }
}

const handleKeydown = (e, index) => {
  if (e.key === 'Backspace' && !code.value[index] && index > 0) {
    inputRefs.value[index - 1].focus()
  }
}

const handleVerify = () => {
  const fullCode = code.value.join('')
  if (fullCode.length === 6) {
    router.push('/reset-password')
  }
}
</script>

<template>
  <AuthLayout>
    <div class="top-bar">
      <button class="back-btn" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"></path>
        </svg>
      </button>
    </div>

    <div class="header">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
          <path d="M7 8h.01"></path>
          <path d="M12 8h.01"></path>
          <path d="M17 8h.01"></path>
          <path d="M7 12h.01"></path>
          <path d="M12 12h.01"></path>
          <path d="M17 12h.01"></path>
          <path d="M7 16h.01"></path>
          <path d="M12 16h.01"></path>
          <path d="M17 16h.01"></path>
        </svg>
      </div>
      <h2 class="title">Enter Code</h2>
      <p class="subtitle">We sent a secure 6-digit code to<br><span class="email-highlight">{{ displayEmail }}</span></p>
    </div>

    <form @submit.prevent="handleVerify" class="form">
      <div class="code-inputs">
        <input 
          v-for="(digit, index) in code" 
          :key="index"
          type="text"
          inputmode="numeric"
          maxlength="1"
          v-model="code[index]"
          @input="handleInput($event, index)"
          @keydown="handleKeydown($event, index)"
          ref="inputRefs"
          class="code-input"
        />
      </div>

      <button type="submit" class="btn-primary" :disabled="code.join('').length !== 6">
        Verify & Proceed
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </button>

      <div class="footer-links">
        <span>Didn't receive code? </span>
        <a href="#" class="accent">Resend code</a>
      </div>
    </form>
  </AuthLayout>
</template>

<style scoped>
.top-bar {
  margin-bottom: 20px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  transition: background 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-container {
  width: 56px;
  height: 56px;
  background: rgba(92, 97, 255, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-accent);
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.email-highlight {
  color: var(--text-primary);
  font-weight: 500;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.code-inputs {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.code-input {
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  padding: 0;
  background: var(--input-bg);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.code-input:focus {
  background: rgba(48, 197, 255, 0.05);
  border-color: var(--text-accent);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.footer-links {
  text-align: center;
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
