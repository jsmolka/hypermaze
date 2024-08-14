<template>
  <div class="fixed top-2 left-2 flex gap-2 p-2 bg-shade-8 border rounded-sm">
    <Button size="icon" title="Reset view" variant="ghost" @click="resetView">
      <CubeIcon />
    </Button>
    <Button size="icon" title="Repaint" variant="ghost" @click="repaint">
      <ReloadIcon />
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
    <Select class="w-fit" v-model="settings.algorithm" :items="Settings.Algorithm.$values">
      <template #item="{ item }">
        <SelectItemText>{{ Settings.Algorithm.$translate(item) }}</SelectItemText>
      </template>
    </Select>
    <InputNumber class="w-12" v-model="settings.size" :min="2" :max="250" />
  </div>
  <div ref="container" class="h-full" />
</template>

<script setup>
import { Button } from '@/components/ui/button';
import { InputNumber } from '@/components/ui/input';
import { Select, SelectItemText } from '@/components/ui/select';
import { CubeEdgesGeometry } from '@/graphic/cubeEdgesGeometry';
import { CubeGeometry } from '@/graphic/cubeGeometry';
import { dispose } from '@/graphic/dispose';
import { Graphic } from '@/graphic/graphic';
import { InstancedPositionLineSegments } from '@/graphic/instancedPositionLineSegments';
import { InstancedPositionMesh } from '@/graphic/instancedPositionMesh';
import { Kruskal } from '@/modules/kruskal';
import { Maze } from '@/modules/maze';
import { neighbor } from '@/modules/neighbor';
import { Prim } from '@/modules/prim';
import { RecursiveBacktracking } from '@/modules/recursiveBacktracking';
import { Settings } from '@/modules/settings';
import { useSettingsStore } from '@/stores/settings';
import { colors } from '@/utils/colors';
import { CubeIcon, PlayIcon, ReloadIcon } from '@radix-icons/vue';
import { useResizeObserver } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { Group, LineBasicMaterial, Mesh, MeshBasicMaterial } from 'three';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const { settings } = storeToRefs(useSettingsStore());

class MazeGraphic extends Graphic {
  constructor(container, options = {}) {
    super(container, options);
    this.initMaze();
    this.initObjects();
  }

  initMaze() {
    this.maze = new Maze(settings.value.size);
    switch (settings.value.algorithm) {
      case Settings.Algorithm.recursiveBacktracking:
        this.mazeGenerator = new RecursiveBacktracking(this.maze);
        break;
      case Settings.Algorithm.prim:
        this.mazeGenerator = new Prim(this.maze);
        break;
      case Settings.Algorithm.kruskal:
        this.mazeGenerator = new Kruskal(this.maze);
        break;
    }

    window.cancelAnimationFrame(this.stepRaf);
    if (settings.value.animate) {
      const step = () => {
        if (this.mazeGenerator.step()) {
          this.stepRaf = window.requestAnimationFrame(step);
        }
        this.paint();
      };
      this.stepRaf = window.requestAnimationFrame(step);
    } else {
      this.mazeGenerator.build();
    }
  }

  initObjects() {
    dispose(this.scene);

    const group = new Group();
    group.translateX(-this.maze.dimensions / 2 + 1 / 2);
    group.translateY(-this.maze.dimensions / 2 + 1 / 2);
    group.translateZ(-this.maze.dimensions / 2 + 1 / 2);
    this.scene.add(group);

    this.cubes = new InstancedPositionMesh(
      new CubeGeometry(),
      new MeshBasicMaterial({ color: colors.brand3.int }),
      this.maze.elements + this.maze.connectors,
    );
    this.cubes.frustumCulled = false;
    group.add(this.cubes);

    this.edges = new Group();
    this.edgesPositions = Array.from(Array(1 << 6), () => []);
    group.add(this.edges);

    const bbox = new Mesh(
      new CubeGeometry(this.maze.dimensions),
      new MeshBasicMaterial({ opacity: 0, transparent: true }),
    );
    this.scene.add(bbox);
  }

  dispose() {
    window.cancelAnimationFrame(this.stepRaf);
    super.dispose();
  }

  paint() {
    const xAxis = neighbor.px | neighbor.nx;
    const yAxis = neighbor.py | neighbor.ny;
    const zAxis = neighbor.pz | neighbor.nz;

    for (const positions of this.edgesPositions) {
      positions.length = 0;
    }

    let i = 0;
    let count = 0;
    for (let z = 0; z < this.maze.dimensions; z += 2) {
      for (let y = 0; y < this.maze.dimensions; y += 2) {
        for (let x = 0; x < this.maze.dimensions; x += 2) {
          const neighbors = this.maze[i++] & 0x3f;
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
    for (const [neighbors, positions] of this.edgesPositions.entries()) {
      if (positions.length === 0) {
        continue;
      }

      const edges = new InstancedPositionLineSegments(
        new CubeEdgesGeometry(neighbors),
        new LineBasicMaterial({ color: colors.shade8.int }),
        positions.length / 3,
      );
      edges.positionAttribute.copyArray(positions);
      edges.frustumCulled = false;
      this.edges.add(edges);
    }

    this.forceRender();
  }
}

let graphic = null;

const container = ref();

onMounted(() => {
  graphic = new MazeGraphic(container.value);
  graphic.paint();
  graphic.fitAndCenter();

  useResizeObserver(container, ([entry]) => {
    graphic.resize(entry.contentRect);
  });

  watch(
    () => settings.value.size,
    () => {
      graphic.initMaze();
      graphic.initObjects();
      graphic.paint();
      graphic.fitAndCenter();
    },
  );

  watch(
    () => [settings.value.animate, settings.value.algorithm],
    () => {
      graphic.initMaze();
      graphic.paint();
      graphic.fitAndCenter();
    },
  );
});

onBeforeUnmount(() => {
  graphic.dispose();
  graphic = null;
});

const resetView = () => {
  graphic.resetCamera();
  graphic.fitAndCenter();
};

const repaint = () => {
  graphic.initMaze();
  graphic.paint();
};
</script>
