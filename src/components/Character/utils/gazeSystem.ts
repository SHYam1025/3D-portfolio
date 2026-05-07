import * as THREE from "three";

/**
 * Intelligent Gaze Tracking System
 * 
 * Replaces the basic head rotation with a multi-layered gaze system:
 * - Cursor-aware tracking across all sections
 * - Smooth dampened interpolation
 * - Attention zones (screen, cursor, content areas)
 * - Eye refocus behavior
 * - Context-aware gaze priority
 */

export type GazeTarget = "cursor" | "screen" | "forward" | "content" | "idle";

interface GazeConfig {
  maxRotationY: number;
  maxRotationX: number;
  interpolationSpeed: number;
  neckContribution: number; // how much neck follows vs just head
}

const GAZE_CONFIGS: Record<GazeTarget, GazeConfig> = {
  cursor: {
    maxRotationY: Math.PI / 6,
    maxRotationX: Math.PI / 8,
    interpolationSpeed: 3.0,
    neckContribution: 0.35,
  },
  screen: {
    maxRotationY: 0.3,
    maxRotationX: 0.4,
    interpolationSpeed: 1.5,
    neckContribution: 0.5,
  },
  forward: {
    maxRotationY: 0,
    maxRotationX: 0,
    interpolationSpeed: 2.0,
    neckContribution: 0.3,
  },
  content: {
    maxRotationY: Math.PI / 5,
    maxRotationX: Math.PI / 10,
    interpolationSpeed: 2.5,
    neckContribution: 0.3,
  },
  idle: {
    maxRotationY: Math.PI / 8,
    maxRotationX: Math.PI / 12,
    interpolationSpeed: 1.0,
    neckContribution: 0.4,
  },
};

export class GazeSystem {
  private headBone: THREE.Object3D | null;
  private neckBone: THREE.Object3D | null;
  
  // Current smooth values
  private currentHeadRotX: number = 0;
  private currentHeadRotY: number = 0;
  private currentNeckRotX: number = 0;
  private currentNeckRotY: number = 0;
  
  // Mouse/cursor position (normalized -1 to 1)
  private mouseX: number = 0;
  private mouseY: number = 0;
  
  // Smooth mouse (dampened input)
  private smoothMouseX: number = 0;
  private smoothMouseY: number = 0;
  
  // Gaze target
  private gazeTarget: GazeTarget = "cursor";
  private gazeTransitionProgress: number = 1;
  
  // Idle gaze wandering
  private idleGazeTime: number = 0;
  private idleGazeX: number = 0;
  private idleGazeY: number = 0;
  
  // Screen gaze points (simulates looking at different screen areas)
  private screenGazeX: number = 0;
  private screenGazeY: number = -0.3;
  private screenGazeTimer: number = 0;
  private screenGazeInterval: number = 2.0;
  

  // Eye refocus simulation
  private refocusTimer: number = 0;
  private isRefocusing: boolean = false;

  private enabled: boolean = true;

