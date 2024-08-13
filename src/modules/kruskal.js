import { Generator } from '@/modules/generator';
import { neighbor } from '@/modules/neighbor';
import { shuffle } from '@/utils/random';

class Edges {
  constructor(size) {}
}

export class Kruskal extends Generator {
  constructor(maze) {
    super(maze);
    this.sets = Array.from(Array(maze.length), (_, index) => [index]);

    this.edges = [];
    let i = 0;
    for (let z = 0; z < maze.size; z++) {
      for (let y = 0; y < maze.size; y++) {
        for (let x = 0; x < maze.size; x++) {
          if (x + 1 < maze.size) this.edges.push(i | (0 << 30));
          if (y + 1 < maze.size) this.edges.push(i | (1 << 30));
          if (z + 1 < maze.size) this.edges.push(i | (2 << 30));
          i++;
        }
      }
    }
    shuffle(this.edges);
  }

  step() {
    while (this.edges.length > 0) {
      const edge = this.edges.pop();
      const i = edge & 0x3fff_ffff;
      const d = edge >>> 30;
      const j = i + this.maze.strides[d];
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

        this.maze[i] |= neighbor.px << d;
        this.maze[j] |= neighbor.nx << d;
        break;
      }
    }
    return this.edges.length > 0;
  }
}
