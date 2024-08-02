import { InstancedBufferAttribute, InstancedBufferGeometry, Mesh } from 'three';

export class InstancedPositionMesh extends Mesh {
  constructor(geometry, material, count) {
    super(new InstancedBufferGeometry().copy(geometry), material);

    this.geometry.instanceCount = count;
    this.geometry.setAttribute(
      'positionAttribute',
      new InstancedBufferAttribute(new Float32Array(3 * count), 3),
    );

    this.material.onBeforeCompile = function (shader) {
      shader.vertexShader = `
        attribute vec3 positionAttribute;
        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
         transformed += positionAttribute;
      `,
      );
    };
  }

  get count() {
    return this.geometry.instanceCount;
  }

  set count(value) {
    this.geometry.instanceCount = value;
  }

  get positionAttribute() {
    return this.geometry.attributes.positionAttribute;
  }

  getPositionAt(index, position = new Vector3()) {
    index *= this.positionAttribute.itemSize;
    position.x = this.positionAttribute.array[index + 0];
    position.y = this.positionAttribute.array[index + 1];
    position.z = this.positionAttribute.array[index + 2];
    return position;
  }

  setPositionAt(index, x, y, z) {
    index *= this.positionAttribute.itemSize;
    this.positionAttribute.array[index + 0] = x;
    this.positionAttribute.array[index + 1] = y;
    this.positionAttribute.array[index + 2] = z;
  }
}
