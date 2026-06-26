// Landing portal vertex shader
uniform float uTime;
uniform float uPulse;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vPulse;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  vPulse = uPulse;

  vec3 pos = position;
  
  // Add subtle wave deformation
  pos.x += sin(uTime * 0.5 + position.y * 3.0) * 0.05;
  pos.y += cos(uTime * 0.3 + position.z * 2.0) * 0.05;
  pos.z += sin(uTime * 0.4 + position.x * 2.5) * 0.05;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
