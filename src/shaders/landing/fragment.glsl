// Landing portal fragment shader
uniform float uTime;
uniform float uPulse;
uniform vec3 uColor;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vPulse;

void main() {
  // Fresnel effect
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
  
  // Color based on normal direction
  vec3 baseColor = mix(uColor, vec3(0.3, 0.6, 1.0), fresnel);
  
  // Add glow based on pulse
  vec3 glowColor = vec3(0.5, 0.8, 1.0);
  float glow = fresnel * vPulse;
  
  vec3 finalColor = baseColor + glowColor * glow * 0.5;
  
  // Brightness variations based on sin wave
  float brightness = 0.8 + sin(uTime + length(vPosition)) * 0.2;
  finalColor *= brightness;
  
  gl_FragColor = vec4(finalColor, 0.9 + glow * 0.1);
}
