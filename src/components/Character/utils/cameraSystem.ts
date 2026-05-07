import * as THREE from "three";

/**
 * Cinematic Camera System
 * 
 * Controls camera position, target, and FOV with spring-based interpolation.
 * Each scene state defines a camera configuration, and the system smoothly
 * transitions between them using damped springs.
 */

export interface CameraState {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
  zoom: number;
}

// Scene state camera configurations
export const CAMERA_STATES: Record<string, CameraState> = {
  // Phase 1: Chest-up portrait — character centered, intimate framing
  intro: {
    position: new THREE.Vector3(0, 13.5, 22),
    lookAt: new THREE.Vector3(0, 12.8, 0),
    fov: 16,
    zoom: 1.15,
  },
  // Phase 2: Pull back, reveal desk environment
  about: {
    position: new THREE.Vector3(-3.5, 12.0, 30),
    lookAt: new THREE.Vector3(-1, 11.5, 0),
    fov: 18,
    zoom: 1.0,
  },
  // Phase 3: Wide shot with workspace visible — lower angle
  working: {
    position: new THREE.Vector3(-4.5, 10.0, 50),
    lookAt: new THREE.Vector3(-1, 9.8, 0),
    fov: 20,
    zoom: 1.0,
  },
  // Phase 4: Character slides to side, content takes focus
  career: {
    position: new THREE.Vector3(-8, 9.5, 55),
    lookAt: new THREE.Vector3(-4, 9.5, 0),
    fov: 18,
    zoom: 1.0,
  },
  // Phase 5: Continue with character off-screen
  projects: {
    position: new THREE.Vector3(-10, 9.5, 60),
    lookAt: new THREE.Vector3(-6, 9.5, 0),
    fov: 16,
    zoom: 1.0,
  },
  // Phase 6: Contact — pull back to medium shot
  contact: {
    position: new THREE.Vector3(-5, 11, 35),
    lookAt: new THREE.Vector3(-2, 10.5, 0),
    fov: 18,
    zoom: 1.0,
  },
};

export class CinematicCamera {
  camera: THREE.PerspectiveCamera;

  // Current interpolated values
  private currentPos: THREE.Vector3;
  private currentLookAt: THREE.Vector3;
  private currentFov: number;
  private currentZoom: number;

  // Target values (set by scene director)
  private targetPos: THREE.Vector3;
  private targetLookAt: THREE.Vector3;
  private targetFov: number;
  private targetZoom: number;

  // Velocity for spring damping
  private velPos: THREE.Vector3;
  private velLookAt: THREE.Vector3;
  private velFov: number;
  private velZoom: number;

  // Spring parameters
  private springDamping: number = 4.0;
  private springStiffness: number = 12.0;

  // Micro-motion (subtle continuous camera sway)
  private microMotionTime: number = 0;
  private microMotionEnabled: boolean = true;

  // Scroll-driven dolly offset
  private dollyOffset: number = 0;
  private dollyVelocity: number = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    const initial = CAMERA_STATES.intro;

    this.currentPos = initial.position.clone();
    this.currentLookAt = initial.lookAt.clone();
    this.currentFov = initial.fov;
    this.currentZoom = initial.zoom;

    this.targetPos = initial.position.clone();
    this.targetLookAt = initial.lookAt.clone();
    this.targetFov = initial.fov;
    this.targetZoom = initial.zoom;

    this.velPos = new THREE.Vector3(0, 0, 0);
    this.velLookAt = new THREE.Vector3(0, 0, 0);
    this.velFov = 0;
    this.velZoom = 0;

    // Apply initial state
    this.camera.position.copy(this.currentPos);
    this.camera.fov = this.currentFov;
    this.camera.zoom = this.currentZoom;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Blend between two camera states based on progress (0-1)
   */
  blendStates(stateA: string, stateB: string, progress: number) {
    const a = CAMERA_STATES[stateA];
    const b = CAMERA_STATES[stateB];
    if (!a || !b) return;

    const t = this.smoothstep(progress);

    this.targetPos.lerpVectors(a.position, b.position, t);
    this.targetLookAt.lerpVectors(a.lookAt, b.lookAt, t);
    this.targetFov = THREE.MathUtils.lerp(a.fov, b.fov, t);
    this.targetZoom = THREE.MathUtils.lerp(a.zoom, b.zoom, t);
  }

