<template>
  <div ref="container" class="h-full" />
</template>

<script setup>
import { dispose } from '@/graphic/dispose';
import { Graphic } from '@/graphic/graphic';
import { palette } from '@/graphic/palette';
import { useResizeObserver } from '@vueuse/core';
import { BoxGeometry, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial } from 'three';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const container = ref();

// https://discourse.threejs.org/t/use-edgesgeometry-in-an-instancedmesh/16723

class MazeGraphic extends Graphic {
  paint() {
    dispose(this.scene);

    const size = 4;
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
