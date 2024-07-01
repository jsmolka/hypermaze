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

    const size = 25;
    const maze = new Maze(size);
    for (let i = 1; i < size - 1; i++) {
      for (let j = 1; j < size - 1; j++) {
        for (let k = 1; k < size - 1; k++) {
          maze.data[i][j][k] = Math.random() < 0.5 ? Maze.Path : Maze.Wall;
        }
      }
    }

    const mesh = new InstancedMesh(
      new BoxGeometry(),
      new MeshBasicMaterial({ color: palette.brand3 }),
      size ** 3,
    );
    mesh.translateX(-size / 2 + 1 / 2);
    mesh.translateY(-size / 2 + 1 / 2);
    mesh.translateZ(-size / 2 + 1 / 2);

    this.scene.add(mesh);

    let count = 0;
    for (let i = 1; i < size - 1; i++) {
      for (let j = 1; j < size - 1; j++) {
        for (let k = 1; k < size - 1; k++) {
          if (maze.data[i][j][k] === Maze.Path) {
            mesh.setMatrixAt(count++, new Matrix4().setPosition(i, j, k));

            let mask = 0;
            if (maze.data[i + 1][j][k] === Maze.Path) {
              mask |= Neighbor.px;
            }
            if (maze.data[i - 1][j][k] === Maze.Path) {
              mask |= Neighbor.nx;
            }
            if (maze.data[i][j + 1][k] === Maze.Path) {
              mask |= Neighbor.py;
            }
            if (maze.data[i][j - 1][k] === Maze.Path) {
              mask |= Neighbor.ny;
            }
            if (maze.data[i][j][k + 1] === Maze.Path) {
              mask |= Neighbor.pz;
            }
            if (maze.data[i][j][k - 1] === Maze.Path) {
              mask |= Neighbor.nz;
            }

            const edges = new LineSegments(
              new CubeEdgesGeometry(mask),
              new LineBasicMaterial({ color: palette.shade8 }),
            );
            edges.translateX(i);
            edges.translateY(j);
            edges.translateZ(k);
            edges.translateX(-size / 2 + 1 / 2);
            edges.translateY(-size / 2 + 1 / 2);
            edges.translateZ(-size / 2 + 1 / 2);
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
