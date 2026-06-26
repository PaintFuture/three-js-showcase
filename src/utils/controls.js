import * as THREE from 'three'

export class OrbitControls {
  constructor(camera, domElement) {
    this.camera = camera
    this.domElement = domElement
    this.autoRotate = false
    this.autoRotateSpeed = 2
    
    this.theta = 0
    this.phi = Math.PI * 0.4
    this.radius = 5
    this.minRadius = 2
    this.maxRadius = 20
    
    this.target = new THREE.Vector3(0, 0, 0)
    
    this.isDragging = false
    this.previousMousePosition = { x: 0, y: 0 }
    
    this.setupEventListeners()
    this.update()
  }

  setupEventListeners() {
    this.domElement.addEventListener('mousedown', (e) => this.onMouseDown(e))
    this.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e))
    this.domElement.addEventListener('mouseup', (e) => this.onMouseUp(e))
    this.domElement.addEventListener('wheel', (e) => this.onMouseWheel(e), false)
    
    this.domElement.addEventListener('touchstart', (e) => this.onTouchStart(e))
    this.domElement.addEventListener('touchmove', (e) => this.onTouchMove(e))
    this.domElement.addEventListener('touchend', (e) => this.onTouchEnd(e))
  }

  onMouseDown(e) {
    this.isDragging = true
    this.previousMousePosition = { x: e.clientX, y: e.clientY }
  }

  onMouseMove(e) {
    if (!this.isDragging) return

    const deltaX = e.clientX - this.previousMousePosition.x
    const deltaY = e.clientY - this.previousMousePosition.y

    this.theta -= deltaX * 0.005
    this.phi -= deltaY * 0.005
    this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi))

    this.previousMousePosition = { x: e.clientX, y: e.clientY }
  }

  onMouseUp() {
    this.isDragging = false
  }

  onMouseWheel(e) {
    e.preventDefault()
    this.radius += e.deltaY * 0.01
    this.radius = Math.max(this.minRadius, Math.min(this.maxRadius, this.radius))
  }

  onTouchStart(e) {
    if (e.touches.length === 1) {
      this.isDragging = true
      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  onTouchMove(e) {
    if (!this.isDragging || e.touches.length !== 1) return
    
    const deltaX = e.touches[0].clientX - this.previousMousePosition.x
    const deltaY = e.touches[0].clientY - this.previousMousePosition.y

    this.theta -= deltaX * 0.005
    this.phi -= deltaY * 0.005
    this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi))

    this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  onTouchEnd() {
    this.isDragging = false
  }

  update() {
    if (this.autoRotate && !this.isDragging) {
      this.theta += this.autoRotateSpeed * 0.001
    }

    const x = this.target.x + this.radius * Math.sin(this.phi) * Math.cos(this.theta)
    const z = this.target.z + this.radius * Math.sin(this.phi) * Math.sin(this.theta)
    const y = this.target.y + this.radius * Math.cos(this.phi)

    this.camera.position.set(x, y, z)
    this.camera.lookAt(this.target)
  }

  setTarget(x, y, z) {
    this.target.set(x, y, z)
  }
}
