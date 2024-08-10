<template>
  <Form class="fixed top-4 left-4 p-3 bg-shade-8 border rounded-sm">
    <Button
      variant="secondary"
      @click="
        graphic.resetCamera();
        graphic.fitAndCenter();
      "
      >Reset camera</Button
    >
    <FormItem>
      <Label>Size</Label>
      <InputNumber v-model="settings.size" :min="1" :max="1000" />
    </FormItem>
    <FormItem>
      <Label>Animate</Label>
      <Switch v-model="settings.animate" />
    </FormItem>
  </Form>
  <div ref="container" class="h-full" />
</template>

<script setup>
import { Button } from '@/components/ui/button';
import { Form, FormItem } from '@/components/ui/form';
import { InputNumber } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CubeEdgesGeometry } from '@/graphic/cubeEdgesGeometry';
import { CubeGeometry } from '@/graphic/cubeGeometry';
import { dispose } from '@/graphic/dispose';
import { Graphic } from '@/graphic/graphic';
import { InstancedMesh } from '@/graphic/instancedMesh';
import { InstancedPositionLineSegments } from '@/graphic/instancedPositionLineSegments';
import { Maze } from '@/modules/maze';
import { neighbor } from '@/modules/neighbor';
import { RecursiveBacktracking } from '@/modules/recursiveBacktracking';
import { useSettingsStore } from '@/stores/settings';
import { colors } from '@/utils/colors';
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

    this.cubes = new InstancedMesh(
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
    console.time('paint');

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
    this.cubes.matrixAttribute.needsUpdate = true;

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

    console.timeEnd('paint');
  }
}

let graphic = null;
let stepRaf = null;

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

  const step = () => {
    if (settings.value.animate) {
      generator.step();

      graphic.paint();
    }
    stepRaf = window.requestAnimationFrame(step);
  };
  stepRaf = window.requestAnimationFrame(step);
});

onBeforeUnmount(() => {
  window.cancelAnimationFrame(stepRaf);

  graphic.dispose();
  graphic = null;
});
</script>
