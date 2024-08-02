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
import { InstancedPositionLineSegments } from '@/graphic/instancedPositionLineSegments';
import { InstancedPositionMesh } from '@/graphic/instancedPositionMesh';
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

    const xAxis = neighbor.px | neighbor.nx;
    const yAxis = neighbor.py | neighbor.ny;
    const zAxis = neighbor.pz | neighbor.nz;

    const edgesPositions = Array.from(Array(1 << 6), () => []);

    let i = 0;
    let count = 0;
    for (let z = 0; z < maze.size; z++) {
      for (let y = 0; y < maze.size; y++) {
        for (let x = 0; x < maze.size; x++) {
          const neighbors = maze[i++];
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
    this.cubes.positionAttribute.needsUpdate = true;

    dispose(this.edges);

    for (const [neighborMask, positions] of edgesPositions.entries()) {
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
