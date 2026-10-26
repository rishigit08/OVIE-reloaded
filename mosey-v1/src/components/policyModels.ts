// Chunky, glazed 3D models for each kind of policy. Each one fits inside a
// sphere of radius ~1.2 so they frame the same way in a tile.

import * as THREE from 'three';

import { PolicyType } from '@/lib/data';
import { colors } from '@/lib/theme';

const CREAM = '#FFF4E0';

const glaze = (color: string) => new THREE.MeshPhongMaterial({ color, shininess: 70, specular: 0x555555 });

function box(w: number, h: number, d: number, color: string, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), glaze(color));
  m.position.set(x, y, z);
  return m;
}

function puffy(shape: THREE.Shape, depth: number, bevel: number, color: string) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 6,
    curveSegments: 24,
  });
  geo.center();
  return new THREE.Mesh(geo, glaze(color));
}

function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.75);
  s.bezierCurveTo(-0.3, -0.45, -1.05, 0, -1.05, 0.45);
  s.bezierCurveTo(-1.05, 0.95, -0.35, 1.05, 0, 0.55);
  s.bezierCurveTo(0.35, 1.05, 1.05, 0.95, 1.05, 0.45);
  s.bezierCurveTo(1.05, 0, 0.3, -0.45, 0, -0.75);
  return s;
}

function house() {
  const g = new THREE.Group();
  g.add(box(1.4, 0.95, 1.15, CREAM, 0, -0.38, 0));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.8, 4), glaze(colors.teal));
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1, 1, 0.86);
  roof.position.y = 0.5;
  g.add(roof);
  g.add(box(0.22, 0.5, 0.22, colors.plum, 0.42, 0.62, -0.1));
  g.add(box(0.3, 0.52, 0.08, colors.tangerine, -0.28, -0.59, 0.58));
  g.add(box(0.34, 0.32, 0.08, colors.sky, 0.3, -0.3, 0.58));
  g.rotation.set(0.3, -0.55, 0);
  return g;
}

function key() {
  const g = new THREE.Group();
  const gold = glaze(colors.sun);
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.15, 14, 32), glaze(colors.tangerine));
  bow.position.x = -0.62;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 1.25, 18), gold);
  shaft.rotation.z = Math.PI / 2;
  shaft.position.x = 0.4;
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 12), gold);
  tip.position.x = 1.02;
  g.add(bow, shaft, tip);
  g.add(box(0.16, 0.34, 0.16, colors.sun, 0.62, -0.22, 0));
  g.add(box(0.16, 0.24, 0.16, colors.sun, 0.9, -0.17, 0));
  g.rotation.set(0.25, -0.35, 0.7);
  return g;
}

function car() {
  const g = new THREE.Group();
  g.add(box(2.0, 0.44, 0.95, colors.sky, 0, -0.1, 0));
  g.add(box(1.02, 0.34, 0.8, '#CFE4FF', -0.08, 0.29, 0));
  g.add(box(1.08, 0.1, 0.86, colors.sky, -0.08, 0.5, 0));
  const tyre = new THREE.CylinderGeometry(0.26, 0.26, 0.2, 22);
  const hub = new THREE.CylinderGeometry(0.11, 0.11, 0.22, 14);
  for (const x of [-0.62, 0.62]) {
    for (const z of [-0.46, 0.46]) {
      const wheel = new THREE.Mesh(tyre, glaze(colors.ink));
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, -0.36, z);
      const cap = new THREE.Mesh(hub, glaze(CREAM));
      cap.rotation.x = Math.PI / 2;
      cap.position.set(x, -0.36, z);
      g.add(wheel, cap);
    }
  }
  g.add(box(0.06, 0.14, 0.2, colors.sun, 1.0, -0.04, 0.28));
  g.add(box(0.06, 0.14, 0.2, colors.sun, 1.0, -0.04, -0.28));
  g.rotation.set(0.32, -0.6, 0);
  g.scale.setScalar(0.92);
  return g;
}

function heart() {
  const g = new THREE.Group();
  g.add(puffy(heartShape(), 0.26, 0.16, colors.pink));
  g.add(box(0.5, 0.17, 0.1, CREAM, 0, 0.12, 0.31));
  g.add(box(0.17, 0.5, 0.1, CREAM, 0, 0.12, 0.31));
  g.rotation.set(0.1, -0.4, 0.08);
  g.scale.setScalar(0.88);
  return g;
}

function shield() {
  const s = new THREE.Shape();
  s.moveTo(0, -1);
  s.bezierCurveTo(-0.55, -0.75, -0.85, -0.3, -0.85, 0.2);
  s.lineTo(-0.85, 0.7);
  s.quadraticCurveTo(-0.4, 0.75, 0, 0.95);
  s.quadraticCurveTo(0.4, 0.75, 0.85, 0.7);
  s.lineTo(0.85, 0.2);
  s.bezierCurveTo(0.85, -0.3, 0.55, -0.75, 0, -1);
  const g = new THREE.Group();
  g.add(puffy(s, 0.2, 0.12, colors.plum));
  const emblem = puffy(heartShape(), 0.06, 0.05, colors.sun);
  emblem.scale.setScalar(0.36);
  emblem.position.set(0, 0.05, 0.25);
  g.add(emblem);
  g.rotation.set(0.1, -0.45, 0);
  g.scale.setScalar(0.95);
  return g;
}

function plane() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 1.35, 8, 18), glaze(CREAM));
  body.rotation.z = Math.PI / 2;
  g.add(body);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), glaze(colors.ink));
  nose.scale.set(1.2, 0.7, 0.9);
  nose.position.set(0.62, 0.1, 0);
  g.add(nose);
  g.add(box(0.52, 0.07, 2.0, colors.leaf, 0.05, -0.04, 0));
  g.add(box(0.3, 0.06, 0.78, colors.leaf, -0.78, 0.06, 0));
  g.add(box(0.34, 0.44, 0.07, colors.tangerine, -0.78, 0.28, 0));
  const pod = new THREE.CylinderGeometry(0.1, 0.1, 0.32, 14);
  for (const z of [-0.55, 0.55]) {
    const engine = new THREE.Mesh(pod, glaze(colors.tangerine));
    engine.rotation.z = Math.PI / 2;
    engine.position.set(0.12, -0.16, z);
    g.add(engine);
  }
  g.rotation.set(0.75, -0.55, 0.3);
  g.scale.setScalar(1.08);
  return g;
}

const BUILDERS: Record<PolicyType, () => THREE.Group> = {
  personalAuto: car,
  commercialAuto: car,
  renters: key,
  condo: house,
  personalUmbrella: shield,
  commercialUmbrella: shield,
  generalLiability: shield,
  commercialProperty: house,
  bop: house,
  workersComp: shield,
  commercialPackage: house,
  termLife: heart,
};

export function buildPolicyModel(type: PolicyType): THREE.Group {
  return BUILDERS[type]();
}

/** Soft backing color for each model's tile. */
export const TILE_TINT: Record<PolicyType, string> = {
  personalAuto: '#DCE9FF',
  commercialAuto: '#DCE9FF',
  renters: '#FFEAD2',
  condo: '#D8F3F0',
  personalUmbrella: '#EFE0EB',
  commercialUmbrella: '#EFE0EB',
  generalLiability: '#FFE1EA',
  commercialProperty: '#D8F3F0',
  bop: '#FFEAD2',
  workersComp: '#FFF3D1',
  commercialPackage: '#E2F4D8',
  termLife: '#FFE1EA',
};
