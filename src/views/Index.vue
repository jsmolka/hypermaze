<template>
  <div ref="container" class="h-full" />
</template>

<script setup>
import { CubeEdgesGeometry } from '@/graphic/cubeEdgesGeometry';
import { dispose } from '@/graphic/dispose';
import { Graphic } from '@/graphic/graphic';
import { Neighbor } from '@/graphic/neighbor';
import { palette } from '@/graphic/palette';
import { Maze } from '@/modules/maze';
import { useResizeObserver } from '@vueuse/core';
import {
  BoxGeometry,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const container = ref();

// https://discourse.threejs.org/t/use-edgesgeometry-in-an-instancedmesh/16723

class MazeGraphic extends Graphic {
  paint() {
    dispose(this.scene);

    const size = 20;
    const maze = new Maze(size);

    const mesh = new InstancedMesh(
      new BoxGeometry(),
      new MeshBasicMaterial({ color: palette.brand3 }),
      (2 * size) ** 3,
    );
    mesh.translateX(-size + 1 / 2);
    mesh.translateY(-size + 1 / 2);
    mesh.translateZ(-size + 1 / 2);

    this.scene.add(mesh);

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

            const edges = new LineSegments(
              new CubeEdgesGeometry(mask),
              new LineBasicMaterial({ color: palette.shade8 }),
            );
            edges.translateX(i);
            edges.translateY(j);
            edges.translateZ(k);
            edges.translateX(-size + 1 / 2);
            edges.translateY(-size + 1 / 2);
            edges.translateZ(-size + 1 / 2);
            this.scene.add(edges);
          }
        }
      }
    }
    mesh.count = count;

    const phantom = new Mesh(
      new BoxGeometry(size, size, size),
      new MeshBasicMaterial({ opacity: 0, transparent: true }),
    );
    this.scene.add(phantom);

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
