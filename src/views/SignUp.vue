<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signUp } from 'aws-amplify/auth'
import AuthLayout from './AuthLayout.vue'

const router = useRouter()
const fullName = ref('')
const email = ref('')
const password = ref('')
const nativeLanguage = ref('')
const targetLanguage = ref('')
const gender = ref('')
const location = ref('')
const agreeTerms = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)

const handleSignUp = async () => {
  if (fullName.value && email.value && password.value && agreeTerms.value && nativeLanguage.value && gender.value && location.value) {
    try {
      isSubmitting.value = true;
      errorMessage.value = '';
      
      const userAttributes = {
        email: email.value,
        name: fullName.value, // Cognito standard attribute for full name
        'custom:nativeLanguage': nativeLanguage.value,
        gender: gender.value,
        'custom:location': location.value
      };

      if (targetLanguage.value) {
        userAttributes['custom:targetLanguage'] = targetLanguage.value;
      }

      const { isSignUpComplete, nextStep } = await signUp({
        username: email.value,
        password: password.value,
        options: {
          userAttributes
        }
      });
      
      // Navigate to verify code passing the email
      router.push({ path: '/verify-code', query: { email: email.value } })
    } catch (error) {
      console.error('Error signing up:', error);
      errorMessage.value = error.message || 'Error signing up. Please try again.';
    } finally {
      isSubmitting.value = false;
    }
  }
}
</script>

<template>
  <AuthLayout>
    <div class="header">
      <h1 class="logo"><span class="meet">Meet</span><span class="one">One</span></h1>
      <h2 class="title">Create your account</h2>
      <p class="subtitle">Step into a vibrant world of spontaneous<br>connection.</p>
    </div>

    <form @submit.prevent="handleSignUp" class="form">
      <div class="input-group">
        <div class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <input 
          type="text" 
          v-model="fullName" 
          placeholder="Full Name" 
          required 
        />
      </div>

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
          placeholder="Email Address" 
          required 
        />
      </div>

      <div class="input-group">
        <div class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </div>
        <input 
          type="text" 
          v-model="nativeLanguage" 
          placeholder="Native Language" 
          required 
        />
      </div>

      <div class="input-group">
        <div class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <input 
          type="text" 
          v-model="targetLanguage" 
          placeholder="Target Language (Optional)" 
        />
      </div>

      <div class="input-group">
        <div class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <select v-model="gender" class="select-input" required>
          <option value="" disabled selected>Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="input-group">
        <div class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <input 
          type="text" 
          v-model="location" 
          placeholder="Location" 
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
          placeholder="Password" 
          required 
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

      <div class="form-options">
        <label class="checkbox-container">
          <input type="checkbox" v-model="agreeTerms" required>
          <span class="checkmark"></span>
          <span class="label-text">I agree to the <a href="#" class="inline-link">Terms of Service</a> and <a href="#" class="inline-link">Privacy Policy</a>.</span>
        </label>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <button type="submit" class="btn-primary" :disabled="isSubmitting">
        {{ isSubmitting ? 'Creating...' : 'Create Account' }}
        <svg v-if="!isSubmitting" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </button>

      <div class="footer-links">
        <span>Already have an account? </span>
        <router-link to="/sign-in" class="accent">Log in</router-link>
      </div>

      <div class="guest-link-container">
        <router-link to="/" class="guest-link">
          Continue as Guest
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;">
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
  margin-bottom: 24px;
}

.logo {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
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
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

input[type="text"],
input[type="email"],
input[type="password"],
.select-input {
  padding-left: 44px;
}

.select-input {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 8px;
  padding: 12px 16px;
  padding-left: 44px;
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  appearance: none;
  cursor: pointer;
}

.select-input:invalid {
  color: var(--text-secondary);
}

.select-input option {
  color: var(--text-primary);
  background-color: var(--card-bg);
}

.select-input:focus {
  border-color: var(--input-focus);
  box-shadow: 0 0 0 3px rgba(48, 197, 255, 0.1);
}

input[type="password"] {
  padding-right: 44px;
}

.form-options {
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-top: 4px;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
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
  min-width: 16px;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  margin-right: 8px;
  margin-top: 1px;
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
  content: "";
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

.inline-link {
  color: var(--text-secondary);
  text-decoration: underline;
}

.inline-link:hover {
  color: var(--text-primary);
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
