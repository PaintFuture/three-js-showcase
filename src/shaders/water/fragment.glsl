// Water fragment shader with reflection and refraction
uniform float uTime;
uniform vec3 uCameraPos;
uniform samplerCube uEnvMap;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vWaveHeight;
varying vec2 vUv;

void main() {
  // Water color based on depth
  vec3 deepWater = vec3(0.1, 0.2, 0.5);
  vec3 shallowWater = vec3(0.2, 0.6, 0.8);
  vec3 waterColor = mix(shallowWater, deepWater, clamp(abs(vWaveHeight) / 2.0, 0.0, 1.0));

  // View direction
  vec3 viewDir = normalize(uCameraPos - vPosition);
  
  // Fresnel effect (more reflective at grazing angles)
  float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
  
  // Environment reflection
  vec3 reflected = reflect(-viewDir, vNormal);
  vec3 reflectedColor = vec3(0.5, 0.7, 1.0) * (0.3 + fresnel * 0.7);
  
  // Lighting
  vec3 lightDir = normalize(vec3(sin(uTime * 0.3), 1.0, cos(uTime * 0.3)));
  float diffuse = max(dot(vNormal, lightDir), 0.0);
  
  // Specular highlights
  vec3 halfDir = normalize(lightDir + viewDir);
  float specular = pow(max(dot(vNormal, halfDir), 0.0), 64.0);
  
  // Foam (white caps on wave peaks)
  float foam = smoothstep(0.5, 1.0, vWaveHeight);
  
  // Combine effects
  vec3 baseColor = mix(waterColor, reflectedColor, fresnel);
  vec3 finalColor = baseColor * (0.8 + diffuse * 0.4);
  finalColor += specular * vec3(1.0) * 0.3;
  finalColor = mix(finalColor, vec3(1.0), foam * 0.4);
  
  gl_FragColor = vec4(finalColor, 0.9 + foam * 0.1);
}
