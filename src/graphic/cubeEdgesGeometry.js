import { BufferGeometry, Float32BufferAttribute } from 'three';

export class CubeEdgesGeometry extends BufferGeometry {
  static NeighborPX = 1 << 0;
  static NeighborNX = 1 << 1;
  static NeighborPY = 1 << 2;
  static NeighborNY = 1 << 3;
  static NeighborPZ = 1 << 4;
  static NeighborNZ = 1 << 5;

  constructor(neighbors, size = 1) {
    super();

    const ps = +size / 2;
    const ns = -size / 2;
    const vertices = [];

    const hasEdge = (flag1, flag2) => {
      const mask = flag1 | flag2;
      return (neighbors & mask) === 0 || (neighbors & mask) === mask;
    };

    if (hasEdge(CubeEdgesGeometry.NeighborPX, CubeEdgesGeometry.NeighborPY)) {
      vertices.push(ps, ps, ns);
      vertices.push(ps, ps, ps);
    }
    if (hasEdge(CubeEdgesGeometry.NeighborPX, CubeEdgesGeometry.NeighborNY)) {
      vertices.push(ps, ns, ns);
      vertices.push(ps, ns, ps);
    }
    if (hasEdge(CubeEdgesGeometry.NeighborPX, CubeEdgesGeometry.NeighborPZ)) {
      vertices.push(ps, ns, ps);
      vertices.push(ps, ps, ps);
    }
    if (hasEdge(CubeEdgesGeometry.NeighborPX, CubeEdgesGeometry.NeighborNZ)) {
      vertices.push(ps, ns, ns);
      vertices.push(ps, ps, ns);
    }
    if (hasEdge(CubeEdgesGeometry.NeighborNX, CubeEdgesGeometry.NeighborPY)) {
      vertices.push(ns, ps, ns);
      vertices.push(ns, ps, ps);
    }
    if (hasEdge(CubeEdgesGeometry.NeighborNX, CubeEdgesGeometry.NeighborNY)) {
      vertices.push(ns, ns, ns);
      vertices.push(ns, ns, ps);
    }
    if (hasEdge(CubeEdgesGeometry.NeighborNX, CubeEdgesGeometry.NeighborPZ)) {
      vertices.push(ns, ns, ps);
      vertices.push(ns, ps, ps);
    }
    if (hasEdge(CubeEdgesGeometry.NeighborNX, CubeEdgesGeometry.NeighborNZ)) {
      vertices.push(ns, ns, ns);
      vertices.push(ns, ps, ns);
    }
    if (hasEdge(CubeEdgesGeometry.NeighborPY, CubeEdgesGeometry.NeighborPZ)) {
      vertices.push(ns, ps, ps);
      vertices.push(ps, ps, ps);
    }
    if (hasEdge(CubeEdgesGeometry.NeighborPY, CubeEdgesGeometry.NeighborNZ)) {
      vertices.push(ns, ps, ns);
      vertices.push(ps, ps, ns);
    }
    if (hasEdge(CubeEdgesGeometry.NeighborNY, CubeEdgesGeometry.NeighborPZ)) {
      vertices.push(ns, ns, ps);
      vertices.push(ps, ns, ps);
    }
    if (hasEdge(CubeEdgesGeometry.NeighborNY, CubeEdgesGeometry.NeighborNZ)) {
      vertices.push(ns, ns, ns);
      vertices.push(ps, ns, ns);
    }
    this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  }
}
