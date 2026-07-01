<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from './AuthLayout.vue'
import { useProfileStore } from '../stores/profile'
import { languages } from '../constants/Languages'

const router = useRouter()
const profileStore = useProfileStore()

const guestName = ref('')
const nativeLanguage = ref('')
const targetLanguage = ref('')

const handleGuestSubmit = () => {
  if (guestName.value && nativeLanguage.value && targetLanguage.value) {
    const guestProfile = {
      userId: `gst_${crypto.randomUUID()}`,
      name: guestName.value,
      nativeLanguage: nativeLanguage.value,
      targetLanguage: targetLanguage.value,
      location: 'us', // Default location or we could ask for it. The user only asked for name, native lang, target lang.
      isGuest: true
    }
    
    localStorage.setItem('guestProfile', JSON.stringify(guestProfile))
    profileStore.setProfile(guestProfile)
    router.replace('/discover')
  }
}
</script>

<template>
  <AuthLayout>
    <div class="header">
      <h1 class="logo"><span class="meet">Meet</span><span class="one">One</span></h1>
      <h2 class="title">Join as a Guest</h2>
      <p class="subtitle">Tell us what languages you want to practice before jumping in.</p>
    </div>

    <form @submit.prevent="handleGuestSubmit" class="form">
      <div class="input-group">
        <div class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <input 
          type="text" 
          v-model="guestName" 
          placeholder="Your Nickname" 
          class="text-input" 
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
        <select v-model="nativeLanguage" class="select-input" required>
          <option value="" disabled selected>I speak (Native Language)</option>
          <option v-for="lang in languages" :key="lang.id" :value="lang.id">{{ lang.language }}</option>
        </select>
      </div>

      <div class="input-group">
        <div class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <select v-model="targetLanguage" class="select-input" required>
          <option value="" disabled selected>I want to talk (Target Language)</option>
          <option v-for="lang in languages" :key="lang.id" :value="lang.id">{{ lang.language }}</option>
        </select>
      </div>

      <button type="submit" class="btn-primary">
        Start Discovering
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
      </button>

      <div class="footer-links" style="margin-top: 16px; text-align: center;">
        <router-link to="/" class="guest-link">Back to Sign In</router-link>
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
  color: #6292ff;
}

.one {
  color: #30c5ff;
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

.text-input,
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
}

.select-input {
  appearance: none;
  cursor: pointer;
}

.text-input:focus,
.select-input:focus {
  border-color: var(--input-focus);
  box-shadow: 0 0 0 3px rgba(48, 197, 255, 0.1);
}

.select-input:invalid {
  color: var(--text-secondary);
}

.select-input option {
  color: var(--text-primary);
  background-color: var(--card-bg);
}

.guest-link {
  font-size: 14px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.guest-link:hover {
  color: white;
}
</style>
