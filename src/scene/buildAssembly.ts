import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { PartId } from "../lib/bay";

export type AssemblyParts = {
  root: THREE.Group;
  parts: Record<PartId, THREE.Object3D>;
};

function piece(
  geo: THREE.BufferGeometry,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
): THREE.Mesh {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  return mesh;
}

function slab(w: number, h: number, d: number, radius = 0.028): RoundedBoxGeometry {
  return new RoundedBoxGeometry(w, h, d, 2, Math.min(radius, Math.min(w, h, d) * 0.45));
}

function ventTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 96;
  const draw = canvas.getContext("2d");
  if (!draw) return new THREE.CanvasTexture(canvas);
  draw.fillStyle = "#163044";
  draw.fillRect(0, 0, 256, 96);
  for (let row = 0; row < 5; row += 1) {
    const y = 10 + row * 17;
    draw.fillStyle = "#0c1c2b";
    draw.fillRect(10, y, 236, 10);
    draw.fillStyle = "#2c4d68";
    draw.fillRect(10, y, 236, 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function buildAssembly(): AssemblyParts {
  const navy = new THREE.MeshStandardMaterial({ color: 0x17324c, metalness: 0.62, roughness: 0.36 });
  const alloy = new THREE.MeshStandardMaterial({ color: 0xc9d3de, metalness: 0.74, roughness: 0.3 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x10283c, metalness: 0.18, roughness: 0.08 });
  const catchlight = new THREE.MeshStandardMaterial({
    color: 0xd5e8f6,
    metalness: 0,
    roughness: 0.18,
    transparent: true,
    opacity: 0.42,
  });
  const polymer = new THREE.MeshStandardMaterial({ color: 0xf4f7fb, metalness: 0.04, roughness: 0.42 });
  const accent = new THREE.MeshStandardMaterial({
    color: 0x1688ce,
    emissive: 0x0c5f96,
    emissiveIntensity: 0.35,
    roughness: 0.42,
    metalness: 0.2,
  });
  const stage = new THREE.MeshStandardMaterial({ color: 0xe6eef6, metalness: 0.2, roughness: 0.5 });
  const vents = new THREE.MeshStandardMaterial({ map: ventTexture(), roughness: 0.72, metalness: 0.25 });

  const optic = new THREE.Group();
  optic.add(piece(slab(0.62, 0.08, 0.34, 0.03), alloy, 0, 0.04, 0));
  optic.add(piece(slab(0.1, 0.22, 0.16, 0.02), alloy, -0.16, 0.16, 0));
  optic.add(piece(slab(0.1, 0.22, 0.16, 0.02), alloy, 0.16, 0.16, 0));
  optic.add(piece(new THREE.CylinderGeometry(0.22, 0.24, 0.46, 24), navy, 0, 0.3, 0.02, Math.PI / 2, 0, 0));
  optic.add(piece(new THREE.TorusGeometry(0.23, 0.028, 10, 28), alloy, 0, 0.3, 0.2));
  optic.add(piece(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 24), glass, 0, 0.3, 0.24, Math.PI / 2, 0, 0));
  optic.add(piece(new THREE.CylinderGeometry(0.07, 0.07, 0.012, 20), catchlight, 0, 0.34, 0.262, Math.PI / 2, 0, 0));
  optic.add(piece(new THREE.TorusGeometry(0.11, 0.012, 8, 24), navy, 0, 0.3, 0.25));
  optic.add(piece(new THREE.TorusGeometry(0.2, 0.01, 8, 28), accent, 0, 0.3, 0.16));

  const chassis = new THREE.Group();
  chassis.add(piece(slab(1.05, 0.28, 0.58, 0.04), navy, 0, 0.2, 0));
  chassis.add(piece(slab(1.12, 0.045, 0.64, 0.02), alloy, 0, 0.045, 0));
  chassis.add(piece(new THREE.PlaneGeometry(0.78, 0.16), vents, 0, 0.2, 0.292));
  chassis.add(piece(slab(0.9, 0.012, 0.02, 0.004), alloy, 0, 0.29, 0.3));
  chassis.add(piece(slab(0.9, 0.012, 0.02, 0.004), alloy, 0, 0.11, 0.3));
  chassis.add(piece(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 12), accent, 0.4, 0.26, 0.3, Math.PI / 2, 0, 0));
  chassis.add(piece(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 12), accent, 0.4, 0.16, 0.3, Math.PI / 2, 0, 0));

  const plate = new THREE.Group();
  plate.add(piece(slab(0.58, 0.7, 0.1, 0.03), alloy, 0, 0.42, 0));
  plate.add(piece(new THREE.CylinderGeometry(0.16, 0.16, 0.045, 24), navy, 0, 0.48, 0.06));
  plate.add(piece(new THREE.TorusGeometry(0.2, 0.012, 8, 28), navy, 0, 0.48, 0.04));
  plate.add(piece(slab(0.016, 0.11, 0.02, 0.004), accent, 0, 0.56, 0.09));
  plate.add(piece(slab(0.64, 0.05, 0.36, 0.02), alloy, 0, 0.03, 0));

  const latch = new THREE.Group();
  latch.add(piece(slab(0.16, 0.74, 0.42, 0.03), navy, 0, 0.44, 0));
  latch.add(piece(new THREE.CylinderGeometry(0.075, 0.075, 0.26, 18), alloy, 0.12, 0.46, 0, 0, 0, Math.PI / 2));
  latch.add(piece(slab(0.18, 0.16, 0.2, 0.02), alloy, 0.2, 0.46, 0));
  latch.add(piece(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 10), accent, -0.09, 0.72, 0.2, Math.PI / 2, 0, 0));
  latch.add(piece(slab(0.36, 0.05, 0.4, 0.02), alloy, 0, 0.03, 0));

  const dome = new THREE.Group();
  dome.add(piece(new THREE.CylinderGeometry(0.3, 0.33, 0.09, 28), alloy, 0, 0.07, 0));
  dome.add(piece(new THREE.SphereGeometry(0.26, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), polymer, 0, 0.11, 0));
  dome.add(piece(new THREE.TorusGeometry(0.25, 0.014, 8, 28), accent, 0, 0.12, 0, Math.PI / 2, 0, 0));
  dome.add(piece(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 12), navy, 0, 0.37, 0));

  const disc = new THREE.CylinderGeometry(1.15, 1.2, 0.08, 40);
  const groove = new THREE.TorusGeometry(0.92, 0.012, 6, 40);
  const plinthA = new THREE.Group();
  plinthA.add(piece(disc, stage, 0, 0.04, 0));
  plinthA.add(piece(groove, alloy, 0, 0.085, 0, Math.PI / 2, 0, 0));
  const plinthB = new THREE.Group();
  plinthB.add(piece(disc, stage, 0, 0.04, 0));
  plinthB.add(piece(groove, alloy, 0, 0.085, 0, Math.PI / 2, 0, 0));

  const root = new THREE.Group();
  const parts = { surveillance: optic, networking: chassis, "smart-home": plate, access: latch, safety: dome, plinthA, plinthB };
  for (const part of Object.values(parts)) root.add(part);
  return { root, parts };
}
