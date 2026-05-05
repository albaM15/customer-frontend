<script setup>
import { ref, onMounted, computed, onUnmounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAuthSession } from 'aws-amplify/auth'
import { useWebRTCStore } from '../stores/webrtc'
import { languages } from '../constants/Languages'
import { countries } from '../constants/Countries'

const router = useRouter()
const webrtc = useWebRTCStore()
const API_URL = import.meta.env.VITE_API_URL
const profile = ref({
  name: '',
  nativeLanguage: '',
  targetLanguage: '',
  location: ''
})

const isMuted = ref(false)
const isVideoOff = ref(false)

const localVideo = ref(null)
const remoteVideo = ref(null)

onMounted(async () => {
  // 1. Load profile (guest or authenticated)
  const storedGuest = localStorage.getItem('guestProfile')
  if (storedGuest) {
    try {
      profile.value = JSON.parse(storedGuest)
    } catch (e) {
      console.error('Error parsing guest profile', e)
    }
  } else {
    try {
      const session = await fetchAuthSession()
      if (session.tokens) {
        const token = session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString()
        // Extract the Cognito sub (user ID) from the token payload
        const idTokenPayload = session.tokens?.idToken?.payload
        const cognitoSub = idTokenPayload?.sub

        const response = await fetch(`${API_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          if (data) {
            // Ensure the userId has the correct usr_ prefix
            data.userId = `usr_${cognitoSub || crypto.randomUUID()}`
            profile.value = data
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  // 2. If we don't have a profile at all, redirect back
  if (!profile.value.nativeLanguage && !profile.value.targetLanguage) {
    router.push('/discover')
    return
  }

  // 3. Start searching immediately
  webrtc.connectToSignaling(profile.value)
})

// Attach streams to video elements
watchEffect(() => {
  if (localVideo.value && webrtc.localStream) {
    if (localVideo.value.srcObject !== webrtc.localStream) {
      localVideo.value.srcObject = webrtc.localStream
    }
  }
  
  if (remoteVideo.value && webrtc.remoteStream) {
    if (remoteVideo.value.srcObject !== webrtc.remoteStream) {
      remoteVideo.value.srcObject = webrtc.remoteStream
    }
  }
})

onUnmounted(() => {
  webrtc.disconnect()
})

const getLanguageName = (id) => {
  if (!id || id === 'any') return 'Cualquiera'
  const lang = languages.find(l => l.id === id || l.id.toLowerCase() === id.toLowerCase() || l.language.toLowerCase() === id.toLowerCase())
  return lang ? lang.language : id
}

const getCountryName = (id) => {
  if (!id || id === 'anywhere' || id === 'us') return 'Anywhere'
  const country = countries.find(c => c.id === id || c.id.toLowerCase() === id.toLowerCase())
  return country ? country.country : id
}

const toggleMute = () => {
  if (webrtc.localStream) {
    const audioTrack = webrtc.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      isMuted.value = !audioTrack.enabled
    }
  }
}

const toggleVideo = () => {
  if (webrtc.localStream) {
    const videoTrack = webrtc.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      isVideoOff.value = !videoTrack.enabled
    }
  }
}

const endCall = () => {
  webrtc.disconnect()
  router.push('/discover')
}

// Format helpers
const myName = computed(() => profile.value.name || 'You')
const myLanguage = computed(() => getLanguageName(profile.value.nativeLanguage))
const myTarget = computed(() => getLanguageName(profile.value.targetLanguage))

const peerName = computed(() => webrtc.peerData?.name || webrtc.peerData?.userId || '???')
const peerLanguage = computed(() => getLanguageName(webrtc.peerData?.nativeLanguage))
const peerTarget = computed(() => getLanguageName(webrtc.peerData?.targetLanguage))

// Status label
const statusLabel = computed(() => {
  if (webrtc.isConnecting) return 'Conectando...'
  if (webrtc.isSearching) return 'Buscando a alguien...'
  if (webrtc.isConnected) return 'Conectado'
  return 'Iniciando...'
})
</script>

<template>
  <div class="call-layout">
    <!-- Top bar -->
    <div class="top-bar">
      <div class="status-badge" :class="{ 
        'searching': webrtc.isSearching || webrtc.isConnecting,
        'connected': webrtc.isConnected 
      }">
        <div class="status-dot"></div>
        {{ statusLabel }}
      </div>
      <button class="end-call-btn" @click="endCall">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        Salir
      </button>
    </div>

    <div class="call-content">
      <div class="participants-container">
        <!-- Local User (YOU) -->
        <div class="participant">
          <div class="video-box-wrapper local">
            <div class="video-box">
              <video ref="localVideo" class="media-stream" autoplay playsinline muted :class="{ 'video-off': isVideoOff }"></video>
              <div v-if="isVideoOff" class="avatar-fallback">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <!-- Name badge on video -->
              <div class="name-badge">{{ myName }}</div>
              <!-- Controls -->
              <div class="controls">
                <button class="control-btn" :class="{ 'danger': isMuted }" @click="toggleMute">
                  <svg v-if="!isMuted" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="2" y2="22"></line><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"></path><path d="M5 10v2a7 7 0 0 0 12 5"></path><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                </button>
                <button class="control-btn" :class="{ 'danger': isVideoOff }" @click="toggleVideo">
                  <svg v-if="!isVideoOff" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect width="15" height="14" x="1" y="5" rx="2" ry="2"></rect></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.66 5H14a2 2 0 0 1 2 2v2.34l1 1L23 7v10l-3.34-2M1 1l22 22M5 5.34V19a2 2 0 0 0 2 2h10a2 2 0 0 0 1.56-.77"></path></svg>
                </button>
              </div>
            </div>
          </div>
          <div class="profile-info">
            <span class="profile-label">Hablo</span>
            <span class="profile-value">{{ myLanguage }}</span>
            <span class="profile-separator">·</span>
            <span class="profile-label">Quiero practicar</span>
            <span class="profile-value">{{ myTarget }}</span>
          </div>
        </div>

        <div class="connector">
          <div class="connector-line"></div>
          <span class="connector-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 1l4 4-4 4"></path>
              <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
              <path d="M7 23l-4-4 4-4"></path>
              <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
            </svg>
          </span>
          <div class="connector-line"></div>
        </div>

        <!-- Remote User (PEER) -->
        <div class="participant">
          <div class="video-box-wrapper remote" :class="{ 'searching': !webrtc.isConnected }">
            <div class="video-box">
              <video ref="remoteVideo" class="media-stream" autoplay playsinline></video>
              <!-- Searching state -->
              <div v-if="!webrtc.isConnected" class="search-overlay">
                <div class="search-animation">
                  <div class="pulse-ring"></div>
                  <div class="pulse-ring delay-1"></div>
                  <div class="pulse-ring delay-2"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <p class="search-text">Buscando a alguien...</p>
                <p class="search-subtext">que hable <span class="highlight">{{ myTarget }}</span></p>
              </div>
              <!-- Connected but no remote stream yet -->
              <div v-else-if="!webrtc.remoteStream" class="search-overlay">
                <div class="loader"></div>
                <p class="search-text">Conectando video...</p>
              </div>
              <!-- Peer name badge (show when connected) -->
              <div v-if="webrtc.isConnected" class="name-badge">{{ peerName }}</div>
            </div>
          </div>
          <div class="profile-info" v-if="webrtc.isConnected && webrtc.peerData">
            <span class="profile-label">Habla</span>
            <span class="profile-value">{{ peerLanguage }}</span>
            <span class="profile-separator">·</span>
            <span class="profile-label">Quiere practicar</span>
            <span class="profile-value">{{ peerTarget }}</span>
          </div>
          <div class="profile-info muted" v-else>
            <span class="profile-label">Esperando conexión...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.call-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color, #0D1117);
  position: relative;
  overflow: hidden;
}

/* Background glows */
.call-layout::before {
  content: '';
  position: absolute;
  top: -20%;
  left: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(92, 97, 255, 0.12) 0%, rgba(13, 17, 23, 0) 70%);
  z-index: 0;
}

.call-layout::after {
  content: '';
  position: absolute;
  bottom: -20%;
  right: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(48, 197, 255, 0.12) 0%, rgba(13, 17, 23, 0) 70%);
  z-index: 0;
}

/* Top bar */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  z-index: 10;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
}

.status-badge.searching {
  color: #30C5FF;
  border-color: rgba(48, 197, 255, 0.2);
  background: rgba(48, 197, 255, 0.08);
}

.status-badge.connected {
  color: #2ED175;
  border-color: rgba(46, 209, 117, 0.2);
  background: rgba(46, 209, 117, 0.08);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.end-call-btn {
  background: rgba(255, 69, 58, 0.12);
  color: #FF453A;
  border: 1px solid rgba(255, 69, 58, 0.25);
  padding: 8px 18px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.end-call-btn:hover {
  background: rgba(255, 69, 58, 0.22);
  transform: translateY(-1px);
}

/* Main content */
.call-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px 40px;
  z-index: 1;
}

.participants-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  width: 100%;
  max-width: 1000px;
}

@media (max-width: 768px) {
  .participants-container {
    flex-direction: column;
    gap: 24px;
  }
}

.participant {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  width: 100%;
  max-width: 400px;
}

/* Video boxes */
.video-box-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 24px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(92, 97, 255, 0.5) 0%, rgba(48, 197, 255, 0.5) 100%);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.4s ease;
}

.video-box-wrapper.local {
  background: linear-gradient(135deg, rgba(92, 97, 255, 0.6) 0%, rgba(48, 197, 255, 0.6) 100%);
}

.video-box-wrapper.remote.searching {
  background: linear-gradient(135deg, rgba(92, 97, 255, 0.2) 0%, rgba(48, 197, 255, 0.2) 100%);
  animation: border-pulse 3s ease-in-out infinite;
}

@keyframes border-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.video-box {
  width: 100%;
  height: 100%;
  border-radius: 22px;
  background: #0A0E17;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-stream {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #0A0E17;
  transition: opacity 0.3s;
}

.media-stream.video-off {
  opacity: 0;
}

.avatar-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.15);
  background: #0A0E17;
}

/* Name badge on video */
.name-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  color: white;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  z-index: 3;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Controls */
.controls {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 12px;
  z-index: 2;
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.control-btn.danger {
  background: rgba(255, 69, 58, 0.75);
  border-color: rgba(255, 69, 58, 0.4);
}

.control-btn.danger:hover {
  background: rgba(255, 69, 58, 1);
}

/* Search overlay on remote video */
.search-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0A0E17;
  gap: 16px;
  z-index: 2;
}

.search-animation {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon {
  color: #30C5FF;
  z-index: 1;
}

.pulse-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid rgba(48, 197, 255, 0.3);
  animation: pulse-expand 3s ease-in-out infinite;
}

.pulse-ring.delay-1 {
  animation-delay: 1s;
}

.pulse-ring.delay-2 {
  animation-delay: 2s;
}

@keyframes pulse-expand {
  0% { transform: scale(0.5); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}

.search-text {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}

.search-subtext {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.highlight {
  color: #30C5FF;
  font-weight: 600;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(48, 197, 255, 0.2);
  border-top-color: #30C5FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Connector */
.connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.connector-line {
  width: 2px;
  height: 36px;
  background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(92, 97, 255, 0.4), rgba(255,255,255,0));
}

.connector-icon {
  color: rgba(255, 255, 255, 0.3);
  display: flex;
}

@media (max-width: 768px) {
  .connector {
    flex-direction: row;
    width: 100%;
    justify-content: center;
  }
  .connector-line {
    height: 2px;
    width: 36px;
    background: linear-gradient(to right, rgba(255,255,255,0), rgba(92, 97, 255, 0.4), rgba(255,255,255,0));
  }
}

/* Profile info below video */
.profile-info {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
}

.profile-info.muted {
  opacity: 0.4;
}

.profile-label {
  color: rgba(255, 255, 255, 0.45);
  font-weight: 400;
}

.profile-value {
  font-weight: 700;
  background: linear-gradient(90deg, #5C61FF 0%, #30C5FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.profile-separator {
  color: rgba(255, 255, 255, 0.2);
}
</style>
