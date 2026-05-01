<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signIn, fetchAuthSession } from 'aws-amplify/auth'
import AuthLayout from './AuthLayout.vue'

const router = useRouter()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)

const handleSignIn = async () => {
  if (email.value && password.value) {
    try {
      isSubmitting.value = true
      errorMessage.value = ''

      const { isSignedIn, nextStep } = await signIn({
        username: email.value,
        password: password.value,
      })

      if (isSignedIn) {
        try {
          const session = await fetchAuthSession()
          const token = session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString()
          
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
          const response = await fetch(`${apiUrl}/users/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.status === 404 || !response.ok) {
            router.push('/create-profile')
          } else {
            router.push('/')
          }
        } catch (error) {
          console.error('Error fetching user profile:', error)
          // Fallback to create-profile if we can't verify
          router.push('/create-profile')
        }
      }
    } catch (error) {
      console.error('Error signing in:', error)
      errorMessage.value = error.message || 'Invalid email or password.'
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
      <p class="subtitle">Log in to spark a new connection.</p>
    </div>

    <form @submit.prevent="handleSignIn" class="form">
      <div class="input-group">
        <div class="input-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
        </div>
        <input type="email" v-model="email" placeholder="Email address" required />
      </div>

      <div class="input-group">
        <div class="input-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <input type="password" v-model="password" placeholder="Password" required />
      </div>

      <div class="form-options">
        <label class="checkbox-container">
          <input type="checkbox" v-model="rememberMe" />
          <span class="checkmark"></span>
          <span class="label-text">Remember me</span>
        </label>
        <router-link to="/forgot-password" class="forgot-link">Forgot password?</router-link>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <button type="submit" class="btn-primary" :disabled="isSubmitting">
        {{ isSubmitting ? 'Signing In...' : 'Sign In' }}
        <svg
          v-if="!isSubmitting"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </button>

      <div class="footer-links">
        <span>Don't have an account? </span>
        <router-link to="/sign-up" class="accent">Sign up</router-link>
      </div>

      <div class="guest-link-container">
        <router-link to="/" class="guest-link">
          Continue as Guest
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="margin-left: 4px"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </router-link>
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
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.meet {
  color: #6292ff;
}

.one {
  color: #30c5ff;
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

input[type='email'],
input[type='password'] {
  padding-left: 44px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  color: var(--text-secondary);
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 16px;
  width: 16px;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: var(--text-accent);
  border-color: var(--text-accent);
}

.checkmark:after {
  content: '';
  display: none;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.forgot-link {
  color: var(--text-secondary);
  transition: color 0.2s;
}

.forgot-link:hover {
  color: var(--text-accent);
}

.footer-links {
  text-align: center;
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.guest-link-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.guest-link {
  display: flex;
  align-items: center;
  color: var(--text-accent);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.guest-link:hover {
  opacity: 0.8;
  transform: translateX(4px);
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
