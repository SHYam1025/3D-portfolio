import * as THREE from "three";

/**
 * Breathing & Idle Life System
 * 
 * Adds subtle continuous animations that make the character feel alive:
 * - Breathing (chest/shoulder rise and fall)
 * - Weight shifts while seated
 * - Micro head movements
 * - Posture adjustments
 * - Typing cadence variation
 * - Thinking pauses
 */

interface BoneRef {
  spine: THREE.Object3D | null;
  spine001: THREE.Object3D | null;
  spine003: THREE.Object3D | null; // chest
  spine005: THREE.Object3D | null; // neck
  spine006: THREE.Object3D | null; // head
  shoulderL: THREE.Object3D | null;
  shoulderR: THREE.Object3D | null;
  upper_armL: THREE.Object3D | null;
  upper_armR: THREE.Object3D | null;
}

export class BreathingSystem {
  private bones: BoneRef;
  private time: number = 0;
  private breathCycle: number = 0;
  private enabled: boolean = true;
  
  // Breathing parameters
  private breathRate: number = 0.4; // cycles per second (slow, relaxed)
  private breathDepth: number = 0.008; // rotation amplitude
  
  // Weight shift parameters
  private weightShiftCycle: number = 0;
  private weightShiftRate: number = 0.05; // very slow weight shifts
  private weightShiftDepth: number = 0.004;
  
  // Micro head movement
  private headDriftX: number = 0;
  private headDriftY: number = 0;
  
  // Typing state
  private isTyping: boolean = false;
  private typingBurstTimer: number = 0;
  private typingPauseTimer: number = 0;
  private typingBurstDuration: number = 3.0;
  private typingPauseDuration: number = 0.8;
  private inTypingPause: boolean = false;
  private typingIntensity: number = 1.0;
  
  // Thinking/idle pause
  private thinkingTimer: number = 0;
  private isThinking: boolean = false;
  private thinkingDuration: number = 0;
  private nextThinkingTime: number = 15; // seconds until next thinking pause
  
  // Posture micro-adjustment
  private postureTimer: number = 0;
  private postureAdjustmentActive: boolean = false;

  constructor(character: THREE.Object3D) {
    this.bones = {
      spine: character.getObjectByName("spine") || null,
      spine001: character.getObjectByName("spine001") || null,
      spine003: character.getObjectByName("spine003") || null,
      spine005: character.getObjectByName("spine005") || null,
      spine006: character.getObjectByName("spine006") || null,
      shoulderL: character.getObjectByName("shoulderL") || null,
      shoulderR: character.getObjectByName("shoulderR") || null,
      upper_armL: character.getObjectByName("upper_armL") || null,
      upper_armR: character.getObjectByName("upper_armR") || null,
    };
  }

