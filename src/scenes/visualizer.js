import * as THREE from 'three'
import { OrbitControls } from '../utils/controls.js'

export class AudioVisualizerScene {
  constructor(scene, camera, renderer, options = {}) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.time = 0
    this.onStatusChange = options.onStatusChange || (() => {})

    this.audioContext = null
    this.audioStream = null
    this.sourceNode = null
    this.analyser = null
    this.dataArray = null
    this.audioSetupPromise = null
    this.bars = []

    this.setupScene()
    this.createBars()
    this.updateStatus('Click or tap Visualizer to enable microphone input.')
  }

  setupScene() {
    this.scene.background = new THREE.Color(0x0a0e27)
    this.scene.fog = new THREE.Fog(0x0a0e27, 100, 200)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    this.scene.add(directionalLight)

    // Camera
    this.camera.position.set(0, 5, 30)
    this.camera.lookAt(0, 0, 0)

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.setTarget(0, 5, 0)
    this.controls.radius = 35
  }

  createBars() {
    const barCount = 64
    const spacing = 0.6
    const startX = -(barCount * spacing) / 2

    for (let i = 0; i < barCount; i++) {
      const geometry = new THREE.BoxGeometry(0.5, 1, 0.5)
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(i / barCount, 0.8, 0.6),
        metalness: 0.3,
        roughness: 0.4,
        emissive: new THREE.Color().setHSL(i / barCount, 0.8, 0.3),
        emissiveIntensity: 0.5,
      })

      const bar = new THREE.Mesh(geometry, material)
      bar.position.x = startX + i * spacing
      bar.position.z = 0

      this.scene.add(bar)
      this.bars.push({
        mesh: bar,
        baseHeight: 1,
        currentHeight: 1,
      })
    }
  }

  updateStatus(message) {
    this.onStatusChange(message)
  }

  async activate() {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.updateStatus('Microphone input is not available in this browser. Use Chrome on localhost or HTTPS.')
      return
    }

    if (this.analyser && this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      this.updateStatus('Microphone connected. Speak to drive the visualizer.')
      return
    }

    if (!this.audioSetupPromise) {
      this.audioSetupPromise = this.setupAudio().finally(() => {
        if (!this.analyser) {
          this.audioSetupPromise = null
        }
      })
    }

    await this.audioSetupPromise
  }

  async setupAudio() {
    this.updateStatus('Requesting microphone access...')

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) {
        throw new Error('AudioContext unavailable')
      }

      this.audioContext = new AudioContextClass()
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      })

      this.sourceNode = this.audioContext.createMediaStreamSource(this.audioStream)
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 256
      this.analyser.smoothingTimeConstant = 0.82
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
      this.sourceNode.connect(this.analyser)

      this.updateStatus('Microphone connected. Speak to drive the visualizer.')
    } catch (error) {
      console.error('Microphone setup failed:', error)

      if (this.sourceNode) {
        this.sourceNode.disconnect()
        this.sourceNode = null
      }

      if (this.audioStream) {
        this.audioStream.getTracks().forEach((track) => track.stop())
        this.audioStream = null
      }

      if (this.audioContext) {
        this.audioContext.close()
        this.audioContext = null
      }

      this.analyser = null
      this.dataArray = null

      if (error?.name === 'NotAllowedError') {
        this.updateStatus('Microphone access was blocked. Allow the mic in Chrome and reopen Visualizer.')
      } else if (error?.name === 'NotFoundError') {
        this.updateStatus('No microphone was found on this device.')
      } else {
        this.updateStatus('Microphone setup failed. Use Chrome on localhost or HTTPS and try again.')
      }
    }
  }

  update(deltaTime) {
    this.time += deltaTime

    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray)
    }

    this.bars.forEach((bar, i) => {
      const sample = this.dataArray ? this.dataArray[i] / 255 : 0
      const fallback = (Math.sin(this.time * (0.5 + (i / this.bars.length) * 2) + i * 0.1) + 1) / 2
      const value = this.dataArray ? sample : fallback

      bar.currentHeight += (1 + value * 10 - bar.currentHeight) * 0.18
      bar.mesh.scale.y = bar.currentHeight
      bar.mesh.position.y = bar.currentHeight / 2

      const intensity = 0.15 + value * 1.8
      bar.mesh.material.emissiveIntensity = intensity
    })

    this.controls.update()
  }

  dispose() {
    this.bars.forEach((bar) => {
      bar.mesh.geometry.dispose()
      bar.mesh.material.dispose()
    })
    this.scene.clear()

    if (this.sourceNode) {
      this.sourceNode.disconnect()
      this.sourceNode = null
    }

    if (this.analyser) {
      this.analyser.disconnect()
      this.analyser = null
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop())
      this.audioStream = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    this.dataArray = null
    this.audioSetupPromise = null
  }
}
