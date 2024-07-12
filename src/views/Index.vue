<template>
  <div ref="container" class="h-full" />
</template>

<script setup>
import { CubeEdgesGeometry } from '@/graphic/cubeEdgesGeometry';
import { CubeGeometry } from '@/graphic/cubeGeometry';
import { dispose } from '@/graphic/dispose';
import { Graphic } from '@/graphic/graphic';
import { InstancedLineBasicMaterial } from '@/graphic/instancedLineBasicMaterial';
import { InstancedMesh } from '@/graphic/instancedMesh';
import { Maze } from '@/modules/maze';
import { neighbor } from '@/modules/neighbor';
import { RecursiveBacktracking } from '@/modules/recursiveBacktracking';
import { colors } from '@/utils/colors';
import { useResizeObserver } from '@vueuse/core';
import {
  Group,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LineSegments,
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
  constructor(container, options = {}) {
    super(container, options);
    this.setup();
  }

  setup() {
    dispose(this.scene);

    this.group = new Group();
    this.group.translateX(-maze.elementDims / 2 + 1 / 2);
    this.group.translateY(-maze.elementDims / 2 + 1 / 2);
    this.group.translateZ(-maze.elementDims / 2 + 1 / 2);
    this.scene.add(this.group);

    this.cubes = new InstancedMesh(
      new CubeGeometry(),
      new MeshBasicMaterial({ color: colors.brand3.int }),
      maze.elements,
    );
    this.group.add(this.cubes);

    const bbox = new Mesh(
      new CubeGeometry(maze.elementDims),
      new MeshBasicMaterial({ opacity: 0, transparent: true }),
    );
    this.scene.add(bbox);
  }

  renderMaze() {
    const xAxis = neighbor.px | neighbor.nx;
    const yAxis = neighbor.py | neighbor.ny;
    const zAxis = neighbor.pz | neighbor.nz;

    let count = 0;
    const edgesPositions = Array.from(Array(1 << 6), () => []);
    for (let z = 0; z < maze.size; z++) {
      for (let y = 0; y < maze.size; y++) {
        for (let x = 0; x < maze.size; x++) {
          const neighbors = maze[maze.index(x, y, z)];
          if (neighbors === 0) {
            continue;
          }

          const cx = 2 * x;
          const cy = 2 * y;
          const cz = 2 * z;

          this.cubes.setPositionAt(count++, cx, cy, cz);
          edgesPositions[neighbors].push(cx, cy, cz);

          if (neighbors & neighbor.px) {
            this.cubes.setPositionAt(count++, cx + 1, cy, cz);
            edgesPositions[xAxis].push(cx + 1, cy, cz);
          }
          if (neighbors & neighbor.py) {
            this.cubes.setPositionAt(count++, cx, cy + 1, cz);
            edgesPositions[yAxis].push(cx, cy + 1, cz);
          }
          if (neighbors & neighbor.pz) {
            this.cubes.setPositionAt(count++, cx, cy, cz + 1);
            edgesPositions[zAxis].push(cx, cy, cz + 1);
          }
        }
      }
    }
    this.cubes.count = count;

    // Edges
    for (const [neighborMask, positions] of edgesPositions.entries()) {
      if (positions.length === 0) {
        continue;
      }

      const edgesMaterial = new InstancedLineBasicMaterial({
        color: colors.shade8.int,
      });

      const edgesGeometry = new CubeEdgesGeometry(neighborMask);
      const instancedEdgesGeometry = new InstancedBufferGeometry().copy(edgesGeometry);
      instancedEdgesGeometry.instanceCount = positions.length;
      instancedEdgesGeometry.setAttribute(
        'offset',
        new InstancedBufferAttribute(new Float32Array(positions), 3),
      );

      const edges = new LineSegments(instancedEdgesGeometry, edgesMaterial);
      edges.frustumCulled = false;
      this.group.add(edges);
    }

    this.render();
  }
}

let graphic = null;

onMounted(() => {
  graphic = new MazeGraphic(container.value);
  graphic.renderMaze();
  graphic.fitAndCenter();

  useResizeObserver(container, ([entry]) => {
    graphic.resize(entry.contentRect);
  });
});

onBeforeUnmount(() => {
  graphic.dispose();
  graphic = null;
});
</script>
