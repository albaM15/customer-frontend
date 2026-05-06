export class SocketClient {
  constructor() {
    this.ws = null
    this.userId = null
    this.listeners = new Map()
    this.isConnecting = false
  }

  connect(userId) {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      if (this.userId === userId) {
        return // Already connected or connecting with the same userId
      } else {
        this.disconnect() // Different user, reconnect
      }
    }

    this.userId = userId
    this.isConnecting = true
    const wsUrl = import.meta.env.VITE_WS_URL

    if (!wsUrl) {
      console.error('VITE_WS_URL is not defined in environment variables')
      this.isConnecting = false
      return
    }

    const connectionUrl = `${wsUrl}?userId=${userId}`
    console.log('Connecting to WebSocket:', connectionUrl)

    this.ws = new WebSocket(connectionUrl)

    this.ws.onopen = () => {
      this.isConnecting = false
      console.log('WebSocket connected')
      this.emit('open', null)
    }

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log('[SocketClient] 🟢 WS RECEIVE:', message)
        this.emit('message', message)
      } catch (err) {
        console.error('Error parsing WebSocket message:', err)
      }
    }

    this.ws.onerror = (error) => {
      this.isConnecting = false
      console.error('WebSocket error:', error)
      this.emit('error', error)
    }

    this.ws.onclose = () => {
      this.isConnecting = false
      console.log('WebSocket closed')
      this.emit('close', null)
      this.ws = null
    }
  }

  send(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[SocketClient] 🔵 WS SEND:', payload)
      this.ws.send(JSON.stringify(payload))
    } else {
      console.warn('Cannot send message, WebSocket is not open')
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.userId = null
    this.isConnecting = false
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event).filter((cb) => cb !== callback)
      this.listeners.set(event, callbacks)
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => callback(data))
    }
  }
}

// Export a singleton instance
export const socketClient = new SocketClient()
