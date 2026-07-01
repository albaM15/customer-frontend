<script setup>
defineOptions({ name: 'HomeView' })

import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '../components/BottomNav.vue'
import { useWebRTCStore } from '../stores/webrtc'
import { useProfileStore } from '../stores/profile'
import { socketClient } from '../services/websocket/socketClient'
import { languages } from '../constants/Languages'
import { countries } from '../constants/Countries'

const router = useRouter()
const webrtc = useWebRTCStore()
const profileStore = useProfileStore()

onMounted(async () => {
  try {
    await profileStore.loadProfile()
    if (profileStore.profile?.userId) {
      socketClient.connect(profileStore.profile.userId)
    } else {
      router.replace('/')
    }
  } catch (error) {
    console.error('Error in Home:', error)
    router.replace('/')
  }
})

const profile = computed(() => profileStore.profile || {
  nativeLanguage: 'es',
  targetLanguage: 'en',
  location: 'pe'
})


const getLanguageName = (id) => {
  if (!id || id === 'any') return 'Cualquiera'
  const lang = languages.find(l => l.id === id || l.id.toLowerCase() === id.toLowerCase() || l.language.toLowerCase() === id.toLowerCase())
  return lang ? lang.language : id
}

const getCountryName = (id) => {
  if (!id || id === 'anywhere') return 'Cualquiera'
  const country = countries.find(c => c.id === id || c.id.toLowerCase() === id.toLowerCase() || c.country.toLowerCase() === id.toLowerCase())
  return country ? country.country : id
}

const handleStartCall = () => {
  // Navigate to /call immediately — Call.vue will start the connection
  router.push('/call')
}

const handleSettings = () => {
  // Config preferences
}
</script>

<template>
  <div class="discover-container">
    <header class="header">
      <h1 class="logo">MeetOne</h1>
      <div class="header-actions">
        <button class="icon-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
        <button class="profile-btn">
          <div class="avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </button>
      </div>
    </header>

    <main class="main-content">
      <h2 class="headline">
        Habla con el mundo,<br/>
        <span class="highlight">al instante.</span>
      </h2>

      <p class="subtitle">
        Conexiones seguras y anónimas para practicar idiomas o<br/>
        simplemente hacer nuevos amigos.
      </p>

      <button class="call-btn" @click="handleStartCall" :disabled="webrtc.isConnecting || webrtc.isSearching">
        <span v-if="!webrtc.isConnecting && !webrtc.isSearching" class="btn-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Iniciar Llamada
        </span>
        <span v-else-if="webrtc.isConnecting" class="btn-content">
          Conectando...
        </span>
        <span v-else class="btn-content">
          Buscando pareja...
        </span>
      </button>

      <div v-if="webrtc.error" class="error-badge">
        {{ webrtc.error }}
      </div>

      <button class="config-btn" @click="handleSettings">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="21" x2="4" y2="14"></line>
          <line x1="4" y1="10" x2="4" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12" y2="3"></line>
          <line x1="20" y1="21" x2="20" y2="16"></line>
          <line x1="20" y1="12" x2="20" y2="3"></line>
          <line x1="1" y1="14" x2="7" y2="14"></line>
          <line x1="9" y1="8" x2="15" y2="8"></line>
          <line x1="17" y1="16" x2="23" y2="16"></line>
        </svg>
        Configurar Preferencias
      </button>

      <div class="cards-container">
        <div class="cards-wrapper">
          <div class="card my-profile">
            <h3 class="card-title">MI PERFIL</h3>
            <div class="card-row">
              <span class="label">Nativo</span>
              <div class="badge-blue">{{ getLanguageName(profile.nativeLanguage) }}</div>
            </div>
            <div class="card-row">
              <span class="label">Ubicación</span>
              <span class="value">{{ getCountryName(profile.location) }}</span>
            </div>
          </div>

          <div class="card seeking">
            <h3 class="card-title">BUSCANDO</h3>
            <div class="card-row">
              <span class="label">Idioma</span>
              <div class="badge-cyan">{{ getLanguageName(profile.targetLanguage) }}</div>
            </div>
            <div class="card-row">
              <span class="label">Región</span>
              <div class="badge-dark">{{ getCountryName(profile.targetLanguage === 'en' ? 'us' : null) }}</div>
            </div>
          </div>

          <div class="card safety">
            <div class="safety-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ED175" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <polyline points="9 12 11 14 15 10"></polyline>
              </svg>
              <span>Modo Seguro Activado</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar"></div>
            </div>
            <div class="safety-footer">Nivel de emparejamiento: 85% compatible</div>
          </div>
        </div>
      </div>
      
      <!-- Show when connected -->
      <div v-if="webrtc.isConnected" class="match-success">
        <div class="match-badge">
          Conectado con {{ getLanguageName(webrtc.peerData?.nativeLanguage) }} ({{ getCountryName(webrtc.peerData?.location) }})
        </div>
      </div>
    </main>

    <BottomNav />
  </div>
</template>

<style scoped>
.discover-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: white;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.icon-btn:hover {
  color: white;
}

.profile-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  padding: 2px;
  display: flex;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1A243D;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.headline {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;
  color: white;
}

.highlight {
  background: linear-gradient(90deg, #5C61FF 0%, #30C5FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 40px;
  max-width: 500px;
}

.call-btn {
  background: linear-gradient(90deg, #5C61FF 0%, #30C5FF 100%);
  border: none;
  border-radius: 12px;
  padding: 16px 40px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(92, 97, 255, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 24px;
}

.call-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(92, 97, 255, 0.4);
}

.call-btn:disabled {
  opacity: 0.8;
  cursor: not-allowed;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-badge {
  background: rgba(255, 69, 58, 0.15);
  color: #FF453A;
  border: 1px solid rgba(255, 69, 58, 0.3);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 24px;
  font-weight: 500;
}

.config-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 60px;
  transition: color 0.2s;
}

.config-btn:hover {
  color: white;
}

.cards-container {
  width: 100%;
  max-width: 800px;
  background: #11182B;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
}

.cards-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .cards-wrapper {
    grid-template-columns: 1fr;
  }
}

.card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.my-profile, .seeking {
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  padding-right: 24px;
}

@media (max-width: 768px) {
  .my-profile, .seeking {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-right: 0;
    padding-bottom: 24px;
  }
}

.card-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 1px;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: 14px;
  color: white;
  font-weight: 500;
}

.value {
  font-size: 13px;
  color: var(--text-secondary);
}

.badge-blue {
  background: rgba(92, 97, 255, 0.15);
  color: #5C61FF;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.badge-cyan {
  background: rgba(48, 197, 255, 0.15);
  color: #30C5FF;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.badge-dark {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
}

.safety {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.safety-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.progress-bar-container {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  width: 85%;
  height: 100%;
  background: linear-gradient(90deg, #5C61FF 0%, #30C5FF 100%);
  border-radius: 2px;
}

.safety-footer {
  font-size: 12px;
  color: var(--text-secondary);
}

.match-success {
  margin-top: 32px;
}

.match-badge {
  background: rgba(46, 209, 117, 0.15);
  color: #2ED175;
  border: 1px solid rgba(46, 209, 117, 0.3);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
}
</style>
