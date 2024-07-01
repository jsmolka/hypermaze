import { Neighbor } from '@/graphic/neighbor';
import { BufferGeometry, Float32BufferAttribute } from 'three';

export class CubeEdgesGeometry extends BufferGeometry {
  constructor(neighborMask, size = 1) {
    super();

    const ps = +size / 2;
    const ns = -size / 2;
    const vertices = [];

    const hasEdge = (flag1, flag2) => {
      const mask = flag1 | flag2;
      return (neighborMask & mask) === 0 || (neighborMask & mask) === mask;
    };

    if (hasEdge(Neighbor.px, Neighbor.py)) {
      vertices.push(ps, ps, ns);
      vertices.push(ps, ps, ps);
    }
    if (hasEdge(Neighbor.px, Neighbor.ny)) {
      vertices.push(ps, ns, ns);
      vertices.push(ps, ns, ps);
    }
    if (hasEdge(Neighbor.px, Neighbor.pz)) {
      vertices.push(ps, ns, ps);
      vertices.push(ps, ps, ps);
    }
    if (hasEdge(Neighbor.px, Neighbor.nz)) {
      vertices.push(ps, ns, ns);
      vertices.push(ps, ps, ns);
    }
    if (hasEdge(Neighbor.nx, Neighbor.py)) {
      vertices.push(ns, ps, ns);
      vertices.push(ns, ps, ps);
    }
    if (hasEdge(Neighbor.nx, Neighbor.ny)) {
      vertices.push(ns, ns, ns);
      vertices.push(ns, ns, ps);
    }
    if (hasEdge(Neighbor.nx, Neighbor.pz)) {
      vertices.push(ns, ns, ps);
      vertices.push(ns, ps, ps);
    }
    if (hasEdge(Neighbor.nx, Neighbor.nz)) {
      vertices.push(ns, ns, ns);
      vertices.push(ns, ps, ns);
    }
    if (hasEdge(Neighbor.py, Neighbor.pz)) {
      vertices.push(ns, ps, ps);
      vertices.push(ps, ps, ps);
    }
    if (hasEdge(Neighbor.py, Neighbor.nz)) {
      vertices.push(ns, ps, ns);
      vertices.push(ps, ps, ns);
    }
    if (hasEdge(Neighbor.ny, Neighbor.pz)) {
      vertices.push(ns, ns, ps);
      vertices.push(ps, ns, ps);
    }
    if (hasEdge(Neighbor.ny, Neighbor.nz)) {
      vertices.push(ns, ns, ns);
      vertices.push(ps, ns, ns);
    }
    this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  }
}
