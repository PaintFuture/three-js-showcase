import * as THREE from 'three'
import { OrbitControls } from '../utils/controls.js'
import waterVertexShader from '../shaders/water/vertex.glsl?raw'
import waterFragmentShader from '../shaders/water/fragment.glsl?raw'

export class WaterScene {
  constructor(scene, camera, renderer) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.time = 0

    this.setupScene()
    this.createWater()
    this.createSkybox()
  }

  setupScene() {
    this.scene.background = new THREE.Color(0x87ceeb)
    this.scene.fog = new THREE.Fog(0x87ceeb, 200, 500)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.position.set(20, 30, 20)
    this.scene.add(directionalLight)

    // Camera position
    this.camera.position.set(0, 5, 20)
    this.camera.lookAt(0, 0, 0)

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.setTarget(0, 0, 0)
    this.controls.radius = 25
  }

  createWater() {
    // Create large water plane with high resolution
    const geometry = new THREE.PlaneGeometry(200, 200, 128, 128)
    geometry.rotateX(-Math.PI / 2)

    const material = new THREE.ShaderMaterial({
      vertexShader: waterVertexShader,
      fragmentShader: waterFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uWaveAmplitude: { value: 1.0 },
        uWaveFrequency: { value: 1.0 },
        uWaveDirection: { value: new THREE.Vector2(1, 1) },
        uCameraPos: { value: this.camera.position },
        uEnvMap: { value: null },
      },
      side: THREE.DoubleSide,
      transparent: true,
    })

    this.water = new THREE.Mesh(geometry, material)
    this.waterMaterial = material
    this.scene.add(this.water)
  }

  createSkybox() {
    // Simple sky gradient
    const skyGeometry = new THREE.SphereGeometry(300, 32, 32)
    const skyMaterial = new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      side: THREE.BackSide,
    })
    const sky = new THREE.Mesh(skyGeometry, skyMaterial)
    this.scene.add(sky)
  }

  update(deltaTime) {
    this.time += deltaTime

    if (this.waterMaterial) {
      this.waterMaterial.uniforms.uTime.value = this.time
      this.waterMaterial.uniforms.uCameraPos.value = this.camera.position
    }

    this.controls.update()
  }

  dispose() {
    this.water.geometry.dispose()
    this.waterMaterial.dispose()
    this.scene.clear()
  }
}