  /**
   * Set camera to a specific state
   */
  setState(stateName: string) {
    const state = CAMERA_STATES[stateName];
    if (!state) return;

    this.targetPos.copy(state.position);
    this.targetLookAt.copy(state.lookAt);
    this.targetFov = state.fov;
    this.targetZoom = state.zoom;
  }

  /**
   * Set scroll-driven dolly offset
   */
  setDollyOffset(offset: number) {
    this.dollyOffset = offset;
  }

  /**
   * Update spring parameters for different feel
   */
  setSpringParams(damping: number, stiffness: number) {
    this.springDamping = damping;
    this.springStiffness = stiffness;
  }

  /**
   * Main update loop — call every frame with delta time
   */
  update(deltaTime: number) {
    const dt = Math.min(deltaTime, 0.05); // Clamp to avoid instability

    // Spring physics for position
    this.springVector(
      this.currentPos,
      this.targetPos,
      this.velPos,
      dt
    );

    // Spring physics for lookAt
    this.springVector(
      this.currentLookAt,
      this.targetLookAt,
      this.velLookAt,
      dt
    );

    // Spring physics for FOV
    const fovSpring = this.springScalar(
      this.currentFov,
      this.targetFov,
      this.velFov,
      dt
    );
    this.currentFov = fovSpring.value;
    this.velFov = fovSpring.velocity;

    // Spring physics for zoom
    const zoomSpring = this.springScalar(
      this.currentZoom,
      this.targetZoom,
      this.velZoom,
      dt
    );
    this.currentZoom = zoomSpring.value;
    this.velZoom = zoomSpring.velocity;

    // Dolly offset spring
    const dollySpring = this.springScalar(
      0,
      this.dollyOffset,
      this.dollyVelocity,
      dt
    );
    this.dollyVelocity = dollySpring.velocity;

    // Add micro-motion for life
    this.microMotionTime += dt;
    let microX = 0, microY = 0;
    if (this.microMotionEnabled) {
      microX = Math.sin(this.microMotionTime * 0.3) * 0.015;
      microY = Math.cos(this.microMotionTime * 0.2) * 0.01;
    }

    // Apply to camera
    this.camera.position.set(
      this.currentPos.x + microX,
      this.currentPos.y + microY,
      this.currentPos.z + dollySpring.value
    );
    this.camera.fov = this.currentFov;
    this.camera.zoom = this.currentZoom;
    this.camera.updateProjectionMatrix();

    // Look at target
    this.camera.lookAt(this.currentLookAt);
  }

  /**
   * Instantly snap to a state (no interpolation)
   */
  snapToState(stateName: string) {
    const state = CAMERA_STATES[stateName];
    if (!state) return;

    this.currentPos.copy(state.position);
    this.currentLookAt.copy(state.lookAt);
    this.currentFov = state.fov;
    this.currentZoom = state.zoom;
    this.targetPos.copy(state.position);
    this.targetLookAt.copy(state.lookAt);
    this.targetFov = state.fov;
    this.targetZoom = state.zoom;
    this.velPos.set(0, 0, 0);
    this.velLookAt.set(0, 0, 0);
    this.velFov = 0;
    this.velZoom = 0;

    this.camera.position.copy(this.currentPos);
    this.camera.fov = this.currentFov;
    this.camera.zoom = this.currentZoom;
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(this.currentLookAt);
  }

  // --- Spring math ---

  private springVector(
    current: THREE.Vector3,
    target: THREE.Vector3,
    velocity: THREE.Vector3,
    dt: number
  ) {
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const dz = target.z - current.z;

    const ax = this.springStiffness * dx - this.springDamping * velocity.x;
    const ay = this.springStiffness * dy - this.springDamping * velocity.y;
    const az = this.springStiffness * dz - this.springDamping * velocity.z;

    velocity.x += ax * dt;
    velocity.y += ay * dt;
    velocity.z += az * dt;

    current.x += velocity.x * dt;
    current.y += velocity.y * dt;
    current.z += velocity.z * dt;
  }

  private springScalar(
    current: number,
    target: number,
    velocity: number,
    dt: number
  ): { value: number; velocity: number } {
    const d = target - current;
    const a = this.springStiffness * d - this.springDamping * velocity;
    velocity += a * dt;
    current += velocity * dt;
    return { value: current, velocity };
  }

  private smoothstep(t: number): number {
    t = Math.max(0, Math.min(1, t));
    return t * t * (3 - 2 * t);
  }
}
