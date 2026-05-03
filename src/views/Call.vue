<script setup>
import { ref, onMounted, computed, onUnmounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAuthSession } from 'aws-amplify/auth'
import { useWebRTCStore } from '../stores/webrtc'
import { languages } from '../constants/Languages'
import { countries } from '../constants/Countries'

const router = useRouter()
const webrtc = useWebRTCStore()

const profile = ref({
  nativeLanguage: '',
  targetLanguage: '',
  location: ''
})

const isMuted = ref(false)
const isVideoOff = ref(false)

const localVideo = ref(null)
const remoteVideo = ref(null)

onMounted(async () => {
  if (!webrtc.isConnected) {
    router.push('/discover')
    return
  }

  try {
    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString()
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      if (data) profile.value = data
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
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
  if (!id) return 'any'
  const lang = languages.find(l => l.id === id || l.language.toLowerCase() === id.toLowerCase())
  return lang ? lang.language : id
}

const getCountryName = (id) => {
  if (!id) return 'anywhere'
  const country = countries.find(c => c.id === id || c.country.toLowerCase() === id.toLowerCase())
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
const myCountry = computed(() => getCountryName(profile.value.location))
const myLanguage = computed(() => getLanguageName(profile.value.nativeLanguage))
const myTarget = computed(() => getLanguageName(profile.value.targetLanguage))

const peerCountry = computed(() => getCountryName(webrtc.peerData?.location))
const peerLanguage = computed(() => getLanguageName(webrtc.peerData?.nativeLanguage))
const peerTarget = computed(() => getLanguageName(webrtc.peerData?.targetLanguage))
</script>

<template>
  <div class="call-layout">
    <button class="end-call-btn" @click="endCall">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
        <line x1="23" y1="1" x2="1" y2="23"></line>
      </svg>
      Leave
    </button>

    <div class="wireframe-container">
      <div class="participants-container">
        <!-- Local User -->
        <div class="participant">
          <div class="video-box-wrapper">
            <div class="video-box">
              <video ref="localVideo" class="media-stream" autoplay playsinline muted :class="{ 'video-off': isVideoOff }"></video>
              <div v-if="isVideoOff" class="avatar-fallback">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div class="controls">
                <button class="control-btn" :class="{ 'danger': isMuted }" @click="toggleMute">
                  <svg v-if="!isMuted" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="2" y2="22"></line><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"></path><path d="M5 10v2a7 7 0 0 0 12 5l-1.5 1.5a5 5 0 0 1-9-5v-2"></path><path d="M9 9v3a3 3 0 0 0 5.12 2.12"></path><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                </button>
                <button class="control-btn" :class="{ 'danger': isVideoOff }" @click="toggleVideo">
                  <svg v-if="!isVideoOff" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect width="15" height="14" x="1" y="5" rx="2" ry="2"></rect></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8M16.6 16.6a2 2 0 0 0 2.8 2.8M2 2l20 20M15 5h4a2 2 0 0 1 2 2v10M2 10v9a2 2 0 0 0 2 2h14"></path></svg>
                </button>
              </div>
            </div>
          </div>
          <div class="info-text">
            Im from <span class="highlight-text">{{ myCountry }}</span><br>
            I speak <span class="highlight-text">{{ myLanguage }}</span><br>
            want to talk <span class="highlight-text">{{ myTarget }}</span>
          </div>
        </div>

        <div class="connector">
          <div class="connector-line"></div>
          <span class="connector-text">with</span>
          <div class="connector-line"></div>
        </div>

        <!-- Remote User -->
        <div class="participant">
          <div class="video-box-wrapper">
            <div class="video-box">
              <video ref="remoteVideo" class="media-stream" autoplay playsinline></video>
              <div v-if="!webrtc.remoteStream" class="avatar-fallback connecting">
                <div class="loader"></div>
              </div>
            </div>
          </div>
          <div class="info-text">
            someone from <span class="highlight-text">{{ peerCountry }}</span><br>
            who speaks <span class="highlight-text">{{ peerLanguage }}</span><br>
            wants to talk <span class="highlight-text">{{ peerTarget }}</span>
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
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color, #0D1117);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* Background aesthetic glows */
.call-layout::before {
  content: '';
  position: absolute;
  top: -20%;
  left: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(92, 97, 255, 0.15) 0%, rgba(13, 17, 23, 0) 70%);
  z-index: 0;
}

.call-layout::after {
  content: '';
  position: absolute;
  bottom: -20%;
  right: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(circle, rgba(48, 197, 255, 0.15) 0%, rgba(13, 17, 23, 0) 70%);
  z-index: 0;
}

.end-call-btn {
  position: absolute;
  top: 32px;
  right: 32px;
  background: rgba(255, 69, 58, 0.15);
  color: #FF453A;
  border: 1px solid rgba(255, 69, 58, 0.3);
  padding: 10px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.2s;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.end-call-btn:hover {
  background: rgba(255, 69, 58, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 69, 58, 0.2);
}

.wireframe-container {
  background: rgba(17, 24, 43, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 60px 40px;
  width: 100%;
  max-width: 1000px;
  z-index: 1;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
}

.participants-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
}

@media (max-width: 768px) {
  .participants-container {
    flex-direction: column;
    gap: 32px;
  }
}

.participant {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
  width: 100%;
  max-width: 380px;
}

.video-box-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  border-radius: 24px;
  padding: 2px; /* For the gradient border */
  background: linear-gradient(135deg, rgba(92, 97, 255, 0.5) 0%, rgba(48, 197, 255, 0.5) 100%);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.video-box {
  width: 100%;
  height: 100%;
  border-radius: 22px; /* Slightly less than wrapper to fit inside */
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
  color: rgba(255, 255, 255, 0.2);
  background: #0A0E17;
}

.avatar-fallback.connecting {
  color: #30C5FF;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(48, 197, 255, 0.2);
  border-top-color: #30C5FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.controls {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 16px;
  z-index: 2;
}

.control-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(20, 20, 20, 0.6);
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
  background: rgba(255, 69, 58, 0.8);
  border-color: rgba(255, 69, 58, 0.4);
  color: white;
}

.control-btn.danger:hover {
  background: rgba(255, 69, 58, 1);
}

.connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transform: translateY(-40px);
}

.connector-line {
  width: 2px;
  height: 40px;
  background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(92, 97, 255, 0.5), rgba(255,255,255,0));
}

.connector-text {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 2px;
}

@media (max-width: 768px) {
  .connector {
    transform: none;
    flex-direction: row;
    width: 100%;
  }
  .connector-line {
    height: 2px;
    width: 40px;
    background: linear-gradient(to right, rgba(255,255,255,0), rgba(92, 97, 255, 0.5), rgba(255,255,255,0));
  }
}

.info-text {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
  text-align: center;
}

.highlight-text {
  font-weight: 700;
  color: white;
  background: linear-gradient(90deg, #5C61FF 0%, #30C5FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
