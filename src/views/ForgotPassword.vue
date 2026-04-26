<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { resetPassword } from 'aws-amplify/auth'
import AuthLayout from './AuthLayout.vue'

const router = useRouter()
const email = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const handleSendCode = async () => {
  if (email.value) {
    try {
      isSubmitting.value = true
      errorMessage.value = ''
      
      const output = await resetPassword({ username: email.value })
      
      // Navigate to reset password page passing the email
      router.push({ path: '/reset-password', query: { email: email.value } })
    } catch (error) {
      console.error('Error sending reset code:', error)
      errorMessage.value = error.message || 'Error sending code. Please check your email.'
    } finally {
      isSubmitting.value = false
    }
  }
}
</script>

<template>
  <AuthLayout>
    <div class="header">
      <h1 class="logo"><span class="meet">Meet</span><span class="one">One</span></h1>
      <h2 class="title">Recover your password</h2>
      <p class="subtitle">Enter your email to receive a reset code.</p>
    </div>

    <form @submit.prevent="handleSendCode" class="form">
      <div class="input-group">
        <div class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
        </div>
        <input 
          type="email" 
          v-model="email" 
          placeholder="Email address" 
          required 
        />
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <button type="submit" class="btn-primary" :disabled="isSubmitting">
        {{ isSubmitting ? 'Sending...' : 'Send Code' }}
        <svg v-if="!isSubmitting" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </button>

      <div class="footer-links">
        <span>Remember your password? </span>
        <router-link to="/sign-in" class="accent">Log in</router-link>
      </div>
    </form>
  </AuthLayout>
</template>

<style scoped>
.header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.5px;
}

.meet {
  color: #6292FF;
}

.one {
  color: #30C5FF;
}

.title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

input {
  padding-left: 44px;
}

.footer-links {
  text-align: center;
  margin-top: 16px;
  font-size: 13px;
  color: var(--text-secondary);
}

.error-message {
  color: #ff6b6b;
  font-size: 13px;
  text-align: center;
  background: rgba(255, 107, 107, 0.1);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 107, 0.2);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
