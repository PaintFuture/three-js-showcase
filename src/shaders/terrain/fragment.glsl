// Terrain fragment shader
uniform float uTime;
uniform bool uWireframe;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vHeight;
varying vec2 vUv;

void main() {
  if (uWireframe) {
    gl_FragColor = vec4(0.2, 0.8, 0.4, 1.0);
    return;
  }

  // Lighting
  vec3 lightDir = normalize(vec3(sin(uTime * 0.3), 1.0, cos(uTime * 0.3)));
  float diff = max(dot(vNormal, lightDir), 0.0);
  
  // Height-based coloring
  vec3 lowColor = vec3(0.2, 0.5, 0.2);     // Green
  vec3 midColor = vec3(0.8, 0.7, 0.3);     // Yellow/tan
  vec3 highColor = vec3(1.0, 1.0, 1.0);    // White
  
  vec3 baseColor;
  if (vHeight < 0.0) {
    baseColor = mix(vec3(0.1, 0.1, 0.3), lowColor, vHeight + 1.0);
  } else if (vHeight < 0.5) {
    baseColor = mix(lowColor, midColor, vHeight * 2.0);
  } else {
    baseColor = mix(midColor, highColor, (vHeight - 0.5) * 2.0);
  }

  // Ambient + diffuse + specular
  vec3 ambient = baseColor * 0.3;
  vec3 diffuse = baseColor * diff * 0.8;
  
  vec3 viewDir = normalize(cameraPosition - vPosition);
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(vNormal, halfDir), 0.0), 32.0);
  vec3 specular = vec3(1.0) * spec * 0.3;

  vec3 color = ambient + diffuse + specular;

  gl_FragColor = vec4(color, 1.0);
}
