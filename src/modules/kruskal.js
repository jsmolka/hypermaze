import { Generator } from '@/modules/generator';
import { neighbor } from '@/modules/neighbor';
import { shuffle } from '@/utils/random';

const directions = [
  (x, y, z) => [x + 1, y, z, neighbor.px, neighbor.nx],
  (x, y, z) => [x, y + 1, z, neighbor.py, neighbor.ny],
  (x, y, z) => [x, y, z + 1, neighbor.pz, neighbor.nz],
];

export class Kruskal extends Generator {
  constructor(maze) {
    super(maze);
    this.sets = Array.from(Array(maze.length), (_, index) => [index]);

    this.edges = [];
    for (let z = 0; z < maze.size; z++) {
      for (let y = 0; y < maze.size; y++) {
        for (let x = 0; x < maze.size; x++) {
          if (x + 1 < maze.size) this.edges.push([x, y, z, 0]);
          if (y + 1 < maze.size) this.edges.push([x, y, z, 1]);
          if (z + 1 < maze.size) this.edges.push([x, y, z, 2]);
        }
      }
    }
    shuffle(this.edges);
  }

  step() {
    while (this.edges.length > 0) {
      const [x1, y1, z1, direction] = this.edges.pop();
      const [x2, y2, z2, pn, nn] = directions[direction](x1, y1, z1);
      const i = this.maze.index(x1, y1, z1);
      const j = this.maze.index(x2, y2, z2);
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
        this.maze[i] |= pn;
        this.maze[j] |= nn;
        break;
      }
    }
    return this.edges.length > 0;
  }
}
