import * as THREE from 'three'
import { LandingScene } from './scenes/landing.js'
import { TerrainScene } from './scenes/terrain.js'
import { WaterScene } from './scenes/water.js'
import { AudioVisualizerScene } from './scenes/visualizer.js'
import { UI, StatsPanel } from './components/ui.js'
import { PostProcessing } from './utils/postprocessing.js'
import { ParticleSystem } from './utils/particles.js'

class App {
  constructor() {
    this.visualizerBaseDescription = 'Reactive 3D visualization driven by live microphone frequencies. Chrome on Windows and Android will prompt for mic access when you open this scene.'

    this.setup()
    this.createScenes()
    this.setupUI()
    this.switchScene('landing')
    this.animate()
  }

  setup() {
    // Scene setup
    this.scene = new THREE.Scene()

    // Camera setup
    const width = window.innerWidth
    const height = window.innerHeight
    const aspect = width / height
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping

    const container = document.getElementById('canvas-container')
    container.appendChild(this.renderer.domElement)

    // Post-processing
    this.postprocessing = new PostProcessing(this.renderer, this.scene, this.camera)

    // Particle system
    this.particleSystem = new ParticleSystem(this.scene)

    // Stats
    this.stats = new StatsPanel()

    // Clock for deltaTime
    this.clock = new THREE.Clock()

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize())
  }

  createScenes() {
    this.scenes = {}
    this.scenes.landing = new LandingScene(this.scene, this.camera, this.renderer)
    this.scenes.terrain = new TerrainScene(this.scene, this.camera, this.renderer)
    this.scenes.water = new WaterScene(this.scene, this.camera, this.renderer)
    this.scenes.visualizer = new AudioVisualizerScene(this.scene, this.camera, this.renderer, {
      onStatusChange: (status) => this.updateVisualizerDescription(status),
    })
    this.currentSceneKey = null
  }

  setupUI() {
    this.ui = new UI()

    // Register scene switch callbacks
    this.ui.onSceneSwitch('landing', () => {
      this.switchScene('landing')
    })

    this.ui.onSceneSwitch('terrain', () => {
      this.switchScene('terrain')
    })

    this.ui.onSceneSwitch('water', () => {
      this.switchScene('water')
    })

    this.ui.onSceneSwitch('visualizer', () => {
      this.switchScene('visualizer')
    })
  }

  updateVisualizerDescription(status) {
    if (this.currentSceneKey !== 'visualizer') {
      return
    }

    this.ui.updateSceneDescription(`${this.visualizerBaseDescription} ${status}`)
  }

  switchScene(sceneKey) {
    // Dispose current scene
    if (this.currentSceneKey && this.scenes[this.currentSceneKey]) {
      this.scenes[this.currentSceneKey].dispose()
      this.scene.clear()
    }

    // Clear particles
    this.particleSystem.dispose()
    this.particleSystem = new ParticleSystem(this.scene)

    // Setup new scene
    this.currentSceneKey = sceneKey
    this.scene = new THREE.Scene()
    this.postprocessing = new PostProcessing(this.renderer, this.scene, this.camera)
    this.particleSystem = new ParticleSystem(this.scene)

    if (sceneKey === 'landing') {
      this.scenes.landing = new LandingScene(this.scene, this.camera, this.renderer)
      this.ui.updateSceneInfo(
        'Landing Portal',
        'An animated portal scene featuring rotating geometries, custom shaders, and bloom effects.'
      )
    } else if (sceneKey === 'terrain') {
      this.scenes.terrain = new TerrainScene(this.scene, this.camera, this.renderer)
      this.ui.updateSceneInfo(
        'Procedural Terrain',
        'GPU-based terrain displacement with Perlin noise, interactive mouse influence, and real-time height-based coloring.'
      )
    } else if (sceneKey === 'water') {
      this.scenes.water = new WaterScene(this.scene, this.camera, this.renderer)
      this.ui.updateSceneInfo(
        'Water Simulation',
        'Gerstner wave simulation with dynamic reflections, foam effects, and realistic water rendering.'
      )
    } else if (sceneKey === 'visualizer') {
      this.scenes.visualizer = new AudioVisualizerScene(this.scene, this.camera, this.renderer, {
        onStatusChange: (status) => this.updateVisualizerDescription(status),
      })
      this.ui.updateSceneInfo(
        'Audio Visualizer',
        this.visualizerBaseDescription
      )

      this.scenes.visualizer.activate()
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate())

    const deltaTime = this.clock.getDelta()

    // Update current scene
    if (this.currentSceneKey && this.scenes[this.currentSceneKey]) {
      this.scenes[this.currentSceneKey].update(deltaTime)
    }

    // Update particles
    this.particleSystem.update(deltaTime)

    // Render
    this.renderer.render(this.scene, this.camera)

    // Update stats
    this.stats.update(this.renderer)
  }

  onWindowResize() {
    const width = window.innerWidth
    const height = window.innerHeight
    const aspect = width / height

    this.camera.aspect = aspect
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
    this.postprocessing.onWindowResize()
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new App()
  })
} else {
  new App()
}