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
import { useResizeObserver } from '@vueuse/core';
import {
  BoxGeometry,
  Group,
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

    const size = 1;
    const mesh = new InstancedMesh(
      new BoxGeometry(),
      new MeshBasicMaterial({ color: palette.brand3 }),
      size ** 3,
    );
    mesh.translateX(-size / 2 + 1 / 2);
    mesh.translateY(-size / 2 + 1 / 2);
    mesh.translateZ(-size / 2 + 1 / 2);

    // this.scene.add(mesh);

    let count = 0;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        for (let k = 0; k < size; k++) {
          if (Math.random() < 0.5) {
            continue;
          }

          mesh.setMatrixAt(count++, new Matrix4().setPosition(i, j, k));
        }
      }
    }
    mesh.count = count;

    const phantom = new Mesh(
      new BoxGeometry(size, size, size),
      new MeshBasicMaterial({ opacity: 0, transparent: true }),
    );
    this.scene.add(phantom);

    //
    const g1 = new Group();
    g1.add(new Mesh(new CubeGeometry(), new MeshBasicMaterial({ color: palette.brand3 })));
    g1.add(
      new LineSegments(
        new CubeEdgesGeometry(Neighbor.py | Neighbor.pz | Neighbor.nz),
        new LineBasicMaterial({ color: palette.shade8 }),
      ),
    );
    this.scene.add(g1);

    const g2 = new Group();
    g2.add(new Mesh(new CubeGeometry(), new MeshBasicMaterial({ color: palette.brand3 })));
    g2.add(
      new LineSegments(
        new CubeEdgesGeometry(Neighbor.ny),
        new LineBasicMaterial({ color: palette.shade8 }),
      ),
    );
    g2.translateY(1);
    this.scene.add(g2);

    const g3 = new Group();
    g3.add(new Mesh(new CubeGeometry(), new MeshBasicMaterial({ color: palette.brand3 })));
    g3.add(
      new LineSegments(
        new CubeEdgesGeometry(Neighbor.nz),
        new LineBasicMaterial({ color: palette.shade8 }),
      ),
    );
    g3.translateZ(1);
    this.scene.add(g3);

    const g4 = new Group();
    g4.add(new Mesh(new CubeGeometry(), new MeshBasicMaterial({ color: palette.brand3 })));
    g4.add(
      new LineSegments(
        new CubeEdgesGeometry(Neighbor.pz),
        new LineBasicMaterial({ color: palette.shade8 }),
      ),
    );
    g4.translateZ(-1);
    this.scene.add(g4);

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
