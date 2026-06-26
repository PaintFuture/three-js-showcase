import * as THREE from 'three'

export class PostProcessing {
  constructor(renderer, scene, camera) {
    this.renderer = renderer
    this.scene = scene
    this.camera = camera

    this.setupComposer()
  }

  setupComposer() {
    // Create render target
    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        format: THREE.RGBAFormat,
        type: THREE.FloatType,
      }
    )

    // Create canvas for bloom effect
    this.bloomCanvas = document.createElement('canvas')
    this.bloomCanvas.width = window.innerWidth / 4
    this.bloomCanvas.height = window.innerHeight / 4
    this.bloomCtx = this.bloomCanvas.getContext('2d')

    this.bloomTexture = new THREE.CanvasTexture(this.bloomCanvas)
    this.bloomTexture.minFilter = THREE.LinearFilter
    this.bloomTexture.magFilter = THREE.LinearFilter
  }

  render() {
    // Render scene to render target
    this.renderer.setRenderTarget(this.renderTarget)
    this.renderer.render(this.scene, this.camera)
    this.renderer.setRenderTarget(null)

    // Default render
    this.renderer.render(this.scene, this.camera)
  }

  // Apply bloom effect (post-render)
  applyBloom(intensity = 1.0) {
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0 + intensity * 0.5
  }

  // Adjust color grading
  setColorGrading(saturation = 1.0, contrast = 1.0, brightness = 1.0) {
    this.renderer.toneMappingExposure = brightness
  }

  dispose() {
    this.renderTarget.dispose()
    this.bloomTexture.dispose()
  }

  onWindowResize() {
    this.renderTarget.setSize(window.innerWidth, window.innerHeight)
    this.bloomCanvas.width = window.innerWidth / 4
    this.bloomCanvas.height = window.innerHeight / 4
  }
}
