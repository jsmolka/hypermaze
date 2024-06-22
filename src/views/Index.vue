<template>
  <div ref="container" class="h-full" />
</template>

<script setup>
import { dispose } from '@/graphic/dispose';
import { Graphic } from '@/graphic/graphic';
import { palette } from '@/graphic/palette';
import { useResizeObserver } from '@vueuse/core';
import {
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const container = ref();

class MazeGraphic extends Graphic {
  paint() {
    dispose(this.scene);

    const cube = new Mesh(
      new BoxGeometry(100, 100, 100),
      new MeshBasicMaterial({ color: palette.brand3 }),
    );
    const edge = new LineSegments(
      new EdgesGeometry(cube.geometry),
      new LineBasicMaterial({ color: palette.shade8 }),
    );
    this.scene.add(cube);
    this.scene.add(edge);

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
