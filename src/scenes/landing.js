import * as THREE from 'three'
import { OrbitControls } from '../utils/controls.js'

export class LandingScene {
  constructor(scene, camera, renderer) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer

    this.objects = []
    this.time = 0

    this.setupScene()
    this.createGeometries()
    this.createParticles()
  }

  setupScene() {
    this.scene.background = new THREE.Color(0x0a0e27)
    this.scene.fog = new THREE.Fog(0x0a0e27, 100, 200)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 7)
    this.scene.add(directionalLight)

    // Camera position
    this.camera.position.set(0, 3, 8)
    this.camera.lookAt(0, 0, 0)

    // Create a simple OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.setTarget(0, 0, 0)
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 1
  }

  createGeometries() {
    const geometries = [
      { geom: new THREE.IcosahedronGeometry(1, 4), pos: [0, 0, 0], color: 0x00ff88 },
      { geom: new THREE.TorusGeometry(1.5, 0.4, 16, 100), pos: [0, 0, 0], color: 0xff00ff },
      { geom: new THREE.BoxGeometry(1, 1, 1), pos: [0, 0, 0], color: 0x00aaff },
    ]

    geometries.forEach((g, idx) => {
      const material = new THREE.MeshStandardMaterial({
        color: g.color,
        metalness: 0.7,
        roughness: 0.2,
        emissive: g.color,
        emissiveIntensity: 0.3,
      })

      const mesh = new THREE.Mesh(g.geom, material)
      mesh.position.set(...g.pos)
      mesh.userData.baseScale = 1
      mesh.userData.rotationAxis = new THREE.Vector3(
        Math.random(),
        Math.random(),
        Math.random()
      ).normalize()

      this.scene.add(mesh)
      this.objects.push(mesh)
    })
  }

  createParticles() {
    const particleCount = 1000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50
      positions[i + 1] = (Math.random() - 0.5) * 50
      positions[i + 2] = (Math.random() - 0.5) * 50
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
    })

    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
  }

  update(deltaTime) {
    this.time += deltaTime

    // Rotate geometries
    this.objects.forEach((obj, idx) => {
      const speed = 0.5 + idx * 0.3
      obj.rotation.x += deltaTime * speed
      obj.rotation.y += deltaTime * speed * 0.7
      obj.rotation.z += deltaTime * speed * 0.5

      // Pulse scale
      const pulse = 0.8 + Math.sin(this.time * 2 + idx) * 0.2
      obj.scale.set(pulse, pulse, pulse)
    })

    // Rotate particles
    if (this.particles) {
      this.particles.rotation.x += deltaTime * 0.01
      this.particles.rotation.y += deltaTime * 0.02
    }

    // Update camera controls
    this.controls.update()
  }

  dispose() {
    this.objects.forEach((obj) => {
      obj.geometry.dispose()
      obj.material.dispose()
    })
    this.scene.clear()
  }
}
