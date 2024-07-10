import { neighbor } from '@/modules/neighbor';
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

    if (hasEdge(neighbor.px, neighbor.py)) {
      vertices.push(ps, ps, ns);
      vertices.push(ps, ps, ps);
    }
    if (hasEdge(neighbor.px, neighbor.ny)) {
      vertices.push(ps, ns, ns);
      vertices.push(ps, ns, ps);
    }
    if (hasEdge(neighbor.px, neighbor.pz)) {
      vertices.push(ps, ns, ps);
      vertices.push(ps, ps, ps);
    }
    if (hasEdge(neighbor.px, neighbor.nz)) {
      vertices.push(ps, ns, ns);
      vertices.push(ps, ps, ns);
    }
    if (hasEdge(neighbor.nx, neighbor.py)) {
      vertices.push(ns, ps, ns);
      vertices.push(ns, ps, ps);
    }
    if (hasEdge(neighbor.nx, neighbor.ny)) {
      vertices.push(ns, ns, ns);
      vertices.push(ns, ns, ps);
    }
    if (hasEdge(neighbor.nx, neighbor.pz)) {
      vertices.push(ns, ns, ps);
      vertices.push(ns, ps, ps);
    }
    if (hasEdge(neighbor.nx, neighbor.nz)) {
      vertices.push(ns, ns, ns);
      vertices.push(ns, ps, ns);
    }
    if (hasEdge(neighbor.py, neighbor.pz)) {
      vertices.push(ns, ps, ps);
      vertices.push(ps, ps, ps);
    }
    if (hasEdge(neighbor.py, neighbor.nz)) {
      vertices.push(ns, ps, ns);
      vertices.push(ps, ps, ns);
    }
    if (hasEdge(neighbor.ny, neighbor.pz)) {
      vertices.push(ns, ns, ps);
      vertices.push(ps, ns, ps);
    }
    if (hasEdge(neighbor.ny, neighbor.nz)) {
      vertices.push(ns, ns, ns);
      vertices.push(ps, ns, ns);
    }
    this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  }
}
