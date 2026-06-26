export class StatsPanel {
  constructor() {
    this.startTime = performance.now()
    this.frameCount = 0
    this.fps = 0
    
    this.fpsEl = document.getElementById('fps')
    this.trianglesEl = document.getElementById('triangles')
    this.drawCallsEl = document.getElementById('drawcalls')
    this.memoryEl = document.getElementById('memory')

    this.lastUpdateTime = this.startTime
  }

  update(renderer) {
    this.frameCount++

    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastUpdateTime

    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime)
      this.frameCount = 0
      this.lastUpdateTime = currentTime

      this.fpsEl.textContent = this.fps

      if (renderer.info) {
        this.trianglesEl.textContent = (renderer.info.render.triangles || 0).toLocaleString()
        this.drawCallsEl.textContent = (renderer.info.render.calls || 0).toLocaleString()
      }

      if (performance.memory) {
        const memMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(1)
        this.memoryEl.textContent = memMB
      }
    }
  }
}

export class UI {
  constructor() {
    this.currentScene = 'landing'
    this.sceneCallbacks = {}

    this.setupSceneSwitcher()
  }

  setupSceneSwitcher() {
    const buttons = document.querySelectorAll('.scene-btn')
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const sceneId = e.target.id.replace('btn-', '')
        this.switchScene(sceneId)
      })
    })
  }

  onSceneSwitch(sceneId, callback) {
    this.sceneCallbacks[sceneId] = callback
  }

  switchScene(sceneId) {
    this.currentScene = sceneId

    // Update button states
    document.querySelectorAll('.scene-btn').forEach((btn) => {
      btn.classList.remove('active')
    })
    document.getElementById(`btn-${sceneId}`).classList.add('active')

    // Call registered callback
    if (this.sceneCallbacks[sceneId]) {
      this.sceneCallbacks[sceneId]()
    }
  }

  updateSceneInfo(title, description) {
    document.getElementById('scene-title').textContent = title
    document.getElementById('scene-description').textContent = description
  }

  updateSceneDescription(description) {
    document.getElementById('scene-description').textContent = description
  }
}
