import { instancedMixin } from '@/graphic/instancedMixin';
import { InstancedBufferAttribute, InstancedBufferGeometry, LineSegments, Matrix4 } from 'three';

const identity = new Matrix4();

export class InstancedLineSegments extends LineSegments {
  constructor(geometry, material, count) {
    super(new InstancedBufferGeometry().copy(geometry), material);
    Object.assign(this, instancedMixin);

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
    return matrix.fromArray(this.matrixAttribute.array, 16 * index);
  }

  setMatrixAt(index, matrix) {
    matrix.toArray(this.matrixAttribute.array, 16 * index);
  }
}
