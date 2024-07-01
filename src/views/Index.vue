<template>
  <div ref="container" class="h-full" />
</template>

<script setup>
import { CubeEdgesGeometry } from '@/graphic/cubeEdgesGeometry';
import { CubeGeometry } from '@/graphic/cubeGeometry';
import { dispose } from '@/graphic/dispose';
import { Graphic } from '@/graphic/graphic';
import { Neighbor } from '@/graphic/neighbor';
import { palette } from '@/graphic/palette';
import { Maze } from '@/modules/maze';
import { useResizeObserver } from '@vueuse/core';
import {
  BoxGeometry,
  Group,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const container = ref();

class MazeGraphic extends Graphic {
  paint() {
    dispose(this.scene);

    const cubeEdgesPositions = Array.from({ length: 1 << 6 }, () => []);

    const size = 10;
    const maze = new Maze(size);

    const group = new Group();
    group.translateX(-maze.length / 2 + 1 / 2);
    group.translateY(-maze.length / 2 + 1 / 2);
    group.translateZ(-maze.length / 2 + 1 / 2);
    this.scene.add(group);

    const mesh = new InstancedMesh(
      new BoxGeometry(),
      new MeshBasicMaterial({ color: palette.brand3 }),
      maze.length ** 3,
    );
    group.add(mesh);

    let count = 0;
    for (let i = 0; i < 2 * size - 1; i++) {
      for (let j = 0; j < 2 * size - 1; j++) {
        for (let k = 0; k < 2 * size - 1; k++) {
          if (maze.get(i, j, k) === Maze.Path) {
            mesh.setMatrixAt(count++, new Matrix4().setPosition(i, j, k));

            let mask = 0;
            if (maze.get(i + 1, j, k) === Maze.Path) {
              mask |= Neighbor.px;
            }
            if (maze.get(i - 1, j, k) === Maze.Path) {
              mask |= Neighbor.nx;
            }
            if (maze.get(i, j + 1, k) === Maze.Path) {
              mask |= Neighbor.py;
            }
            if (maze.get(i, j - 1, k) === Maze.Path) {
              mask |= Neighbor.ny;
            }
            if (maze.get(i, j, k + 1) === Maze.Path) {
              mask |= Neighbor.pz;
            }
            if (maze.get(i, j, k - 1) === Maze.Path) {
              mask |= Neighbor.nz;
            }

            cubeEdgesPositions[mask].push(i, j, k);
          }
        }
      }
    }
    mesh.count = count;

    // Edges
    const cubeEdgesMaterial = new LineBasicMaterial({
      color: palette.shade8,
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

    for (const [neighborMask, positions] of cubeEdgesPositions.entries()) {
      if (positions.length === 0) {
        continue;
      }

      const cubeEdgesGeometry = new CubeEdgesGeometry(neighborMask);
      const instancedCubeEdgesGeometry = new InstancedBufferGeometry().copy(cubeEdgesGeometry);
      instancedCubeEdgesGeometry.instanceCount = positions.length;
      instancedCubeEdgesGeometry.setAttribute(
        'offset',
        new InstancedBufferAttribute(new Float32Array(positions), 3),
      );

      group.add(new LineSegments(instancedCubeEdgesGeometry, cubeEdgesMaterial));
    }

    // Bounding box
    const bbox = new Mesh(
      new CubeGeometry(maze.length),
      new MeshBasicMaterial({ opacity: 0, transparent: true }),
    );
    this.scene.add(bbox);

    this.render();
  }
}

let graphic = null;

onMounted(() => {
  graphic = new MazeGraphic(container.value);
  graphic.paint();
  graphic.fitAndCenter();
  graphic.render();

  useResizeObserver(container, ([entry]) => {
    graphic.resize(entry.contentRect);
  });
});

onBeforeUnmount(() => {
  graphic.dispose();
  graphic = null;
});
</script>
