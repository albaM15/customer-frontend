<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchAuthSession } from 'aws-amplify/auth'
import AuthLayout from './AuthLayout.vue'
import { languages } from '../constants/Languages'
import { countries } from '../constants/Countries'
import { CreateUserSchema } from '../schemas/CreateUser'
import { useProfileStore } from '../stores/profile'

const router = useRouter()
const route = useRoute()
const profileStore = useProfileStore()

const name = ref(route.query.name || '')
const nativeLanguage = ref('')
const targetLanguage = ref('')
const gender = ref('')
const location = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const API_URL = import.meta.env.VITE_API_URL

const handleCreateProfile = async () => {
  // Validate required fields using the schema before sending to backend
  const parsed = CreateUserSchema.safeParse({
    name: name.value,
    nativeLanguage: nativeLanguage.value,
    targetLanguage: targetLanguage.value || '',
    gender: gender.value,
    location: location.value,
  })

  if (!parsed.success) {
    const firstErr = parsed.error.issues[0]
    errorMessage.value = firstErr ? firstErr.message : 'Invalid profile data.'
    return
  }

  if (nativeLanguage.value && gender.value && location.value && name.value) {
    try {
      isSubmitting.value = true
      errorMessage.value = ''

      const session = await fetchAuthSession()
      const token = session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString()
      const cognitoSub = session.tokens?.idToken?.payload?.sub

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.value,
          nativeLanguage: nativeLanguage.value,
          targetLanguage: targetLanguage.value || undefined,
          gender: gender.value,
          location: location.value
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create profile')
      }

      const createdProfile = await response.json().catch(() => ({}))
      profileStore.setProfile({
        ...createdProfile,
        userId: createdProfile.userId || `usr_${cognitoSub || crypto.randomUUID()}`,
        name: createdProfile.name || name.value,
        nativeLanguage: createdProfile.nativeLanguage || nativeLanguage.value,
        targetLanguage: createdProfile.targetLanguage || targetLanguage.value,
        gender: createdProfile.gender || gender.value,
        location: createdProfile.location || location.value,
      })

      const pendingNames = JSON.parse(localStorage.getItem('pendingProfileNames') || '{}')
      const profileEmail = session.tokens?.idToken?.payload?.email
      if (profileEmail && pendingNames[profileEmail]) {
        delete pendingNames[profileEmail]
        localStorage.setItem('pendingProfileNames', JSON.stringify(pendingNames))
      }

      router.replace('/discover')
    } catch (error) {
      console.error('Error creating profile:', error)
      errorMessage.value = error.message || 'Error creating profile. Please try again.'
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
      <h2 class="title">Complete your profile</h2>
      <p class="subtitle">Tell us a bit about yourself to find the best matches.</p>
    </div>

    <form @submit.prevent="handleCreateProfile" class="form">
      <div class="input-group">
        <div class="input-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <input type="text" v-model="name" placeholder="Full name" required />
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
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path
              d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            ></path>
          </svg>
        </div>
        <select v-model="nativeLanguage" class="select-input" required>
          <option value="" disabled selected>Native Language</option>
          <option v-for="lang in languages" :key="lang.id" :value="lang.id">{{ lang.language }}</option>
        </select>
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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <select v-model="targetLanguage" class="select-input">
          <option value="" disabled selected>Target Language (Optional)</option>
          <option v-for="lang in languages" :key="lang.id" :value="lang.id">{{ lang.language }}</option>
        </select>
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
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <select v-model="location" class="select-input" required>
          <option value="" disabled selected>Location</option>
          <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.country }}</option>
        </select>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <button type="submit" class="btn-primary" :disabled="isSubmitting">
        {{ isSubmitting ? 'Saving...' : 'Complete Profile' }}
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

input[type='text'] {
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
