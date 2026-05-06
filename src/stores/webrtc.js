import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { socketClient } from '../services/websocket/socketClient'
import { useMatchmakingStore } from './matchmaking'
import { webrtcManager } from '../services/webrtc/peerConnection'

export const useWebRTCStore = defineStore('webrtc', () => {
  const matchStore = useMatchmakingStore()

  // Reactive state derived from stores / services
  const isConnecting = computed(() => socketClient.isConnecting)
  const isSearching = computed(() => matchStore.isSearching)
  const isConnected = computed(() => matchStore.isConnected)
  const peerData = computed(() => matchStore.peerData)
  const error = computed(() => matchStore.error)

  const localStream = ref(null)
  const remoteStream = ref(null)

  const _messageListener = async (message) => {
    // 1. Send matched events to MatchMaking Store
    if (message.action === 'waiting_in_queue' || message.action === 'match_found') {
      matchStore.handleSocketMessage(message)

      // If we found a match, setup PeerConnection immediately
      if (message.action === 'match_found') {
        try {
          webrtcManager.setupPeerConnection(
            matchStore.iceServers,
            matchStore.role,
            matchStore.peerConnectionId,
          )
        } catch (err) {
          console.error('Failed to setup P2P Connection:', err)
        }
      }
    }
    // 2. Handle P2P WebRTC Signalling
    else if (message.action === 'forward_signal' || message.signalData) {
      if (message.signalData) {
        await webrtcManager.handleSignalingData(message.signalData)
      }
    }
  }

  const connectToSignaling = async (profile) => {
    try {
      // Ensure media is initialized right before we join the match
      localStream.value = await webrtcManager.initializeMedia()

      // Hook up UI ref to the manager's remote stream events
      webrtcManager.onRemoteTrack = (stream) => {
        remoteStream.value = stream
      }

      // Register global socket listener
      socketClient.on('message', _messageListener)

      // Emit Find Match!
      matchStore.findMatch(profile)
    } catch (err) {
      console.error('Signaling error:', err)
      // Throw to let the UI know media failed or connection aborted
    }
  }

  const disconnect = () => {
    socketClient.off('message', _messageListener)
    matchStore.reset()
    webrtcManager.disconnect()
    localStream.value = null
    remoteStream.value = null
  }

  return {
    isConnecting,
    isSearching,
    isConnected,
    peerData,
    error,
    localStream,
    remoteStream,
    connectToSignaling,
    disconnect,
  }
})
