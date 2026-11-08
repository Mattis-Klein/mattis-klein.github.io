import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { CategoryId } from "../content";
import { assemblyPose, bayCamera, plinthScale, type PartId } from "../lib/bay";
import { buildAssembly } from "./buildAssembly";

type AssemblyCanvasProps = {
  reduced: boolean;
  onStatus: (ready: boolean) => void;
};

export type AssemblyHandle = {
  setFrame: (progress: number, focus: CategoryId | null) => void;
};

type Props = AssemblyCanvasProps & {
  handleRef: { current: AssemblyHandle | null };
};

function applyPose(parts: Record<PartId, THREE.Object3D>, progress: number, focus: CategoryId | null): void {
  const pose = assemblyPose(progress);
  const scales = plinthScale(progress);
  if (focus && progress > 0.4 && progress < 0.64) {
    const weight = Math.min(1, (progress - 0.4) / 0.08) * Math.min(1, (0.64 - progress) / 0.08);
    pose[focus] = {
      ...pose[focus],
      z: pose[focus].z + 0.34 * weight,
      y: pose[focus].y + 0.06 * weight,
      ry: pose[focus].ry * (1 - 0.65 * weight),
    };
  }
  for (const [id, object] of Object.entries(parts) as [PartId, THREE.Object3D][]) {
    const next = pose[id];
    object.position.set(next.x, next.y, next.z);
    object.rotation.set(next.rx, next.ry, next.rz);
  }
  parts.plinthA.scale.setScalar(scales.a);
  parts.plinthB.scale.setScalar(scales.b);
}

export function AssemblyCanvas({ reduced, onStatus, handleRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      onStatus(false);
      return;
    }
    if (!renderer.getContext()) {
      onStatus(false);
      return;
    }

    const mobile = window.matchMedia("(max-width: 899px)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f7fb);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.045).texture;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
    const hemi = new THREE.HemisphereLight(0xffffff, 0xc5d4e4, 0.72);
    const key = new THREE.DirectionalLight(0xfff6ee, 3.4);
    key.position.set(4.2, 6.4, 3.2);
    key.castShadow = true;
    key.shadow.mapSize.set(mobile ? 512 : 1024, mobile ? 512 : 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 18;
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.bias = -0.0006;
    const fill = new THREE.DirectionalLight(0xd5e6f6, 1.15);
    fill.position.set(-4.5, 2.4, 2.2);
    const rim = new THREE.DirectionalLight(0x8ec8ef, 1.7);
    rim.position.set(-1.5, 3.2, -4.2);
    scene.add(hemi, key, fill, rim);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0xf7f9fc, roughness: 0.94, metalness: 0.02 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.001;
    floor.receiveShadow = true;
    scene.add(floor);

    const { root, parts } = buildAssembly();
    scene.add(root);

    let progress = 0;
    let focus: CategoryId | null = null;
    const started = performance.now();
    const life = { on: true };
    let frame = 0;

    const draw = (now: number) => {
      const intro = reduced ? 1 : Math.min(1, (now - started) / 1100);
      const eased = intro * intro * (3 - 2 * intro);
      const live = progress > 0.001 ? 1 : eased;
      applyPose(parts, progress * live + 0.2 * (1 - live), progress > 0.001 ? focus : null);
      const cam = bayCamera(progress * live);
      camera.position.set(cam.x, cam.y, cam.z);
      camera.lookAt(cam.tx, cam.ty, cam.tz);
      renderer.render(scene, camera);
    };

    const loop = (now: number) => {
      if (!life.on) return;
      draw(now);
      const introDone = reduced || performance.now() - started > 1100;
      if (!introDone) frame = window.requestAnimationFrame(loop);
    };

    const resize = () => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (width < 2 || height < 2) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      draw(performance.now());
    };

    handleRef.current = {
      setFrame: (next, nextFocus) => {
        progress = next;
        focus = nextFocus;
        if (document.hidden) return;
        draw(performance.now());
      },
    };

    const onLost = (event: Event) => {
      event.preventDefault();
      onStatus(false);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    const onVisible = () => {
      if (!document.hidden) draw(performance.now());
    };
    document.addEventListener("visibilitychange", onVisible);
    resize();
    frame = window.requestAnimationFrame(loop);
    onStatus(true);

    return () => {
      life.on = false;
      window.cancelAnimationFrame(frame);
      handleRef.current = null;
      canvas.removeEventListener("webglcontextlost", onLost);
      document.removeEventListener("visibilitychange", onVisible);
      observer.disconnect();
      root.traverse((node) => {
        const mesh = node as THREE.Mesh;
        mesh.geometry?.dispose?.();
      });
      renderer.dispose();
      pmrem.dispose();
    };
  }, [handleRef, onStatus, reduced]);

  return <canvas ref={canvasRef} className="bay-canvas" aria-hidden="true" />;
}
