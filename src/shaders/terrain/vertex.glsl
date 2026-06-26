// Terrain vertex shader with displacement
uniform float uTime;
uniform float uDisplacement;
uniform vec2 uMousePos;
uniform sampler2D uHeightMap;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vHeight;
varying vec2 vUv;

// Simple Perlin-like noise
float noise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float n00 = noise(i);
  float n10 = noise(i + vec2(1.0, 0.0));
  float n01 = noise(i + vec2(0.0, 1.0));
  float n11 = noise(i + vec2(1.0, 1.0));

  float nx0 = mix(n00, n10, f.x);
  float nx1 = mix(n01, n11, f.x);
  return mix(nx0, nx1, f.y);
}

float perlinNoise(vec2 p) {
  float total = 0.0;
  float amplitude = 1.0;
  float frequency = 1.0;
  float maxValue = 0.0;

  for(int i = 0; i < 5; i++) {
    total += smoothNoise(p * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return total / maxValue;
}

void main() {
  vUv = uv;
  vPosition = position;

  // Generate height from Perlin noise
  float height = perlinNoise(position.xz * 0.5) * 2.0 - 1.0;
  height += sin(position.x * 0.1 + uTime * 0.1) * 0.2;
  height += cos(position.z * 0.1 + uTime * 0.15) * 0.2;

  // Mouse influence
  float dist = length(position.xz - uMousePos);
  float mouseBump = exp(-dist * dist / 0.5) * 0.5;
  height += mouseBump;

  vHeight = height;

  // Displace vertex
  vec3 displaced = position + normal * height * uDisplacement;

  // Compute normal (simplified finite difference)
  vec3 tangent = normalize(vec3(1.0, 0.0, 0.5));
  vec3 bitangent = normalize(cross(normal, tangent));
  
  float h_x = perlinNoise((position.xz + vec2(0.1, 0.0)) * 0.5) * 2.0 - 1.0;
  float h_z = perlinNoise((position.xz + vec2(0.0, 0.1)) * 0.5) * 2.0 - 1.0;
  
  vec3 adj_normal = normalize(normal + vec3(height - h_x, 0.0, height - h_z) * 0.1);
  vNormal = normalize(normalMatrix * adj_normal);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
