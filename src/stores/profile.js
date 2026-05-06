import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchAuthSession } from 'aws-amplify/auth'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref(null)
  const isLoaded = ref(false)
  const error = ref(null)

  const API_URL = import.meta.env.VITE_API_URL

  const loadProfile = async () => {
    if (isLoaded.value) return profile.value

    error.value = null

    // Check for guest
    const storedGuest = localStorage.getItem('guestProfile')
    if (storedGuest) {
      try {
        const parsedGuest = JSON.parse(storedGuest)
        if (!parsedGuest.userId?.startsWith('gst_')) {
          parsedGuest.userId = `gst_${crypto.randomUUID()}`
          localStorage.setItem('guestProfile', JSON.stringify(parsedGuest))
        }
        profile.value = parsedGuest
        isLoaded.value = true
        return profile.value
      } catch (e) {
        console.error('Error parsing guest profile', e)
      }
    }

    // If not guest, fetch from AWS Cognito
    try {
      const session = await fetchAuthSession()
      if (!session.tokens) {
        throw new Error('No tokens available')
      }

      const token = session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString()
      const idTokenPayload = session.tokens?.idToken?.payload
      const cognitoSub = idTokenPayload?.sub

      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data) {
          data.userId = `usr_${cognitoSub || crypto.randomUUID()}`
          console.log('[ProfileStore] 🟢 AWS Profile loaded:', data)
          profile.value = data
          isLoaded.value = true
          return profile.value
        }
      } else {
        throw new Error('Failed to fetch profile')
      }
    } catch (err) {
      console.error('[ProfileStore] 🔴 Error fetching AWS profile:', err)
      error.value = err.message
      throw err
    }
  }

  const clearProfile = () => {
    profile.value = null
    isLoaded.value = false
    localStorage.removeItem('guestProfile')
  }

  return {
    profile,
    isLoaded,
    error,
    loadProfile,
    clearProfile,
  }
})
