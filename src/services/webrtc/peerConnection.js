import { ForwardSignalBodySchema } from '../../schemas/ForwardSignalBody'
import { socketClient } from '../websocket/socketClient'

export class WebRTCManager {
  constructor() {
    this.pc = null
    this.localStream = null
    this.remoteStream = new MediaStream()
    this.targetConnectionId = null
    this.onRemoteTrack = null
  }

  async initializeMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      return this.localStream
    } catch (err) {
      console.error('Error accessing media devices:', err)
      throw new Error('Failed to access camera and microphone. Please allow permissions.')
    }
  }

  setupPeerConnection(iceServers, role, targetConnectionId) {
    this.targetConnectionId = targetConnectionId

    // Note: ensure mapping of the iceServers to the format RTCPeerConnection expects
    this.pc = new RTCPeerConnection({ iceServers })

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.pc.addTrack(track, this.localStream)
      })
    }

    // Handle Local ICE Candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: 'candidate',
          candidate: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          },
        })
      }
    }

    // Handle Remote Tracks
    this.pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind)
      this.remoteStream.addTrack(event.track)
      if (this.onRemoteTrack) {
        this.onRemoteTrack(this.remoteStream)
      }
    }

    // If caller, create SDP Offer
    if (role === 'caller') {
      this.createOffer()
    }
  }

  async createOffer() {
    try {
      const offer = await this.pc.createOffer()
      await this.pc.setLocalDescription(offer)
      this.sendSignal({
        type: 'offer',
        sdp: offer.sdp,
      })
    } catch (err) {
      console.error('Error creating offer:', err)
    }
  }

  sendSignal(signalData) {
    if (!this.targetConnectionId) return

    try {
      // Structure based on your ForwardSignal Zod Schema
      const payload = {
        action: 'forward_signal',
        targetConnectionId: this.targetConnectionId,
        signalData,
      }

      const validatedPayload = ForwardSignalBodySchema.parse(payload)
      socketClient.send(validatedPayload)
    } catch (err) {
      console.error('Zod Validation error to ForwardSignal:', err)
    }
  }

  async handleSignalingData(data) {
    if (!this.pc) return

    try {
      if (data.type === 'offer') {
        await this.pc.setRemoteDescription(new RTCSessionDescription(data))
        const answer = await this.pc.createAnswer()
        await this.pc.setLocalDescription(answer)
        this.sendSignal({
          type: 'answer',
          sdp: answer.sdp,
        })
      } else if (data.type === 'answer') {
        await this.pc.setRemoteDescription(new RTCSessionDescription(data))
      } else if (data.type === 'candidate') {
        // Supported by the Zod Schema fallback
        if (data.candidate) {
          await this.pc.addIceCandidate(new RTCIceCandidate(data.candidate))
        }
      } else if (data.type === 'ice') {
        // fallback if backend overrides Type to ice somewhere manually
        if (data.candidate) {
          await this.pc.addIceCandidate(new RTCIceCandidate(data.candidate))
        }
      }
    } catch (err) {
      console.error('Error handling signaling data:', err)
    }
  }

  disconnect() {
    if (this.pc) {
      this.pc.close()
      this.pc = null
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop())
      this.localStream = null
    }
    this.remoteStream = new MediaStream()
    this.targetConnectionId = null
  }
}

export const webrtcManager = new WebRTCManager()
