import {
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LineSegments,
  Matrix4,
  Quaternion,
  Vector3,
} from 'three';

const matrix4 = new Matrix4();
const identity = new Matrix4();

export class InstancedLineSegments extends LineSegments {
  constructor(geometry, material, count) {
    super(
      geometry instanceof InstancedBufferGeometry
        ? geometry
        : new InstancedBufferGeometry().copy(geometry),
      material,
    );

    this.geometry.instanceCount = count;
    this.geometry.setAttribute(
      'matrixAttribute',
      new InstancedBufferAttribute(new Float32Array(16 * count), 16),
    );

    this.material.onBeforeCompile = function (shader) {
      shader.vertexShader = `
        attribute mat4 matrixAttribute;
        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
         transformed = (matrixAttribute * vec4(transformed, 1.0)).xyz;
      `,
      );
    };

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

  get matrixAttribute() {
    return this.geometry.attributes.matrixAttribute;
  }

  getMatrixAt(index, matrix = new Matrix4()) {
    return matrix.fromArray(this.matrixAttribute.array, this.matrixAttribute.itemSize * index);
  }

  setMatrixAt(index, matrix) {
    matrix.toArray(this.matrixAttribute.array, this.matrixAttribute.itemSize * index);
  }

  getPositionAt(index, position = new Vector3()) {
    index *= this.matrixAttribute.itemSize;
    position.x = this.matrixAttribute.array[index + 12];
    position.y = this.matrixAttribute.array[index + 13];
    position.z = this.matrixAttribute.array[index + 14];
    return position;
  }

  setPositionAt(index, x, y, z) {
    index *= this.matrixAttribute.itemSize;
    this.matrixAttribute.array[index + 12] = x;
    this.matrixAttribute.array[index + 13] = y;
    this.matrixAttribute.array[index + 14] = z;
  }

  getScaleAt(index, scale = new Vector3()) {
    index *= this.matrixAttribute.itemSize;
    scale.x = this.matrixAttribute.array[index];
    scale.y = this.matrixAttribute.array[index + 5];
    scale.z = this.matrixAttribute.array[index + 10];
    return scale;
  }

  setScaleAt(index, x, y, z) {
    index *= this.matrixAttribute.itemSize;
    this.matrixAttribute.array[index] = x;
    this.matrixAttribute.array[index + 5] = y;
    this.matrixAttribute.array[index + 10] = z;
  }

  getRotationAt(index, quaternion = new Quaternion()) {
    return quaternion.setFromRotationMatrix(this.getMatrixAt(index, matrix4));
  }

  setRotationAt(index, x, y, z, w) {
    this.setMatrixAt(
      index,
      this.getMatrixAt(index, matrix4).makeRotationFromQuaternion(new Quaternion(x, y, z, w)),
    );
  }
}
