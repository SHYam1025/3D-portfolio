import * as THREE from "three";

/**
 * Environment Depth System
 * 
 * Creates layered environmental depth with:
 * - Atmospheric fog/gradient
 * - Dynamic monitor glow affecting character face
 * - Ground shadow plane
 * - Ambient particle layer
 * - Depth-aware lighting shifts
 */

export class EnvironmentSystem {
  private scene: THREE.Scene;
  
  // Monitor glow
  private monitorGlow: THREE.PointLight;
  private glowIntensity: number = 0;
  private targetGlowIntensity: number = 0;
  private glowFlickerTime: number = 0;
  
  // Ambient fill lights for depth
  private rimLight: THREE.DirectionalLight;
  private fillLight: THREE.PointLight;
  private keyLight: THREE.DirectionalLight;
  
  // Ground shadow
  private shadowPlane: THREE.Mesh | null = null;
  
  // Atmospheric particles
  private particles: THREE.Points | null = null;
  private particleTime: number = 0;
  


  constructor(scene: THREE.Scene) {
    this.scene = scene;
    
    // --- Key Light (primary directional, from upper left) ---
    this.keyLight = new THREE.DirectionalLight(0x5eead4, 0);
    this.keyLight.position.set(-3, 5, 2);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 50;
    scene.add(this.keyLight);
    
    // --- Rim Light (backlight for depth separation) ---
    this.rimLight = new THREE.DirectionalLight(0x22d3ee, 0);
    this.rimLight.position.set(2, 3, -5);
    this.rimLight.intensity = 0;
    scene.add(this.rimLight);
    
    // --- Fill Light (soft, opposite key) ---
    this.fillLight = new THREE.PointLight(0x1a1a3e, 0, 50, 2);
    this.fillLight.position.set(5, 12, 8);
    scene.add(this.fillLight);
    
    // --- Monitor Glow Light (dynamic, reacts to screen) ---
    this.monitorGlow = new THREE.PointLight(0x5eead4, 0, 15, 2.5);
    this.monitorGlow.position.set(0, 11, 3);
    this.monitorGlow.castShadow = false;
    scene.add(this.monitorGlow);
    
    // No fog — conflicts with transparent alpha background
    // this.fog = new THREE.FogExp2(0x050810, 0.003);
    // scene.fog = this.fog;
    
    // Create atmospheric elements
    this.createAtmosphericParticles();
  }

  private createGroundShadow() {
    const geometry = new THREE.PlaneGeometry(30, 30);
    const material = new THREE.MeshStandardMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.15,
      roughness: 1,
      metalness: 0,
    });
    
    this.shadowPlane = new THREE.Mesh(geometry, material);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.set(0, 3.3, 0); // At foot level
    this.shadowPlane.receiveShadow = true;
    this.scene.add(this.shadowPlane);
  }

  private createAtmosphericParticles() {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const opacities = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 30 + 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      opacities[i] = Math.random() * 0.3;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0x5eead4,
      size: 0.05,
      transparent: true,
      opacity: 0.15,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  /**
   * Gradually turn on all lighting (called after loading)
   */
  async turnOnLights(duration: number = 2.0): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const animate = () => {
        const elapsed = (performance.now() - startTime) / 1000;
        const t = Math.min(elapsed / duration, 1);
        const ease = t * t * (3 - 2 * t); // smoothstep
        
        this.keyLight.intensity = ease * 0.8;
        this.rimLight.intensity = ease * 0.4;
        this.fillLight.intensity = ease * 0.3;
        this.scene.environmentIntensity = ease * 0.64;
        
        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Set monitor screen state (controls glow)
   */
  setMonitorActive(active: boolean) {
    this.targetGlowIntensity = active ? 8 : 0;
  }

  /**
   * Position the monitor glow light near the screen object
   */
  updateMonitorGlowPosition(screenLight: THREE.Object3D | null) {
    if (screenLight) {
      const worldPos = new THREE.Vector3();
      screenLight.getWorldPosition(worldPos);
      this.monitorGlow.position.copy(worldPos);
      this.monitorGlow.position.z += 2; // offset toward character
    }
  }

  /**
   * Main update — call every frame
   */
  update(deltaTime: number) {
    const dt = Math.min(deltaTime, 0.05);
    
    // Monitor glow with flicker
    this.glowFlickerTime += dt;
    const flicker = 1.0 + Math.sin(this.glowFlickerTime * 8) * 0.05 
                        + Math.sin(this.glowFlickerTime * 13) * 0.03
                        + Math.sin(this.glowFlickerTime * 23) * 0.02;
    
    this.glowIntensity += (this.targetGlowIntensity - this.glowIntensity) * dt * 3;
    this.monitorGlow.intensity = this.glowIntensity * flicker;
    
    // Animate particles
    this.particleTime += dt;
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        // Gentle drift upward
        positions[i * 3 + 1] += dt * 0.05;
        // Gentle horizontal sway
        positions[i * 3] += Math.sin(this.particleTime + i * 0.5) * dt * 0.01;
        
        // Reset particles that drift too high
        if (positions[i * 3 + 1] > 32) {
          positions[i * 3 + 1] = 2;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }
  }

  /**
   * Cleanup
   */
  dispose() {
    if (this.shadowPlane) {
      this.scene.remove(this.shadowPlane);
      this.shadowPlane.geometry.dispose();
      (this.shadowPlane.material as THREE.Material).dispose();
    }
    if (this.particles) {
      this.scene.remove(this.particles);
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
    }
    this.scene.remove(this.keyLight);
    this.scene.remove(this.rimLight);
    this.scene.remove(this.fillLight);
    this.scene.remove(this.monitorGlow);
  }
}
