import * as THREE from 'three'
import { OrbitControls } from '../utils/controls.js'
import vertexShader from '../shaders/terrain/vertex.glsl?raw'
import fragmentShader from '../shaders/terrain/fragment.glsl?raw'

export class TerrainScene {
  constructor(scene, camera, renderer) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer

    this.time = 0
    this.mousePos = new THREE.Vector2(0, 0)
    this.wireframe = false

    this.setupScene()
    this.createTerrain()
    this.setupMouseTracking()
  }

  setupScene() {
    this.scene.background = new THREE.Color(0x0f1419)
    this.scene.fog = new THREE.Fog(0x0f1419, 150, 300)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)

    // Camera position
    this.camera.position.set(30, 25, 30)
    this.camera.lookAt(0, 0, 0)

    // Create controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.setTarget(0, 5, 0)
    this.controls.radius = 40
  }

  createTerrain() {
    // Create large terrain mesh
    const geometry = new THREE.PlaneGeometry(100, 100, 256, 256)
    geometry.rotateX(-Math.PI / 2)

    // Create custom shader material
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uDisplacement: { value: 2 },
        uMousePos: { value: new THREE.Vector2(0, 0) },
        uWireframe: { value: this.wireframe },
      },
      wireframe: false,
      side: THREE.DoubleSide,
    })

    this.terrain = new THREE.Mesh(geometry, material)
    this.terrainMaterial = material
    this.scene.add(this.terrain)

    // Create wireframe overlay
    const wireframeGeometry = new THREE.PlaneGeometry(100, 100, 64, 64)
    wireframeGeometry.rotateX(-Math.PI / 2)
    const wireframeMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0,
      linewidth: 1,
    })
    this.wireframeOverlay = new THREE.LineSegments(wireframeGeometry, wireframeMaterial)
    this.wireframeOverlay.position.y = 0.1
    this.scene.add(this.wireframeOverlay)
  }

  setupMouseTracking() {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera)

      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const target = new THREE.Vector3()
      raycaster.ray.intersectPlane(plane, target)

      this.mousePos.set(target.x, target.z)
    })
  }

  toggleWireframe() {
    this.wireframe = !this.wireframe
    this.terrainMaterial.uniforms.uWireframe.value = this.wireframe
  }

  update(deltaTime) {
    this.time += deltaTime

    if (this.terrainMaterial) {
      this.terrainMaterial.uniforms.uTime.value = this.time
      this.terrainMaterial.uniforms.uMousePos.value = this.mousePos
    }

    // Update camera controls
    this.controls.update()
  }

  dispose() {
    this.terrain.geometry.dispose()
    this.terrainMaterial.dispose()
    this.scene.clear()
  }
}
