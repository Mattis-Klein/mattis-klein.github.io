import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { CategoryId } from "../content";
import { assemblyPose, bayCamera, clusterFactors, framedCamera, projectPart, plinthScale, type PartId } from "../lib/bay";
import { openingLight, partArrival, shouldPlayOpening } from "../lib/opening";
import { CATEGORY_IDS } from "../content";
import { buildAssembly } from "./buildAssembly";

type AssemblyCanvasProps = {
  reduced: boolean;
  onStatus: (ready: boolean) => void;
};

export type AssemblyHandle = {
  setFrame: (progress: number, focus: CategoryId | null, opening?: number) => void;
};

type Props = AssemblyCanvasProps & {
  handleRef: { current: AssemblyHandle | null };
};

function applyPose(
  parts: Record<PartId, THREE.Object3D>,
  progress: number,
  focus: CategoryId | null,
  tighten = 1,
  opening = 1,
): void {
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
  const ids = CATEGORY_IDS;
  const cx = ids.reduce((sum, id) => sum + pose[id].x, 0) / ids.length;
  const cy = ids.reduce((sum, id) => sum + pose[id].y, 0) / ids.length;
  const cz = ids.reduce((sum, id) => sum + pose[id].z, 0) / ids.length;
  const gathering = opening < 0.999 && progress < 0.004;
  for (const [id, object] of Object.entries(parts) as [PartId, THREE.Object3D][]) {
    const next = pose[id];
    const pulled = ids.includes(id as CategoryId);
    let x = pulled ? cx + (next.x - cx) * tighten : next.x;
    let y = pulled ? cy + (next.y - cy) * tighten : next.y;
    const z = pulled ? cz + (next.z - cz) * tighten : next.z;
    if (gathering && pulled) {
      const travel = 1 - partArrival(opening, id as CategoryId);
      x = cx + (x - cx) * (1 - 0.5 * travel);
      y = cy + (y - cy) * (1 - 0.5 * travel) - 0.08 * travel;
    }
    object.position.set(x, y, z);
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

    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f7fb);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
    const hemi = new THREE.HemisphereLight(0xffffff, 0xc5d4e4, 1.15);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff8f2, 1.8);
    key.position.set(4, 6, 3);
    const fill = new THREE.DirectionalLight(0xd7e6f4, 0.7);
    fill.position.set(-4, 2, 2);
    scene.add(key, fill);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0xf7f9fc, roughness: 1, metalness: 0 }),
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const { root, parts } = buildAssembly();
    scene.add(root);

    let progress = 0;
    let focus: CategoryId | null = null;
    let opening = shouldPlayOpening({
      scrollY: window.scrollY,
      hash: window.location.hash,
      reduced,
    })
      ? 0
      : 1;
    const draw = () => {
      const shown = progress;
      const width = parent.clientWidth || 1;
      const height = parent.clientHeight || 1;
      const raw = CATEGORY_IDS.map((id) => ({
        id,
        ...projectPart(assemblyPose(shown)[id], bayCamera(shown), width, height),
      }));
      const factors = clusterFactors(raw, width, height);
      const tighten = factors.spread / Math.max(0.2, factors.size);
      applyPose(parts, shown, shown > 0.001 ? focus : null, tighten, opening);
      const awake = shown < 0.004 && opening < 0.999 ? openingLight(opening) : 1;
      hemi.intensity = 0.4 + 0.75 * awake;
      key.intensity = 0.35 + 1.45 * awake;
      const cam = framedCamera(shown, camera.aspect, tighten);
      camera.position.set(cam.x, cam.y, cam.z);
      camera.lookAt(cam.tx, cam.ty, cam.tz);
      renderer.render(scene, camera);
    };

    const resize = () => {
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (width < 2 || height < 2) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      draw();
    };

    handleRef.current = {
      setFrame: (next, nextFocus, nextOpening = 1) => {
        progress = next;
        focus = nextFocus;
        opening = nextOpening;
        if (document.hidden) return;
        draw();
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
      if (!document.hidden) draw();
    };
    document.addEventListener("visibilitychange", onVisible);
    resize();
    const sample = performance.now();
    draw();
    if (performance.now() - sample > 40) {
      onStatus(false);
      renderer.dispose();
      return;
    }
    onStatus(true);

    return () => {
      handleRef.current = null;
      canvas.removeEventListener("webglcontextlost", onLost);
      document.removeEventListener("visibilitychange", onVisible);
      observer.disconnect();
      root.traverse((node) => {
        const mesh = node as THREE.Mesh;
        mesh.geometry?.dispose?.();
      });
      renderer.dispose();
    };
  }, [handleRef, onStatus, reduced]);

  return <canvas ref={canvasRef} className="bay-canvas" aria-hidden="true" />;
}
