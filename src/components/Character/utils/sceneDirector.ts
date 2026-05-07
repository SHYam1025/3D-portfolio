import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EnvironmentSystem } from "./environmentSystem";
import { GLTF } from "three-stdlib";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scene Director
 * 
 * Handles: camera system, scroll transitions, environment, monitor control.
 * Does NOT touch bone rotations — head tracking is handled by mouseUtils.
 */

export class SceneDirector {
  private camera: THREE.PerspectiveCamera;
  private environmentSystem: EnvironmentSystem;
  
  private character: THREE.Object3D;
  private neckBone: THREE.Object3D | null;
  private scrollTriggers: ScrollTrigger[] = [];
  private isDesktop: boolean;
  private monitorScaled: boolean = false;

  // Monitor objects
  private monitorMesh: any = null;
  private screenLightObj: any = null;

  constructor(
    camera: THREE.PerspectiveCamera,
    character: THREE.Object3D,
    _mixer: THREE.AnimationMixer,
    _gltf: GLTF,
    scene: THREE.Scene,
    _containerEl: HTMLDivElement | null
  ) {
    this.character = character;
    this.camera = camera;
    this.isDesktop = window.innerWidth > 1024;
    
    this.environmentSystem = new EnvironmentSystem(scene);
    this.neckBone = character.getObjectByName("spine005") || null;
    
    this.findMonitorObjects();
    this.hideMonitor();
    
    if (this.isDesktop) {
      this.setupScrollTimelines();
    }
  }

  private findMonitorObjects() {
    this.character.children.forEach((object: any) => {
      if (object.name === "Plane004") {
        object.children.forEach((child: any) => {
          child.material.transparent = true;
          child.material.opacity = 0;
          if (child.material.name === "Material.018") {
            this.monitorMesh = child;
            child.material.color.set("#FFFFFF");
          }
        });
      }
      if (object.name === "screenlight") {
        object.material.transparent = true;
        object.material.opacity = 0;
        object.material.emissive.set("#B0F5EA");
        this.screenLightObj = object;
      }
    });
  }

  private hideMonitor() {
    if (this.monitorMesh) this.monitorMesh.material.opacity = 0;
    if (this.screenLightObj) this.screenLightObj.material.opacity = 0;
  }

