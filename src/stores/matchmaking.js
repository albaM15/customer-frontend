import { defineStore } from 'pinia'
import { ref } from 'vue'
import { socketClient } from '../services/websocket/socketClient'
import { MatchmakingRequestSchema } from '../schemas/MatchMaking'

export const useMatchmakingStore = defineStore('matchmaking', () => {
  const isSearching = ref(false)
  const isConnected = ref(false)
  const error = ref(null)

  const peerData = ref(null)
  const peerConnectionId = ref(null)
  const role = ref(null)
  const iceServers = ref(null)

  const findMatch = (profile) => {
    isSearching.value = true
    error.value = null
    isConnected.value = false

    try {
      const payload = {
        action: 'find_match',
        userData: {
          userId: profile.userId,
          name: profile.name || 'Guest',
          nativeLanguage: profile.nativeLanguage || 'en',
          targetLanguage: profile.targetLanguage || 'any',
          location: (profile.location || 'PE').toUpperCase(),
        },
        filters: {},
      }

      console.log('[MatchMaking] Validating payload:', payload)
      const validatedPayload = MatchmakingRequestSchema.parse(payload)
      socketClient.send(validatedPayload)
    } catch (err) {
      console.error('[MatchMaking] Validation error on find_match:', err)
      error.value = 'Invalid match request data'
      isSearching.value = false
    }
  }

  const handleSocketMessage = (message) => {
    if (message.action === 'waiting_in_queue') {
      isSearching.value = true
      isConnected.value = false
    } else if (message.action === 'match_found') {
      isSearching.value = false
      isConnected.value = true
      peerData.value = message.peerData
      peerConnectionId.value = message.peerConnectionId
      role.value = message.role

      // The backend structure has them in an array
      iceServers.value = message.iceServers || []
    }
  }

  const reset = () => {
    isSearching.value = false
    isConnected.value = false
    peerData.value = null
    peerConnectionId.value = null
    role.value = null
    iceServers.value = null
  }

  return {
    isSearching,
    isConnected,
    error,
    peerData,
    peerConnectionId,
    role,
    iceServers,
    findMatch,
    handleSocketMessage,
    reset,
  }
})
