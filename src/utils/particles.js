import * as THREE from 'three'

export class ParticleEmitter {
  constructor(config = {}) {
    this.config = {
      type: 'smoke', // smoke, fire, sparks, dust
      count: 1000,
      lifetime: 2.0,
      speed: 2.0,
      spread: Math.PI * 2,
      ...config,
    }

    this.particles = []
    this.geometry = new THREE.BufferGeometry()
    this.createMaterial()
    this.points = new THREE.Points(this.geometry, this.material)
    this.time = 0
  }

  createMaterial() {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')

    // Create particle texture
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)

    const texture = new THREE.CanvasTexture(canvas)

    let color
    if (this.config.type === 'fire') {
      color = new THREE.Color(0xff6b1a)
    } else if (this.config.type === 'smoke') {
      color = new THREE.Color(0x888888)
    } else if (this.config.type === 'sparks') {
      color = new THREE.Color(0xffff00)
    } else {
      color = new THREE.Color(0xcccccc)
    }

    this.material = new THREE.PointsMaterial({
      map: texture,
      color: color,
      size: 0.5,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    })
  }

  emit(position, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * this.config.spread
      const velocity = new THREE.Vector3(
        Math.cos(angle) * this.config.speed,
        Math.random() * this.config.speed * 1.5,
        Math.sin(angle) * this.config.speed
      )

      this.particles.push({
        position: position.clone(),
        velocity,
        life: 0,
        maxLife: this.config.lifetime + Math.random() * 0.5,
      })
    }

    this.updateGeometry()
  }

  updateGeometry() {
    const positions = new Float32Array(this.particles.length * 3)
    this.particles.forEach((p, i) => {
      positions[i * 3] = p.position.x
      positions[i * 3 + 1] = p.position.y
      positions[i * 3 + 2] = p.position.z
    })

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  }

  update(deltaTime) {
    this.time += deltaTime

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life += deltaTime
      p.position.add(p.velocity.clone().multiplyScalar(deltaTime))

      // Gravity
      p.velocity.y -= 9.81 * deltaTime * 0.3

      // Fade out
      if (this.config.type === 'smoke') {
        p.velocity.multiplyScalar(0.98)
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1)
      }
    }

    this.updateGeometry()

    // Update material opacity
    const avgLife = this.particles.reduce((sum, p) => sum + (1 - p.life / p.maxLife), 0) / Math.max(1, this.particles.length)
    this.material.opacity = Math.min(0.7, avgLife * 0.8)
  }

  getMesh() {
    return this.points
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
  }
}

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene
    this.emitters = []
  }

  createEmitter(position, type = 'smoke', count = 20) {
    const emitter = new ParticleEmitter({ type, count: 1000 })
    this.emitters.push(emitter)
    this.scene.add(emitter.getMesh())
    emitter.emit(position, count)
    return emitter
  }

  update(deltaTime) {
    this.emitters.forEach((emitter) => {
      emitter.update(deltaTime)
    })
  }

  dispose() {
    this.emitters.forEach((e) => e.dispose())
    this.emitters = []
  }
}