  private setupScrollTimelines() {
    // === PHASE 1: Landing → About ===
    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: ".landing-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    tl1
      .fromTo(this.character.rotation, { y: 0 }, { y: 0.7, duration: 1 }, 0)
      .to(this.camera.position, { z: 22 }, 0)
      .fromTo(".character-model", { x: 0 }, { x: "-25%", duration: 1 }, 0)
      .to(".landing-container", { opacity: 0, duration: 0.4 }, 0)
      .to(".landing-container", { y: "40%", duration: 0.8 }, 0)
      .fromTo(".about-me", { y: "-50%" }, { y: "0%" }, 0);

    this.scrollTriggers.push(tl1.scrollTrigger!);

    // === PHASE 2: About → Working ===
    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: ".about-section",
        start: "center 55%",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (self.progress > 0.3 && !this.monitorScaled) {
            this.revealMonitor();
            this.monitorScaled = true;
          }
        },
      },
    });

    tl2
      .to(
        this.camera.position,
        { z: 75, y: 8.4, duration: 6, delay: 2, ease: "power3.inOut" },
        0
      )
      .to(".about-section", { y: "30%", duration: 6 }, 0)
      .to(".about-section", { opacity: 0, delay: 3, duration: 2 }, 0)
      .fromTo(
        ".character-model",
        { pointerEvents: "inherit" },
        { pointerEvents: "none", x: "-12%", delay: 2, duration: 5 },
        0
      )
      .to(this.character.rotation, { y: 0.92, x: 0.12, delay: 3, duration: 3 }, 0);

    if (this.neckBone) {
      tl2.to(this.neckBone.rotation, { x: 0.6, delay: 2, duration: 3 }, 0);
    }
    if (this.monitorMesh) {
      tl2.to(this.monitorMesh.material, { opacity: 1, duration: 0.8, delay: 3.2 }, 0);
    }
    if (this.screenLightObj) {
      tl2.to(this.screenLightObj.material, { opacity: 1, duration: 0.8, delay: 4.5 }, 0);
    }
    tl2
      .fromTo(
        ".what-box-in",
        { display: "none" },
        { display: "flex", duration: 0.1, delay: 6 },
        0
      )
      .fromTo(
        ".character-rim",
        { opacity: 1, scaleX: 1.4 },
        { opacity: 0, scale: 0, y: "-70%", duration: 5, delay: 2 },
        0.3
      );

    // Monitor position animation
    if (this.monitorMesh) {
      tl2.fromTo(
        this.monitorMesh.position,
        { y: -10, z: 2 },
        { y: 0, z: 0, delay: 1.5, duration: 3 },
        0
      );
    }

    this.scrollTriggers.push(tl2.scrollTrigger!);

    // === PHASE 3: WhatIDo → exit ===
    const tl3 = gsap.timeline({
      scrollTrigger: {
        trigger: ".whatIDO",
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    tl3
      .fromTo(
        ".character-model",
        { y: "0%" },
        { y: "-100%", duration: 4, ease: "none", delay: 1 },
        0
      )
      .fromTo(".whatIDO", { y: 0 }, { y: "15%", duration: 2 }, 0)
      .to(this.character.rotation, { x: -0.04, duration: 2, delay: 1 }, 0);

    this.scrollTriggers.push(tl3.scrollTrigger!);

    // === Career timeline ===
    this.setupCareerTimeline();
  }

  private setupCareerTimeline() {
    const careerTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".career-section",
        start: "top 30%",
        end: "100% center",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    careerTimeline
      .fromTo(".career-timeline", { maxHeight: "10%" }, { maxHeight: "100%", duration: 0.5 }, 0)
      .fromTo(".career-timeline", { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0)
      .fromTo(".career-info-box", { opacity: 0 }, { opacity: 1, stagger: 0.1, duration: 0.5 }, 0)
      .fromTo(
        ".career-dot",
        { animationIterationCount: "infinite" },
        { animationIterationCount: "1", delay: 0.3, duration: 0.1 },
        0
      )
      .fromTo(".career-section", { y: 0 }, { y: "20%", duration: 0.5, delay: 0.2 }, 0);

    this.scrollTriggers.push(careerTimeline.scrollTrigger!);
  }

  private revealMonitor() {
    if (this.monitorMesh) {
      gsap.to(this.monitorMesh.material, { opacity: 1, duration: 1.2, ease: "power2.inOut" });
    }
    if (this.screenLightObj) {
      gsap.to(this.screenLightObj.material, { opacity: 1, duration: 1.5, delay: 0.3, ease: "power2.inOut" });
      // Screen flicker
      gsap.timeline({ repeat: -1, repeatRefresh: true }).to(this.screenLightObj.material, {
        emissiveIntensity: () => Math.random() * 6 + 2,
        duration: () => Math.random() * 0.6 + 0.1,
        delay: () => Math.random() * 0.1,
      });
    }
    this.environmentSystem.setMonitorActive(true);
  }

  setMousePosition(_x: number, _y: number) {
    // Mouse position forwarded but head tracking handled by mouseUtils
  }

  /**
   * Update screen-driven point light
   */
  updateScreenLight(screenLight: any) {
    if (screenLight && screenLight.material.opacity > 0.9) {
      this.environmentSystem.updateMonitorGlowPosition(screenLight);
    }
  }

  async startIntro() {
    await this.environmentSystem.turnOnLights(2.0);
    
    // Animate the CSS rim glow
    gsap.to(".character-rim", {
      y: "55%",
      opacity: 1,
      delay: 0.2,
      duration: 2,
      ease: "power2.inOut",
    });
  }

  update(deltaTime: number) {
    // Camera is controlled by GSAP scroll timelines directly
    // Only update environment (particles, monitor glow)
    this.environmentSystem.update(deltaTime);
  }

  dispose() {
    this.scrollTriggers.forEach((t) => t.kill());
    this.environmentSystem.dispose();
  }

  rebuild() {
    const workTrigger = ScrollTrigger.getById("work");
    this.scrollTriggers.forEach((t) => {
      if (t !== workTrigger) t.kill();
    });
    this.scrollTriggers = [];
    this.monitorScaled = false;
    if (this.isDesktop) {
      this.setupScrollTimelines();
    }
  }
}
