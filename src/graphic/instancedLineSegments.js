import { InstancedBufferGeometry, LineSegments } from 'three';

export class InstancedLineSegments extends LineSegments {
  constructor(geometry, material, count = Infinity) {
    const instancedGeometry = new InstancedBufferGeometry().copy(geometry);
    instancedGeometry.instanceCount = count;

    const onBeforeCompile = material.onBeforeCompile;
    material.onBeforeCompile = function (shader) {
      onBeforeCompile?.(shader);
      shader.vertexShader = `
        attribute vec3 offset;
        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
         transformed += offset;`,
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
}
