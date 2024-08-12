import { Generator } from '@/modules/generator';
import { neighbor } from '@/modules/neighbor';
import { shuffle } from '@/utils/random';

class Tree {
  constructor() {
    this.parent = null;
  }

  get root() {
    return this.parent?.root ?? this;
  }

  isConnected(other) {
    return this.root === other.root;
  }

  connect(other) {
    other.root.parent = this;
  }
}

export class Kruskal extends Generator {
  constructor(maze) {
    super(maze);
    this.sets = Array.from(Array(maze.length), () => new Tree());
    this.edges = [];
    for (let z = 0; z < maze.size; z++) {
      for (let y = 0; y < maze.size; y++) {
        for (let x = 0; x < maze.size; x++) {
          if (x + 1 < maze.size) {
            this.edges.push([x, y, z, x + 1, y, z, neighbor.px, neighbor.nx]);
          }
          if (y + 1 < maze.size) {
            this.edges.push([x, y, z, x, y + 1, z, neighbor.py, neighbor.ny]);
          }
          if (z + 1 < maze.size) {
            this.edges.push([x, y, z, x, y, z + 1, neighbor.pz, neighbor.nz]);
          }
        }
      }
    }
    shuffle(this.edges);
  }

  step() {
    while (this.edges.length > 0) {
      const [x1, y1, z1, x2, y2, z2, pn, nn] = this.edges.pop();
      const i = this.maze.index(x1, y1, z1);
      const j = this.maze.index(x2, y2, z2);
      const set1 = this.sets[i];
      const set2 = this.sets[j];
      if (!set1.isConnected(set2)) {
        set1.connect(set2);
        this.maze[i] |= pn;
        this.maze[j] |= nn;
        break;
      }
    }
    return this.edges.length > 0;
  }
}
