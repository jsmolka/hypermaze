<template>
  <div ref="container" class="h-full" />
</template>

<script setup>
import { Graphic } from '@/graphic/graphic';
import { palette } from '@/graphic/palette';
import * as THREE from '@/graphic/three';
import { useResizeObserver } from '@vueuse/core';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const container = ref();

class MazeGraphic extends Graphic {
  paint() {
    THREE.dispose(this.scene);

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(100, 100, 100),
      new THREE.MeshBasicMaterial({ color: palette.brand3 }),
    );
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(cube.geometry),
      new THREE.LineBasicMaterial({ color: palette.shade8 }),
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