  constructor(character: THREE.Object3D) {
    this.headBone = character.getObjectByName("spine006") || null;
    this.neckBone = character.getObjectByName("spine005") || null;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setMousePosition(x: number, y: number) {
    this.mouseX = x;
    this.mouseY = y;
  }

  setGazeTarget(target: GazeTarget) {
    if (target !== this.gazeTarget) {
      this.gazeTarget = target;
      this.gazeTransitionProgress = 0;
    }
  }

  /**
   * Main update — call every frame
   */
  update(deltaTime: number) {
    if (!this.enabled) return;
    
    const dt = Math.min(deltaTime, 0.05);
    
    // Smooth the mouse input
    this.smoothMouseX += (this.mouseX - this.smoothMouseX) * dt * 4;
    this.smoothMouseY += (this.mouseY - this.smoothMouseY) * dt * 4;
    
    // Transition between gaze targets
    this.gazeTransitionProgress = Math.min(1, this.gazeTransitionProgress + dt * 2);
    
    // Update idle gaze wandering
    this.updateIdleGaze(dt);
    
    // Update screen gaze simulation
    this.updateScreenGaze(dt);
    
    // Calculate target rotation based on gaze mode
    const config = GAZE_CONFIGS[this.gazeTarget];
    const { targetHeadX, targetHeadY, targetNeckX, targetNeckY } = this.calculateGazeRotation(config);
    
    // Apply with spring interpolation
    const speed = config.interpolationSpeed;
    this.currentHeadRotX += (targetHeadX - this.currentHeadRotX) * dt * speed;
    this.currentHeadRotY += (targetHeadY - this.currentHeadRotY) * dt * speed;
    this.currentNeckRotX += (targetNeckX - this.currentNeckRotX) * dt * speed;
    this.currentNeckRotY += (targetNeckY - this.currentNeckRotY) * dt * speed;
    
    // Apply to bones
    if (this.headBone) {
      this.headBone.rotation.x += this.currentHeadRotX;
      this.headBone.rotation.y += this.currentHeadRotY;
    }
    if (this.neckBone) {
      this.neckBone.rotation.x += this.currentNeckRotX;
      this.neckBone.rotation.y += this.currentNeckRotY;
    }
    
    // Eye refocus simulation
    this.updateRefocus(dt);
  }

  private calculateGazeRotation(config: GazeConfig) {
    let gazeX = 0, gazeY = 0;
    
    switch (this.gazeTarget) {
      case "cursor":
        gazeX = -this.smoothMouseY * config.maxRotationX;
        gazeY = this.smoothMouseX * config.maxRotationY;
        break;
        
      case "screen":
        gazeX = this.screenGazeY * config.maxRotationX - 0.2;
        gazeY = this.screenGazeX * config.maxRotationY - 0.15;
        break;
        
      case "forward":
        gazeX = -0.1; // slight downward natural rest
        gazeY = 0;
        break;
        
      case "content":
        // Look toward content area (right side of screen)
        gazeX = -0.1;
        gazeY = -0.25;
        break;
        
      case "idle":
        gazeX = this.idleGazeX * config.maxRotationX;
        gazeY = this.idleGazeY * config.maxRotationY;
        break;
    }
    
    // Clamp rotations
    gazeX = THREE.MathUtils.clamp(gazeX, -config.maxRotationX, config.maxRotationX);
    gazeY = THREE.MathUtils.clamp(gazeY, -config.maxRotationY, config.maxRotationY);
    
    return {
      targetHeadX: gazeX,
      targetHeadY: gazeY,
      targetNeckX: gazeX * config.neckContribution,
      targetNeckY: gazeY * config.neckContribution,
    };
  }

  private updateIdleGaze(dt: number) {
    this.idleGazeTime += dt;
    
    // Organic wandering with multiple frequencies
    this.idleGazeX = 
      Math.sin(this.idleGazeTime * 0.2) * 0.3 +
      Math.sin(this.idleGazeTime * 0.5) * 0.15;
    
    this.idleGazeY = 
      Math.cos(this.idleGazeTime * 0.15) * 0.2 +
      Math.cos(this.idleGazeTime * 0.4) * 0.1;
  }

  private updateScreenGaze(dt: number) {
    if (this.gazeTarget !== "screen") return;
    
    this.screenGazeTimer += dt;
    
    if (this.screenGazeTimer >= this.screenGazeInterval) {
      this.screenGazeTimer = 0;
      // Jump to a new screen area
      this.screenGazeX = (Math.random() - 0.5) * 0.6;
      this.screenGazeY = (Math.random() - 0.5) * 0.4 - 0.2;
      // Vary interval for organic feel
      this.screenGazeInterval = 1.5 + Math.random() * 3.0;
      // Trigger refocus
      this.triggerRefocus();
    }
  }

  private triggerRefocus() {
    this.isRefocusing = true;
    this.refocusTimer = 0;
  }

  private updateRefocus(dt: number) {
    if (!this.isRefocusing) return;
    
    this.refocusTimer += dt;
    
    // Brief refocus movement (slight squint/converge effect via head micro-movement)
    if (this.refocusTimer < 0.15) {
      if (this.headBone) {
        this.headBone.rotation.x += Math.sin(this.refocusTimer * 20) * 0.003;
      }
    }
    
    if (this.refocusTimer >= 0.3) {
      this.isRefocusing = false;
    }
  }
}
