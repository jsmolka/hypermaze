import { InstancedBufferAttribute, InstancedBufferGeometry, LineSegments } from 'three';

export class InstancedPositionLineSegments extends LineSegments {
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
    index *= 3;
    position.x = this.positionAttribute.array[index + 0];
    position.y = this.positionAttribute.array[index + 1];
    position.z = this.positionAttribute.array[index + 2];
    return position;
  }

  setPositionAt(index, x, y, z) {
    index *= 3;
    this.positionAttribute.array[index + 0] = x;
    this.positionAttribute.array[index + 1] = y;
    this.positionAttribute.array[index + 2] = z;
  }
}
