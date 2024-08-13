import { Generator } from '@/modules/generator';
import { neighbor } from '@/modules/neighbor';
import { shuffle } from '@/utils/random';

class Edges {
  constructor(size) {
    if (size ** 3 > 0x3fff_ffff) {
      throw 'Data structure expects two unused bits';
    }
    this.array = new Uint32Array(3 * (size - 1) * size ** 2);
    this.index = 0;
  }

  push(index, dimension) {
    if (import.meta.env.DEV) {
      console.assert(index <= 0x3fff_ffff);
      console.assert(dimension <= 0x0000_0003);
    }
    this.array[this.index++] = (dimension << 30) | index;
  }

  pop() {
    const edge = this.array[--this.index];
    return [edge & 0x3fff_ffff, edge >>> 30];
  }

  get length() {
    return this.index;
  }
}

export class Kruskal extends Generator {
  constructor(maze) {
    super(maze);
    this.sets = Array.from(Array(maze.length), (_, index) => [index]);

    this.edges = new Edges(maze.size);
    let i = 0;
    for (let z = 0; z < maze.size; z++) {
      for (let y = 0; y < maze.size; y++) {
        for (let x = 0; x < maze.size; x++) {
          if (x + 1 < maze.size) this.edges.push(i, 0);
          if (y + 1 < maze.size) this.edges.push(i, 1);
          if (z + 1 < maze.size) this.edges.push(i, 2);
          i++;
        }
      }
    }
    shuffle(this.edges.array);
  }

  step() {
    while (this.edges.length > 0) {
      const [i, dim] = this.edges.pop();
      const j = i + this.maze.strides[dim];
      let set1 = this.sets[i];
      let set2 = this.sets[j];
      if (set1 !== set2) {
        if (set2.length > set1.length) {
          [set1, set2] = [set2, set1];
        }

        for (const index of set2) {
          set1.push(index);
          this.sets[index] = set1;
        }

        this.maze[i] |= neighbor.px << dim;
        this.maze[j] |= neighbor.nx << dim;
        break;
      }
    }
    return this.edges.length > 0;
  }
}
