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

    const group = new Group();
    group.translateX(-maze.length / 2 + 1 / 2);
    group.translateY(-maze.length / 2 + 1 / 2);
    group.translateZ(-maze.length / 2 + 1 / 2);
    this.scene.add(group);

    const cubes = new InstancedMesh(
      new CubeGeometry(),
      new MeshBasicMaterial({ color: palette.brand3 }),
      maze.length ** 3,
    );
    group.add(cubes);

    let count = 0;
    const edgesPositions = Array.from({ length: 1 << 6 }, () => []);
    for (let x = 0; x < maze.length; x++) {
      for (let y = 0; y < maze.length; y++) {
        for (let z = 0; z < maze.length; z++) {
          if (maze.get(x, y, z) !== Maze.Path) {
            continue;
          }

          cubes.setMatrixAt(count++, new Matrix4().setPosition(x, y, z));

          let mask = 0;
          if (maze.get(x + 1, y, z) === Maze.Path) mask |= Neighbor.px;
          if (maze.get(x - 1, y, z) === Maze.Path) mask |= Neighbor.nx;
          if (maze.get(x, y + 1, z) === Maze.Path) mask |= Neighbor.py;
          if (maze.get(x, y - 1, z) === Maze.Path) mask |= Neighbor.ny;
          if (maze.get(x, y, z + 1) === Maze.Path) mask |= Neighbor.pz;
          if (maze.get(x, y, z - 1) === Maze.Path) mask |= Neighbor.nz;
          edgesPositions[mask].push(x, y, z);
        }
      }
    }
    cubes.count = count;

    // Edges
    const edgesMaterial = new LineBasicMaterial({
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
