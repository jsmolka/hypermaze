<template>
  <div ref="container" class="h-full" />
</template>

<script setup>
import { CubeEdgesGeometry } from '@/graphic/cubeEdgesGeometry';
import { CubeGeometry } from '@/graphic/cubeGeometry';
import { dispose } from '@/graphic/dispose';
import { Graphic } from '@/graphic/graphic';
import { Maze } from '@/modules/maze';
import { neighbor } from '@/modules/neighbor';
import { RecursiveBacktracking } from '@/modules/recursiveBacktracking';
import { colors } from '@/utils/colors';
import { useResizeObserver } from '@vueuse/core';
import {
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
const size = ref(50);

const maze = new Maze(size.value);
const gen = new RecursiveBacktracking(maze);
gen.build();

class MazeGraphic extends Graphic {
  paint() {
    dispose(this.scene);

    const group = new Group();
    group.translateX(-maze.elementDims / 2 + 1 / 2);
    group.translateY(-maze.elementDims / 2 + 1 / 2);
    group.translateZ(-maze.elementDims / 2 + 1 / 2);
    this.scene.add(group);

    const cubes = new InstancedMesh(
      new CubeGeometry(),
      new MeshBasicMaterial({ color: colors.brand3.int }),
      maze.elements,
    );
    group.add(cubes);

    let count = 0;
    const matrix = new Matrix4();
    const edgesPositions = Array.from({ length: 1 << 6 }, () => []);
    for (let x = 0; x < maze.size; x++) {
      for (let y = 0; y < maze.size; y++) {
        for (let z = 0; z < maze.size; z++) {
          const neighbors = maze[maze.index(x, y, z)];
          if (neighbors === 0) {
            continue;
          }
          cubes.setMatrixAt(count++, matrix.setPosition(2 * x, 2 * y, 2 * z));

          edgesPositions[neighbors].push(2 * x, 2 * y, 2 * z);

          if (neighbors & neighbor.px) {
            cubes.setMatrixAt(count++, matrix.setPosition(2 * x + 1, 2 * y, 2 * z));
            edgesPositions[neighbor.px | neighbor.nx].push(2 * x + 1, 2 * y, 2 * z);
          }
          if (neighbors & neighbor.py) {
            cubes.setMatrixAt(count++, matrix.setPosition(2 * x, 2 * y + 1, 2 * z));
            edgesPositions[neighbor.py | neighbor.ny].push(2 * x, 2 * y + 1, 2 * z);
          }
          if (neighbors & neighbor.pz) {
            cubes.setMatrixAt(count++, matrix.setPosition(2 * x, 2 * y, 2 * z + 1));
            edgesPositions[neighbor.pz | neighbor.nz].push(2 * x, 2 * y, 2 * z + 1);
          }
        }
      }
    }

    // Edges
    const edgesMaterial = new LineBasicMaterial({
      color: colors.shade8.int,
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

    for (const [neighborMask, positions] of edgesPositions.entries()) {
      if (positions.length === 0) {
        continue;
      }

      const edgesGeometry = new CubeEdgesGeometry(neighborMask);
      const instancedEdgesGeometry = new InstancedBufferGeometry().copy(edgesGeometry);
      instancedEdgesGeometry.instanceCount = positions.length;
      instancedEdgesGeometry.setAttribute(
        'offset',
        new InstancedBufferAttribute(new Float32Array(positions), 3),
      );

      const edges = new LineSegments(instancedEdgesGeometry, edgesMaterial);
      edges.frustumCulled = false;
      group.add(edges);
    }

    // Bounding box
    const bbox = new Mesh(
      new CubeGeometry(maze.elementDims),
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
