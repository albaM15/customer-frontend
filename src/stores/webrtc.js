import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWebRTCStore = defineStore('webrtc', () => {
  const isConnecting = ref(false)
  const isSearching = ref(false)
  const isConnected = ref(false)
  const peerData = ref(null)
  const error = ref(null)

  const ws = ref(null)
  const pc = ref(null)
  
  const localStream = ref(null)
  const remoteStream = ref(null)
  
  let peerConnectionId = null
  let userProfile = null

  const initializeMedia = async () => {
    try {
      localStream.value = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
    } catch (err) {
      console.error('Error accessing media devices:', err)
      throw new Error('Failed to access camera and microphone. Please allow permissions.')
    }
  }

  const connectToSignaling = async (profile) => {
    isConnecting.value = true
    error.value = null
    userProfile = profile
    
    try {
      if (!localStream.value) {
        await initializeMedia()
      }

      const wsUrl = import.meta.env.VITE_WS_URL
      if (!wsUrl) {
        console.warn('VITE_WS_URL is not defined. Falling back to local simulation mode.')
        simulateBackendMatchmaking(profile)
        return
      }

      // userId already comes with the correct prefix (gst_ or usr_) from the profile
      const userId = profile.userId
      
      const connectionUrl = `${wsUrl}?userId=${userId}`
      console.log('Connecting to WebSocket:', connectionUrl)
      
      ws.value = new WebSocket(connectionUrl)
      
      ws.value.onopen = () => {
        isConnecting.value = false
        isSearching.value = true
        console.log('WebSocket connected. Sending find_match...')
        
        ws.value.send(JSON.stringify({
          action: 'find_match',
          userData: {
            userId: userId,
            nativeLanguage: profile.nativeLanguage || 'en',
            targetLanguage: profile.targetLanguage || 'any',
            location: profile.location || 'us'
          }
        }))
      }

      ws.value.onmessage = async (event) => {
        const message = JSON.parse(event.data)
        console.log('WebSocket message received:', message.action || message)

        if (message.action === 'waiting_in_queue') {
          console.log('Waiting in queue for a match...')
        } else if (message.action === 'match_found') {
          await handleMatchFound(message)
        } else if (message.action === 'forwardSignal') {
          // Note: In the backend, the payload looks like:
          // { senderConnectionId: '...', signalData: { ... } }
          // Or if the backend wraps it: message.signalData
          // Checking the backend forwardSignal handler: it forwards the payload directly.
          if (message.signalData) {
            await handleSignalingData(message.signalData)
          }
        }
      }

      ws.value.onerror = (err) => {
        console.error('WebSocket error:', err)
        error.value = 'Connection error occurred'
        disconnect()
      }

      ws.value.onclose = () => {
        console.log('WebSocket closed')
        if (isConnected.value || isSearching.value || isConnecting.value) {
          disconnect()
        }
      }
      
    } catch (err) {
      isConnecting.value = false
      error.value = err.message || 'Failed to connect'
      console.error('Signaling error:', err)
    }
  }

  const handleMatchFound = async (message) => {
    isSearching.value = false
    isConnected.value = true
    peerData.value = message.peerData
    peerConnectionId = message.peerConnectionId
    
    const iceServers = message.iceServers?.iceServers || [
      { urls: 'stun:stun.l.google.com:19302' }
    ]

    console.log('Match found! Initializing RTCPeerConnection...', peerData.value)

    pc.value = new RTCPeerConnection({ iceServers })

    // Add local tracks
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => {
        pc.value.addTrack(track, localStream.value)
      })
    }

    // Listen for ICE candidates
    pc.value.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({
          type: 'ice',
          candidate: event.candidate
        })
      }
    }

    // Listen for remote track
    pc.value.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind)
      if (!remoteStream.value) {
        remoteStream.value = new MediaStream()
      }
      remoteStream.value.addTrack(event.track)
    }

    // If caller, create offer
    if (message.role === 'caller') {
      try {
        const offer = await pc.value.createOffer()
        await pc.value.setLocalDescription(offer)
        sendSignal({
          type: 'offer',
          sdp: offer.sdp
        })
      } catch (err) {
        console.error('Error creating offer:', err)
      }
    }
  }

  const handleSignalingData = async (data) => {
    if (!pc.value) return

    try {
      if (data.type === 'offer') {
        await pc.value.setRemoteDescription(new RTCSessionDescription(data))
        const answer = await pc.value.createAnswer()
        await pc.value.setLocalDescription(answer)
        sendSignal({
          type: 'answer',
          sdp: answer.sdp
        })
      } else if (data.type === 'answer') {
        await pc.value.setRemoteDescription(new RTCSessionDescription(data))
      } else if (data.type === 'ice') {
        if (data.candidate) {
          await pc.value.addIceCandidate(new RTCIceCandidate(data.candidate))
        }
      }
    } catch (err) {
      console.error('Error handling signaling data:', err)
    }
  }

  const sendSignal = (signalData) => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN && peerConnectionId) {
      ws.value.send(JSON.stringify({
        action: 'forwardSignal',
        targetConnectionId: peerConnectionId,
        signalData
      }))
    }
  }

  const disconnect = () => {
    if (pc.value) {
      pc.value.close()
      pc.value = null
    }
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    
    // Stop local media tracks to turn off camera indicator
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop())
      localStream.value = null
    }
    
    remoteStream.value = null
    
    isConnecting.value = false
    isSearching.value = false
    isConnected.value = false
    peerData.value = null
    peerConnectionId = null
    userProfile = null
  }

  // --- LOCAL SIMULATION FALLBACK ---
  const simulateBackendMatchmaking = (profile) => {
    isConnecting.value = false
    isSearching.value = true
    
    setTimeout(() => {
      isSearching.value = false
      isConnected.value = true
      peerData.value = {
        userId: 'simulated-user',
        nativeLanguage: 'en',
        targetLanguage: 'es',
        location: 'us'
      }
      
      // For the simulation, we just loop the local camera to the remote video 
      // so the user can see the UI working without a real backend connection.
      if (localStream.value) {
        remoteStream.value = new MediaStream(localStream.value.getTracks())
      }
    }, 4000)
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
    disconnect
  }
})