  setTyping(typing: boolean) {
    this.isTyping = typing;
    if (typing) {
      this.typingBurstTimer = 0;
      this.inTypingPause = false;
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Main update — call every frame
   */
  update(deltaTime: number) {
    if (!this.enabled) return;
    
    const dt = Math.min(deltaTime, 0.05);
    this.time += dt;
    
    this.updateBreathing(dt);
    this.updateWeightShift(dt);
    this.updateMicroHeadMovement(dt);
    this.updateTypingCadence(dt);
    this.updateThinkingPauses(dt);
    this.updatePostureAdjustments(dt);
  }

  private updateBreathing(dt: number) {
    this.breathCycle += dt * this.breathRate * Math.PI * 2;
    
    // Breathing is a smooth sine wave on the spine/chest
    const breathAmount = Math.sin(this.breathCycle) * this.breathDepth;
    const breathAmount2 = Math.sin(this.breathCycle + 0.3) * this.breathDepth * 0.6;
    
    if (this.bones.spine003) {
      // Chest rises slightly
      this.bones.spine003.rotation.x += breathAmount;
    }
    if (this.bones.spine001) {
      // Lower spine compensates slightly
      this.bones.spine001.rotation.x += breathAmount2 * 0.3;
    }
    
    // Shoulders rise with breath — asymmetric for realism
    if (this.bones.shoulderL) {
      this.bones.shoulderL.rotation.z += breathAmount * 0.3;
    }
    if (this.bones.shoulderR) {
      this.bones.shoulderR.rotation.z -= breathAmount * 0.25; // slightly less = asymmetry
    }
  }

  private updateWeightShift(dt: number) {
    this.weightShiftCycle += dt * this.weightShiftRate * Math.PI * 2;
    
    const shift = Math.sin(this.weightShiftCycle) * this.weightShiftDepth;
    
    if (this.bones.spine) {
      // Very subtle lateral lean
      this.bones.spine.rotation.z += shift;
    }
    if (this.bones.spine001) {
      // Counter-lean for natural feel
      this.bones.spine001.rotation.z -= shift * 0.3;
    }
  }

  private updateMicroHeadMovement(dt: number) {
    // Subtle drift based on multiple sine waves (organic feel)
    const targetDriftX = 
      Math.sin(this.time * 0.7) * 0.003 +
      Math.sin(this.time * 1.3) * 0.002 +
      Math.sin(this.time * 0.3) * 0.004;
    
    const targetDriftY = 
      Math.cos(this.time * 0.5) * 0.003 +
      Math.cos(this.time * 1.1) * 0.001;

    // Smooth interpolation
    this.headDriftX += (targetDriftX - this.headDriftX) * dt * 3;
    this.headDriftY += (targetDriftY - this.headDriftY) * dt * 3;

    if (this.bones.spine006) {
      this.bones.spine006.rotation.x += this.headDriftX;
      this.bones.spine006.rotation.y += this.headDriftY;
    }
    
    // Neck micro movement (less than head, creates layered effect)
    if (this.bones.spine005) {
      this.bones.spine005.rotation.x += this.headDriftX * 0.4;
      this.bones.spine005.rotation.y += this.headDriftY * 0.3;
    }
  }

  private updateTypingCadence(dt: number) {
    if (!this.isTyping) return;

    if (this.inTypingPause) {
      this.typingPauseTimer += dt;
      this.typingIntensity += (0.0 - this.typingIntensity) * dt * 5;
      
      if (this.typingPauseTimer >= this.typingPauseDuration) {
        this.inTypingPause = false;
        this.typingBurstTimer = 0;
        // Vary next burst duration
        this.typingBurstDuration = 2.0 + Math.random() * 4.0;
      }
    } else {
      this.typingBurstTimer += dt;
      this.typingIntensity += (1.0 - this.typingIntensity) * dt * 3;
      
      if (this.typingBurstTimer >= this.typingBurstDuration) {
        this.inTypingPause = true;
        this.typingPauseTimer = 0;
        // Vary pause duration
        this.typingPauseDuration = 0.4 + Math.random() * 1.5;
      }
    }

    // During typing, add subtle head nod tied to rhythm
    if (!this.inTypingPause) {
      const typingNod = Math.sin(this.time * 4.5) * 0.002 * this.typingIntensity;
      if (this.bones.spine006) {
        this.bones.spine006.rotation.x += typingNod;
      }
    }
  }

  private updateThinkingPauses(dt: number) {
    this.thinkingTimer += dt;
    
    if (!this.isThinking && this.thinkingTimer >= this.nextThinkingTime) {
      this.isThinking = true;
      this.thinkingTimer = 0;
      this.thinkingDuration = 1.5 + Math.random() * 3.0;
    }
    
    if (this.isThinking) {
      // During thinking: slight head tilt and look-up
      const thinkProgress = this.thinkingTimer / this.thinkingDuration;
      const thinkEase = Math.sin(thinkProgress * Math.PI); // smooth in/out
      
      if (this.bones.spine006) {
        this.bones.spine006.rotation.z += thinkEase * 0.02; // head tilt
        this.bones.spine006.rotation.x -= thinkEase * 0.015; // slight look up
      }
      
      if (this.thinkingTimer >= this.thinkingDuration) {
        this.isThinking = false;
        this.thinkingTimer = 0;
        this.nextThinkingTime = 10 + Math.random() * 20;
      }
    }
  }

  private updatePostureAdjustments(dt: number) {
    this.postureTimer += dt;
    
    // Every ~25 seconds, do a subtle posture shift
    if (!this.postureAdjustmentActive && this.postureTimer > 25 + Math.random() * 15) {
      this.postureAdjustmentActive = true;
      this.postureTimer = 0;
    }
    
    if (this.postureAdjustmentActive) {
      const t = this.postureTimer / 2.0; // 2 second adjustment
      const ease = Math.sin(t * Math.PI);
      
      if (this.bones.spine001) {
        this.bones.spine001.rotation.x += ease * 0.008;
      }
      if (this.bones.spine003) {
        this.bones.spine003.rotation.x -= ease * 0.005;
      }
      
      if (t >= 1.0) {
        this.postureAdjustmentActive = false;
        this.postureTimer = 0;
      }
    }
  }

  /**
   * Get current typing intensity for mixer timeScale control
   */
  getTypingIntensity(): number {
    return this.typingIntensity;
  }

  isInTypingPause(): boolean {
    return this.inTypingPause;
  }
}
