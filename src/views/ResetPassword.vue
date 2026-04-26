<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { confirmResetPassword } from 'aws-amplify/auth'
import AuthLayout from './AuthLayout.vue'

const router = useRouter()
const route = useRoute()
const password = ref('')
const confirmPassword = ref('')
const confirmationCode = ref('')
const showPassword = ref(false)
const displayEmail = computed(() => route.query.email || '')
const errorMessage = ref('')
const isSubmitting = ref(false)

const handleReset = async () => {
  if (password.value === confirmPassword.value && password.value.length >= 8 && confirmationCode.value) {
    try {
      isSubmitting.value = true
      errorMessage.value = ''
      
      await confirmResetPassword({
        username: displayEmail.value,
        confirmationCode: confirmationCode.value,
        newPassword: password.value
      })
      
      // Successful reset, redirect to login
      router.push('/sign-in')
    } catch (error) {
      console.error('Error confirming reset password:', error)
      errorMessage.value = error.message || 'Error resetting password. Please try again.'
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
      <h2 class="title">Set new password</h2>
      <p class="subtitle">Create a strong new password for your account.</p>
    </div>

    <form @submit.prevent="handleReset" class="form">
      <div class="input-group">
        <div class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        <input 
          type="text" 
          v-model="confirmationCode" 
          placeholder="Confirmation Code" 
          required 
        />
      </div>
      <div class="input-group">
        <div class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <input 
          :type="showPassword ? 'text' : 'password'" 
          v-model="password" 
          placeholder="New Password" 
          required 
          minlength="8"
        />
        <button type="button" class="toggle-password" @click="showPassword = !showPassword">
          <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
            <line x1="2" x2="22" y1="2" y2="22"></line>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      </div>

      <div class="input-group">
        <div class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <input 
          :type="showPassword ? 'text' : 'password'" 
          v-model="confirmPassword" 
          placeholder="Confirm Password" 
          required 
          minlength="8"
        />
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <button type="submit" class="btn-primary" :disabled="password !== confirmPassword || password.length < 8 || !confirmationCode || isSubmitting">
        {{ isSubmitting ? 'Resetting...' : 'Reset Password' }}
        <svg v-if="!isSubmitting" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </button>
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

.toggle-password {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
}

.toggle-password:hover {
  color: var(--text-primary);
}

input {
  padding-left: 44px;
  padding-right: 44px;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
</style>
