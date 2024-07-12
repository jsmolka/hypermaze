import { LineBasicMaterial } from 'three';

export class InstancedLineBasicMaterial extends LineBasicMaterial {
  constructor(parameters = {}) {
    super({
      ...parameters,
      onBeforeCompile: (shader) => {
        shader.vertexShader = `
        attribute vec3 offset;
        ${shader.vertexShader}
      `.replace(
          `#include <begin_vertex>`,
          `#include <begin_vertex>
         transformed += offset;`,
        );
      },
    });
  }
}
