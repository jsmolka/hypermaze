import { Generator } from '@/modules/generator';
import { neighbor } from '@/modules/neighbor';
import { shuffle } from '@/utils/random';

const directions = [
  [neighbor.px, neighbor.nx],
  [neighbor.py, neighbor.ny],
  [neighbor.pz, neighbor.nz],
];

export class Kruskal extends Generator {
  constructor(maze) {
    super(maze);
    this.sets = Array.from(Array(maze.length), (_, index) => [index]);

    this.edges = [];
    let i = 0;
    for (let z = 0; z < maze.size; z++) {
      for (let y = 0; y < maze.size; y++) {
        for (let x = 0; x < maze.size; x++) {
          if (x + 1 < maze.size) this.edges.push([i, 0]);
          if (y + 1 < maze.size) this.edges.push([i, 1]);
          if (z + 1 < maze.size) this.edges.push([i, 2]);
          i++;
        }
      }
    }
    shuffle(this.edges);
  }

  step() {
    while (this.edges.length > 0) {
      const [i, direction] = this.edges.pop();
      const j = i + this.maze.strides[direction];
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

        const [pn, nn] = directions[direction];

        this.maze[i] |= pn;
        this.maze[j] |= nn;
        break;
      }
    }
    return this.edges.length > 0;
  }
}
