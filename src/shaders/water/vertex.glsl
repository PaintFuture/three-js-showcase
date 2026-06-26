// Water vertex shader with FFT-based wave simulation
uniform float uTime;
uniform sampler2D uWaveTexture;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform vec2 uWaveDirection;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vWaveHeight;
varying vec2 vUv;

// Gerstner wave function
vec3 gerstnerWave(vec4 wave, vec3 p) {
  float steepness = wave.z;
  float wavelength = wave.w;
  float k = 2.0 * 3.14159 / wavelength;
  float c = sqrt(9.81 / k);
  vec2 d = normalize(wave.xy);
  float f = k * (dot(d, p.xz) - c * uTime);
  float a = steepness / k;
  
  return vec3(
    d.x * (a * cos(f)),
    a * sin(f),
    d.y * (a * cos(f))
  );
}

void main() {
  vUv = uv;
  vPosition = position;
  
  // Combine multiple Gerstner waves
  vec3 gridPoint = position;
  vec3 worldPos = gridPoint;
  
  worldPos += gerstnerWave(vec4(1.0, 0.0, 0.25, 60.0), gridPoint);
  worldPos += gerstnerWave(vec4(0.2, 0.4, 0.15, 31.0), gridPoint);
  worldPos += gerstnerWave(vec4(0.2, 0.6, 0.1, 18.0), gridPoint);
  
  vWaveHeight = worldPos.y;
  
  // Compute normal from wave gradients
  vec3 tangent = normalize(vec3(1.0, 0.0, 0.0));
  vec3 bitangent = normalize(vec3(0.0, 0.0, 1.0));
  
  vec3 neighbour1 = gridPoint + vec3(0.1, 0.0, 0.0);
  vec3 neighbour2 = gridPoint + vec3(0.0, 0.0, 0.1);
  
  neighbour1 += gerstnerWave(vec4(1.0, 0.0, 0.25, 60.0), neighbour1);
  neighbour1 += gerstnerWave(vec4(0.2, 0.4, 0.15, 31.0), neighbour1);
  neighbour1 += gerstnerWave(vec4(0.2, 0.6, 0.1, 18.0), neighbour1);
  
  neighbour2 += gerstnerWave(vec4(1.0, 0.0, 0.25, 60.0), neighbour2);
  neighbour2 += gerstnerWave(vec4(0.2, 0.4, 0.15, 31.0), neighbour2);
  neighbour2 += gerstnerWave(vec4(0.2, 0.6, 0.1, 18.0), neighbour2);
  
  tangent = normalize(neighbour1 - worldPos);
  bitangent = normalize(neighbour2 - worldPos);
  vNormal = normalize(cross(bitangent, tangent));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
}
