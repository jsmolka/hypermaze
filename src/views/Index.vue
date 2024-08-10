<template>
  <div class="fixed top-2 left-2 flex gap-2 p-2 bg-shade-8 border rounded-sm">
    <Button size="icon" title="Reset camera" variant="ghost" @click="reset">
      <CubeIcon />
    </Button>
    <Button
      :class="{ '!bg-shade-6': settings.animate }"
      size="icon"
      title="Animate"
      variant="ghost"
      @click="settings.animate = !settings.animate"
    >
      <PlayIcon />
    </Button>
    <InputNumber class="max-w-12" v-model="settings.size" :min="1" :max="250" />
  </div>
  <div ref="container" class="h-full" />
</template>

<script setup>
import { Button } from '@/components/ui/button';
import { InputNumber } from '@/components/ui/input';
import { CubeEdgesGeometry } from '@/graphic/cubeEdgesGeometry';
import { CubeGeometry } from '@/graphic/cubeGeometry';
import { dispose } from '@/graphic/dispose';
import { Graphic } from '@/graphic/graphic';
import { InstancedPositionLineSegments } from '@/graphic/instancedPositionLineSegments';
import { InstancedPositionMesh } from '@/graphic/instancedPositionMesh';
import { Maze } from '@/modules/maze';
import { neighbor } from '@/modules/neighbor';
import { RecursiveBacktracking } from '@/modules/recursiveBacktracking';
import { useSettingsStore } from '@/stores/settings';
import { colors } from '@/utils/colors';
import { CubeIcon, PlayIcon } from '@radix-icons/vue';
import { useResizeObserver } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { Group, LineBasicMaterial, Mesh, MeshBasicMaterial } from 'three';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const { settings } = storeToRefs(useSettingsStore());

const container = ref();

const xAxis = neighbor.px | neighbor.nx;
const yAxis = neighbor.py | neighbor.ny;
const zAxis = neighbor.pz | neighbor.nz;

let maze = null;
const initMaze = () => {
  maze = new Maze(settings.value.size);
};

let generator = null;
const initGenerator = () => {
  generator = new RecursiveBacktracking(maze);
  if (!settings.value.animate) {
    generator.build();
  }
};

class MazeGraphic extends Graphic {
  constructor(container, options = {}) {
    super(container, options);
    this.setup();

    this.edgesPositions = Array.from(Array(1 << 6), () => []);
  }

  setup() {
    dispose(this.scene);

    this.group = new Group();
    this.group.translateX(-maze.dimensions / 2 + 1 / 2);
    this.group.translateY(-maze.dimensions / 2 + 1 / 2);
    this.group.translateZ(-maze.dimensions / 2 + 1 / 2);
    this.scene.add(this.group);

    this.cubes = new InstancedPositionMesh(
      new CubeGeometry(),
      new MeshBasicMaterial({ color: colors.brand3.int }),
      maze.elements + maze.connectors,
    );
    this.cubes.frustumCulled = false;
    this.group.add(this.cubes);

    this.edges = new Group();
    this.group.add(this.edges);

    const bbox = new Mesh(
      new CubeGeometry(maze.dimensions),
      new MeshBasicMaterial({ opacity: 0, transparent: true }),
    );
    this.scene.add(bbox);
  }

  paint() {
    for (const positions of this.edgesPositions) {
      positions.length = 0;
    }

    let i = 0;
    let count = 0;
    for (let z = 0; z < maze.dimensions; z += 2) {
      for (let y = 0; y < maze.dimensions; y += 2) {
        for (let x = 0; x < maze.dimensions; x += 2) {
          const neighbors = maze[i++];
          if (neighbors === 0) {
            continue;
          }

          this.cubes.setPositionAt(count++, x, y, z);
          this.edgesPositions[neighbors].push(x, y, z);

          if (neighbors & neighbor.px) {
            this.cubes.setPositionAt(count++, x + 1, y, z);
            this.edgesPositions[xAxis].push(x + 1, y, z);
          }
          if (neighbors & neighbor.py) {
            this.cubes.setPositionAt(count++, x, y + 1, z);
            this.edgesPositions[yAxis].push(x, y + 1, z);
          }
          if (neighbors & neighbor.pz) {
            this.cubes.setPositionAt(count++, x, y, z + 1);
            this.edgesPositions[zAxis].push(x, y, z + 1);
          }
        }
      }
    }
    this.cubes.count = count;
    this.cubes.positionAttribute.needsUpdate = true;

    dispose(this.edges);
    for (const [neighborMask, positions] of this.edgesPositions.entries()) {
      if (positions.length === 0) {
        continue;
      }

      const edges = new InstancedPositionLineSegments(
        new CubeEdgesGeometry(neighborMask),
        new LineBasicMaterial({ color: colors.shade8.int }),
        positions.length / 3,
      );
      edges.frustumCulled = false;
      edges.positionAttribute.copyArray(positions);
      this.edges.add(edges);
    }

    this.render();
  }
}

let graphic = null;
let stepRaf = null;

const reset = () => {
  graphic.resetCamera();
  graphic.fitAndCenter();
};

onMounted(() => {
  initMaze();
  initGenerator();

  graphic = new MazeGraphic(container.value);
  graphic.paint();
  graphic.fitAndCenter();

  useResizeObserver(container, ([entry]) => {
    graphic.resize(entry.contentRect);
  });

  watch(
    () => settings.value.size,
    () => {
      initMaze();
      initGenerator();

      graphic.setup();
      graphic.paint();
      graphic.fitAndCenter();
    },
  );

  watch(
    () => settings.value.animate,
    () => {
      initMaze();
      initGenerator();

      graphic.setup();
      graphic.paint();
      graphic.fitAndCenter();
    },
  );

  const animate = () => {
    if (settings.value.animate) {
      generator.step();

      graphic.paint();
    }
    stepRaf = window.requestAnimationFrame(animate);
  };
  animate();
});

onBeforeUnmount(() => {
  window.cancelAnimationFrame(stepRaf);

  graphic.dispose();
  graphic = null;
});
</script>
