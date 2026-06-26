import * as THREE from 'three'
import { OrbitControls } from '../utils/controls.js'

export class AudioVisualizerScene {
  constructor(scene, camera, renderer) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.time = 0

    this.audioContext = null
    this.analyser = null
    this.dataArray = null
    this.bars = []

    this.setupScene()
    this.createBars()
    this.setupAudio()
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

  setupAudio() {
    // Create a simple audio context for oscillation
    // In real use, connect to microphone or audio file
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      this.audioContext = audioCtx

      // Create a simple oscillator for demo
      const osc = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      osc.frequency.setValueAtTime(200, audioCtx.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)

      osc.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      osc.start()
      this.oscillator = osc
    } catch (e) {
      console.log('AudioContext not available, using fallback visualization')
    }
  }

  update(deltaTime) {
    this.time += deltaTime

    // Generate pseudo-audio data from time
    this.bars.forEach((bar, i) => {
      const frequency = 0.5 + (i / this.bars.length) * 2
      const phase = this.time * frequency + i * 0.1
      const value = (Math.sin(phase) + 1) / 2

      bar.currentHeight = 1 + value * 4
      bar.mesh.scale.y = bar.currentHeight
      bar.mesh.position.y = bar.currentHeight / 2
    })

    this.controls.update()
  }

  dispose() {
    this.bars.forEach((bar) => {
      bar.mesh.geometry.dispose()
      bar.mesh.material.dispose()
    })
    this.scene.clear()

    if (this.oscillator) {
      this.oscillator.stop()
    }
  }
}
