<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToSignIn = () => {
  router.push('/sign-in')
}
</script>

<template>
  <div class="home-container">
    <header class="header">
      <h1 class="logo"><span class="meet">Meet</span><span class="one">One</span></h1>
      <div class="auth-buttons">
        <button @click="navigateToSignIn" class="btn-outline">Sign In</button>
      </div>
    </header>

    <main class="main-content">
      <h2>Welcome to MeetOne</h2>
      <p>This is the public home page. You don't need to log in to see this content!</p>
    </main>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0;
}

.meet {
  color: #6292ff;
}

.one {
  color: #30c5ff;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--text-accent);
  color: var(--text-accent);
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background: var(--text-accent);
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

h2 {
  font-size: 32px;
  margin-bottom: 16px;
}

p {
  color: var(--text-secondary);
  font-size: 18px;
  max-width: 600px;
}
</style>
