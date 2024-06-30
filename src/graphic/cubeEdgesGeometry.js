import { BufferGeometry, Float32BufferAttribute } from 'three';

export class CubeEdgesGeometry extends BufferGeometry {
  static MaskEdgesPX = 1 << 0;
  static MaskEdgesNX = 1 << 1;
  static MaskEdgesPY = 1 << 2;
  static MaskEdgesNY = 1 << 3;
  static MaskEdgesPZ = 1 << 4;
  static MaskEdgesNZ = 1 << 5;

  constructor(mask, size = 1) {
    super();

    const ps = +size / 2;
    const ns = -size / 2;

    const vertices = [];
    if (mask & CubeEdgesGeometry.MaskEdgesPX) {
      if (mask & CubeEdgesGeometry.MaskEdgesPY) {
        vertices.push(ps, ps, ns);
        vertices.push(ps, ps, ps);
      }
      if (mask & CubeEdgesGeometry.MaskEdgesNY) {
        vertices.push(ps, ns, ns);
        vertices.push(ps, ns, ps);
      }
      if (mask & CubeEdgesGeometry.MaskEdgesPZ) {
        vertices.push(ps, ns, ps);
        vertices.push(ps, ps, ps);
      }
      if (mask & CubeEdgesGeometry.MaskEdgesNZ) {
        vertices.push(ps, ns, ns);
        vertices.push(ps, ps, ns);
      }
    }
    if (mask & CubeEdgesGeometry.MaskEdgesNX) {
      if (mask & CubeEdgesGeometry.MaskEdgesPY) {
        vertices.push(ns, ps, ns);
        vertices.push(ns, ps, ps);
      }
      if (mask & CubeEdgesGeometry.MaskEdgesNY) {
        vertices.push(ns, ns, ns);
        vertices.push(ns, ns, ps);
      }
      if (mask & CubeEdgesGeometry.MaskEdgesPZ) {
        vertices.push(ns, ns, ps);
        vertices.push(ns, ps, ps);
      }
      if (mask & CubeEdgesGeometry.MaskEdgesNZ) {
        vertices.push(ns, ns, ns);
        vertices.push(ns, ps, ns);
      }
    }
    if (mask & CubeEdgesGeometry.MaskEdgesPY) {
      if (mask & CubeEdgesGeometry.MaskEdgesPZ) {
        vertices.push(ns, ps, ps);
        vertices.push(ps, ps, ps);
      }
      if (mask & CubeEdgesGeometry.MaskEdgesNZ) {
        vertices.push(ns, ps, ns);
        vertices.push(ps, ps, ns);
      }
    }
    if (mask & CubeEdgesGeometry.MaskEdgesNY) {
      if (mask & CubeEdgesGeometry.MaskEdgesPZ) {
        vertices.push(ns, ns, ps);
        vertices.push(ps, ns, ps);
      }
      if (mask & CubeEdgesGeometry.MaskEdgesNZ) {
        vertices.push(ns, ns, ns);
        vertices.push(ps, ns, ns);
      }
    }
    this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  }
}
