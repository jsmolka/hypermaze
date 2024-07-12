import {
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LineSegments,
  Matrix4,
  Object3D,
  Quaternion,
  Vector3,
} from 'three';

const positionMatrix = new Matrix4();

export class InstancedLineSegments extends LineSegments {
  constructor(geometry, material, count) {
    const instancedGeometry = new InstancedBufferGeometry().copy(geometry);
    instancedGeometry.instanceCount = Infinity;
    instancedGeometry.setAttribute(
      'instT',
      new InstancedBufferAttribute(new Float32Array(3 * count), 3),
    );
    instancedGeometry.setAttribute(
      'instR',
      new InstancedBufferAttribute(new Float32Array(4 * count), 4),
    );
    instancedGeometry.setAttribute(
      'instS',
      new InstancedBufferAttribute(new Float32Array(3 * count), 3),
    );

    material.onBeforeCompile = (shader) => {
      shader.vertexShader = `
      attribute vec3 instT;
      attribute vec4 instR;
      attribute vec3 instS;

      // http://barradeau.com/blog/?p=1109
      vec3 trs( inout vec3 position, vec3 T, vec4 R, vec3 S ) {
          position *= S;
          position += 2.0 * cross( R.xyz, cross( R.xyz, position ) + R.w * position );
          position += T;
          return position;
      }
      ${shader.vertexShader}
  `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
        transformed = trs(transformed, instT, instR, instS);
  `,
      );
    };
    super(instancedGeometry, material);
  }

  get count() {
    return this.geometry.instanceCount;
  }

  set count(value) {
    this.geometry.instanceCount = value;
  }

  setPositionAt(index, x, y, z) {
    const o = new Object3D();
    o.translateX(x);
    o.translateY(y);
    o.translateZ(z);
    o.updateMatrix();

    const t = new Vector3();
    const r = new Quaternion();
    const s = new Vector3();
    o.matrix.decompose(t, r, s);

    this.geometry.attributes.instT.setXYZ(index, t.x, t.y, t.z);
    this.geometry.attributes.instR.setXYZW(index, r.x, r.y, r.z, r.w);
    this.geometry.attributes.instS.setXYZ(index, s.x, s.y, s.z);
  }
}
