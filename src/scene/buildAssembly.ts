import * as THREE from "three";
import type { PartId } from "../lib/bay";

export type AssemblyParts = {
  root: THREE.Group;
  parts: Record<PartId, THREE.Object3D>;
};

function body(geo: THREE.BufferGeometry, material: THREE.Material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function glowDisc(material: THREE.Material, x: number, y: number, z: number, scale = 1): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.035 * scale, 16, 12), material);
  mesh.position.set(x, y, z);
  return mesh;
}

export function buildAssembly(): AssemblyParts {
  const navy = new THREE.MeshPhysicalMaterial({
    color: 0x142b44,
    metalness: 0.78,
    roughness: 0.28,
    clearcoat: 0.45,
    clearcoatRoughness: 0.35,
  });
  const alloy = new THREE.MeshPhysicalMaterial({
    color: 0xd5dee8,
    metalness: 0.88,
    roughness: 0.24,
    clearcoat: 0.2,
    clearcoatRoughness: 0.4,
  });
  const lens = new THREE.MeshPhysicalMaterial({
    color: 0x071421,
    metalness: 0.2,
    roughness: 0.06,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
  });
  const polymer = new THREE.MeshPhysicalMaterial({
    color: 0xf3f6fa,
    metalness: 0.04,
    roughness: 0.38,
    clearcoat: 0.4,
    clearcoatRoughness: 0.25,
  });
  const signal = new THREE.MeshStandardMaterial({
    color: 0x1688ce,
    emissive: 0x1688ce,
    emissiveIntensity: 1.8,
    roughness: 0.35,
    metalness: 0.1,
  });
  const stage = new THREE.MeshPhysicalMaterial({
    color: 0xe7eef6,
    metalness: 0.35,
    roughness: 0.42,
    clearcoat: 0.25,
  });

  const optic = new THREE.Group();
  optic.add(body(new THREE.CylinderGeometry(0.24, 0.26, 0.5, 40), navy, 0, 0.28, 0, Math.PI / 2, 0, 0));
  optic.add(body(new THREE.CylinderGeometry(0.29, 0.29, 0.08, 40), alloy, 0, 0.28, -0.22, Math.PI / 2, 0, 0));
  optic.add(body(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 32), lens, 0, 0.28, 0.24, Math.PI / 2, 0, 0));
  optic.add(body(new THREE.TorusGeometry(0.175, 0.018, 12, 40), signal, 0, 0.28, 0.22));
  optic.add(body(new THREE.BoxGeometry(0.5, 0.08, 0.28), alloy, 0, 0.04, -0.02));
  optic.add(body(new THREE.BoxGeometry(0.08, 0.22, 0.16), alloy, -0.16, 0.16, -0.02));
  optic.add(body(new THREE.BoxGeometry(0.08, 0.22, 0.16), alloy, 0.16, 0.16, -0.02));

  const chassis = new THREE.Group();
  chassis.add(body(new THREE.BoxGeometry(1.12, 0.3, 0.62), navy, 0, 0.2, 0));
  chassis.add(body(new THREE.BoxGeometry(0.96, 0.22, 0.04), alloy, 0, 0.2, 0.32));
  for (let i = 0; i < 5; i += 1) {
    chassis.add(body(new THREE.BoxGeometry(0.72, 0.018, 0.02), navy, 0, 0.28 - i * 0.045, 0.345));
  }
  chassis.add(glowDisc(signal, 0.42, 0.28, 0.34));
  chassis.add(glowDisc(signal, 0.42, 0.2, 0.34));
  chassis.add(body(new THREE.BoxGeometry(0.08, 0.22, 0.5), alloy, -0.58, 0.2, 0));
  chassis.add(body(new THREE.BoxGeometry(1.16, 0.04, 0.66), alloy, 0, 0.04, 0));

  const plate = new THREE.Group();
  plate.add(body(new THREE.BoxGeometry(0.62, 0.74, 0.1), alloy, 0, 0.42, 0));
  plate.add(body(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 32), navy, 0, 0.46, 0.07));
  plate.add(body(new THREE.BoxGeometry(0.012, 0.12, 0.02), signal, 0, 0.52, 0.1));
  plate.add(body(new THREE.BoxGeometry(0.46, 0.08, 0.04), navy, 0, 0.16, 0.06));
  plate.add(body(new THREE.BoxGeometry(0.7, 0.05, 0.42), alloy, 0, 0.03, 0));

  const latch = new THREE.Group();
  latch.add(body(new THREE.BoxGeometry(0.16, 0.82, 0.5), navy, 0, 0.46, 0));
  latch.add(body(new THREE.CylinderGeometry(0.09, 0.09, 0.28, 24), alloy, 0.12, 0.48, 0, 0, 0, Math.PI / 2));
  latch.add(body(new THREE.BoxGeometry(0.22, 0.16, 0.22), alloy, 0.2, 0.48, 0));
  latch.add(glowDisc(signal, -0.09, 0.74, 0.16, 0.8));
  latch.add(body(new THREE.BoxGeometry(0.34, 0.05, 0.42), alloy, 0, 0.03, 0));

  const dome = new THREE.Group();
  dome.add(body(new THREE.CylinderGeometry(0.32, 0.34, 0.1, 36), alloy, 0, 0.08, 0));
  dome.add(body(new THREE.SphereGeometry(0.28, 36, 20, 0, Math.PI * 2, 0, Math.PI / 2), polymer, 0, 0.12, 0));
  dome.add(body(new THREE.TorusGeometry(0.27, 0.016, 10, 36), signal, 0, 0.13, 0, Math.PI / 2, 0, 0));
  dome.add(body(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), navy, 0, 0.4, 0));

  const plinthGeo = new THREE.CylinderGeometry(1.28, 1.34, 0.1, 64);
  const plinthA = new THREE.Group();
  plinthA.add(body(plinthGeo, stage, 0, 0.05, 0));
  plinthA.add(body(new THREE.TorusGeometry(1.05, 0.012, 8, 64), alloy, 0, 0.1, 0, Math.PI / 2, 0, 0));
  const plinthB = new THREE.Group();
  plinthB.add(body(plinthGeo, stage, 0, 0.05, 0));
  plinthB.add(body(new THREE.TorusGeometry(1.05, 0.012, 8, 64), alloy, 0, 0.1, 0, Math.PI / 2, 0, 0));

  const root = new THREE.Group();
  const parts = {
    surveillance: optic,
    networking: chassis,
    "smart-home": plate,
    access: latch,
    safety: dome,
    plinthA,
    plinthB,
  } satisfies Record<PartId, THREE.Object3D>;
  for (const part of Object.values(parts)) root.add(part);
  return { root, parts };
}
