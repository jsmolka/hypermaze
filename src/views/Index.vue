<template>
  <div ref="container" class="h-full" />
</template>

<script setup>
import { CubeEdgesGeometry } from '@/graphic/cubeEdgesGeometry';
import { CubeGeometry } from '@/graphic/cubeGeometry';
import { dispose } from '@/graphic/dispose';
import { Graphic } from '@/graphic/graphic';
import { Neighbor } from '@/graphic/neighbor';
import { Maze } from '@/modules/maze';
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

class MazeGraphic extends Graphic {
  paint() {
    dispose(this.scene);

    const maze = new Maze(size.value);
    const dims = 2 * maze.size - 1;

    const group = new Group();
    group.translateX(-dims / 2 + 1 / 2);
    group.translateY(-dims / 2 + 1 / 2);
    group.translateZ(-dims / 2 + 1 / 2);
    this.scene.add(group);

    const cubes = new InstancedMesh(
      new CubeGeometry(),
      new MeshBasicMaterial({ color: colors.brand3.int }),
      dims ** 3,
    );
    group.add(cubes);

    let count = 0;
    const matrix = new Matrix4();
    const edgesPositions = Array.from({ length: 1 << 6 }, () => []);
    for (let x = 0; x < maze.size; x++) {
      for (let y = 0; y < maze.size; y++) {
        for (let z = 0; z < maze.size; z++) {
          cubes.setMatrixAt(count++, matrix.setPosition(2 * x, 2 * y, 2 * z));

          const neighbors = maze.data[maze.index(x, y, z)];
          edgesPositions[neighbors].push(2 * x, 2 * y, 2 * z);

          if (neighbors & Neighbor.px) {
            cubes.setMatrixAt(count++, matrix.setPosition(2 * x + 1, 2 * y, 2 * z));
            edgesPositions[Neighbor.px | Neighbor.nx].push(2 * x + 1, 2 * y, 2 * z);
          }
          if (neighbors & Neighbor.py) {
            cubes.setMatrixAt(count++, matrix.setPosition(2 * x, 2 * y + 1, 2 * z));
            edgesPositions[Neighbor.py | Neighbor.ny].push(2 * x, 2 * y + 1, 2 * z);
          }
          if (neighbors & Neighbor.pz) {
            cubes.setMatrixAt(count++, matrix.setPosition(2 * x, 2 * y, 2 * z + 1));
            edgesPositions[Neighbor.pz | Neighbor.nz].push(2 * x, 2 * y, 2 * z + 1);
          }
        }
      }
    }
    cubes.count = count;

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
      new CubeGeometry(2 * maze.size - 1),
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
