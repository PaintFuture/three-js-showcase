# Three.js Showcase

A comprehensive Three.js demonstration project featuring advanced rendering techniques, custom shaders, procedural generation, and post-processing effects.

## Features

- **Landing Scene**: Animated portal with rotating geometries, custom shaders, and bloom effects
- **Terrain Demo**: GPU-based procedural terrain with Perlin noise displacement and interactive mouse control
- **Custom Shaders**: Hand-crafted vertex and fragment shaders for unique visual effects
- **OrbitControls**: Smooth 3D navigation with mouse and touch support
- **Stats Panel**: Real-time FPS, draw call, and memory monitoring
- **Responsive Design**: Mobile-friendly UI with touch support
- **Dark Mode UI**: Built with TailwindCSS for modern styling

## Getting Started

### Prerequisites

- Node.js 24 and npm

### Installation

```bash
npm install
```

If you use a Node version manager, switch to Node 24 before installing dependencies.

### Development

```bash
npm run dev
```

Opens the development server at `http://localhost:3000`

### Build

```bash
npm run build
```

Generates optimized build in `docs/` for GitHub Pages deployment.

### Preview

```bash
npm run preview
```

Serves the built site locally at `http://localhost:4173`

### Local Deployment

```bash
npm run build
npm run preview -- --host 0.0.0.0
```

This rebuilds the static output into `docs/` and serves that production build locally for verification.

## Project Structure

```
├── src/
│   ├── index.html           # Main HTML entry
│   ├── main.js              # Application entry point
│   ├── style.css            # Global styles with TailwindCSS
│   ├── scenes/
│   │   ├── landing.js       # Landing portal scene
│   │   └── terrain.js       # Procedural terrain scene
│   ├── shaders/
│   │   ├── landing/         # Landing scene shaders
│   │   └── terrain/         # Terrain shaders
│   ├── utils/
│   │   ├── controls.js      # OrbitControls implementation
│   │   └── postprocessing.js # Post-processing effects
│   └── components/
│       └── ui.js            # UI components and stats panel
├── docs/                    # GitHub Pages output (generated)
├── vite.config.js
├── postcss.config.js
├── tailwind.config.js
└── package.json
```

## Technologies

- **Three.js**: 3D graphics library
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **GLSL**: Custom shaders
- **WebGL**: Graphics API

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

The project is configured for GitHub Pages deployment:

1. Push to main branch
2. GitHub Actions automatically builds and deploys to `https://username.github.io/three-js-showcase/`

## Performance

- Optimized for 60 FPS on modern devices
- Responsive canvas scaling
- Efficient geometry management
- Shader-based procedural generation

## Future Enhancements

- Additional demo scenes
- Water simulation
- Particle effects
- Audio visualization
- Advanced post-processing (SSAO, SSR)
- Performance optimization for mobile

## License

MIT

## Author

Created with Copilot
