import {
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LineSegments,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three';

const matrix4 = new Matrix4();

export class InstancedLineSegments extends LineSegments {
  constructor(geometry, material, count) {
    super(new InstancedBufferGeometry().copy(geometry), material);

    this.geometry.instanceCount = count;
    this.geometry.setAttribute(
      'transformMatrix',
      new InstancedBufferAttribute(new Float32Array(16 * count), 16),
    );

    this.material.onBeforeCompile = function (shader) {
      shader.vertexShader = `
        attribute mat4 transformMatrix;
        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
         transformed = (transformMatrix * vec4(transformed, 1.0)).xyz;
      `,
      );
    };

    const identity = new Matrix4();
    for (let i = 0; i < count; i++) {
      this.setMatrixAt(i, identity);
    }
  }

  get count() {
    return this.geometry.instanceCount;
  }

  set count(value) {
    this.geometry.instanceCount = value;
  }

  getMatrixAt(index, matrix = new Matrix4()) {
    return matrix.fromArray(this.geometry.attributes.transformMatrix.array, 16 * index);
  }

  setMatrixAt(index, matrix) {
    matrix.toArray(this.geometry.attributes.transformMatrix.array, 16 * index);
  }

  getPositionAt(index, position = new Vector3()) {
    return position.setFromMatrixPosition(this.getMatrixAt(index, matrix4));
  }

  setPositionAt(index, x, y, z) {
    this.setMatrixAt(index, this.getMatrixAt(index, matrix4).setPosition(x, y, z));
  }

  getScaleAt(index, scale = new Vector3()) {
    return scale.setFromMatrixScale(this.getMatrixAt(index, matrix4));
  }

  setScaleAt(index, x, y, z) {
    if (x instanceof Vector3) {
      const v = x;
      x = v.x;
      y = v.y;
      z = v.z;
    }
    this.setMatrixAt(index, this.getMatrixAt(index, matrix4).makeScale(x, y, z));
  }

  getRotationAt(index, quaternion = new Quaternion()) {
    return quaternion.setFromRotationMatrix(this.getMatrixAt(index, matrix4));
  }

  setRotationAt(index, x, y, z, w) {
    const q = x instanceof Quaternion ? x : new Quaternion(x, y, z, w);
    this.setMatrixAt(index, this.getMatrixAt(index, matrix4).makeRotationFromQuaternion(q));
  }
}
