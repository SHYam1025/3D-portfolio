import { useEffect, useRef } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import { useLoading } from "../../context/LoadingProvider";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";
import { SceneDirector } from "./utils/sceneDirector";
import { RGBELoader } from "three-stdlib";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    if (!canvasDiv.current) return;

    const rect = canvasDiv.current.getBoundingClientRect();
    const container = { width: rect.width, height: rect.height };
    const aspect = container.width / container.height;
    const scene = sceneRef.current;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(container.width, container.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    canvasDiv.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
    camera.position.set(0, 13.1, 24.7);
    camera.zoom = 1.1;
    camera.updateProjectionMatrix();

    // Environment HDR
    new RGBELoader()
      .setPath("/models/")
      .load("char_enviorment.hdr?v=2", function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.environmentIntensity = 0;
        scene.environmentRotation.set(5.76, 85.85, 1);
      });

    let headBone: THREE.Object3D | null = null;
    let screenLight: any | null = null;
    let mixer: THREE.AnimationMixer;
    let director: SceneDirector | null = null;
    const clock = new THREE.Clock();

    const progress = setProgress((value) => setLoading(value));
    const { loadCharacter } = setCharacter(renderer, scene, camera);

    let isMounted = true;

    loadCharacter().then((gltf) => {
      if (!gltf || !isMounted) return;

      const character = gltf.scene;
      scene.add(character);

      const animations = setAnimations(gltf);
      if (hoverDivRef.current) {
        animations.hover(gltf, hoverDivRef.current);
      }
      mixer = animations.mixer;

      headBone = character.getObjectByName("spine006") || null;
      screenLight = character.getObjectByName("screenlight") || null;

      // Create Scene Director (handles camera, scroll, environment, monitor)
      director = new SceneDirector(
        camera,
        character,
        mixer,
        gltf,
        scene,
        canvasDiv.current
      );

      progress.loaded().then(() => {
        setTimeout(() => {
          animations.startIntro();
          director?.startIntro();
        }, 2500);
      });

      const handleResizeEvt = () => {
        if (!canvasDiv.current) return;
        const r = canvasDiv.current.getBoundingClientRect();
        renderer.setSize(r.width, r.height);
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
        director?.rebuild();
      };
      window.addEventListener("resize", handleResizeEvt);
      (window as any).__sceneCleanup = () => {
        window.removeEventListener("resize", handleResizeEvt);
      };
    });

    // --- Original mouse/touch input for head tracking ---
    let mouse = { x: 0, y: 0 },
      interpolation = { x: 0.1, y: 0.2 };

    const onMouseMove = (event: MouseEvent) => {
      handleMouseMove(event, (x, y) => {
        mouse = { x, y };
        director?.setMousePosition(x, y);
      });
    };

    let debounce: number | undefined;
    const onTouchStart = (event: TouchEvent) => {
      const element = event.target as HTMLElement;
      debounce = setTimeout(() => {
        element?.addEventListener("touchmove", (e: TouchEvent) =>
          handleTouchMove(e, (x, y) => {
            mouse = { x, y };
            director?.setMousePosition(x, y);
          })
        );
      }, 200);
    };

    const onTouchEnd = () => {
      handleTouchEnd((x, y, interpolationX, interpolationY) => {
        mouse = { x, y };
        interpolation = { x: interpolationX, y: interpolationY };
        director?.setMousePosition(x, y);
      });
    };

    document.addEventListener("mousemove", onMouseMove);
    const landingDiv = document.getElementById("landingDiv");
    if (landingDiv) {
      landingDiv.addEventListener("touchstart", onTouchStart);
      landingDiv.addEventListener("touchend", onTouchEnd);
    }

    // --- Animation Loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (mixer) {
        mixer.update(delta);
      }

      // Original stable head tracking (lerp-based, no accumulation)
      if (headBone) {
        handleHeadRotation(
          headBone,
          mouse.x,
          mouse.y,
          interpolation.x,
          interpolation.y,
          THREE.MathUtils.lerp
        );
        // Update screen light for point light
        director?.updateScreenLight(screenLight);
      }

      // Update director (camera spring, environment only — NO bone manipulation)
      if (director) {
        director.update(delta);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isMounted = false;
      clearTimeout(debounce);
      document.removeEventListener("mousemove", onMouseMove);
      if (landingDiv) {
        landingDiv.removeEventListener("touchstart", onTouchStart);
        landingDiv.removeEventListener("touchend", onTouchEnd);
      }
      director?.dispose();
      scene.clear();
      renderer.dispose();
      if (canvasDiv.current) {
        canvasDiv.current.removeChild(renderer.domElement);
      }
      if ((window as any).__sceneCleanup) {
        (window as any).__sceneCleanup();
      }
    };
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
