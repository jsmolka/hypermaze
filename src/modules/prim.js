import { Generator } from '@/modules/generator';
import { neighbor } from '@/modules/neighbor';
import { popAt } from '@/utils/array';
import { randomInt, shuffle } from '@/utils/random';

const directions = [
  (x, y, z) => [x + 1, y, z, neighbor.px, neighbor.nx],
  (x, y, z) => [x - 1, y, z, neighbor.nx, neighbor.px],
  (x, y, z) => [x, y + 1, z, neighbor.py, neighbor.ny],
  (x, y, z) => [x, y - 1, z, neighbor.ny, neighbor.py],
  (x, y, z) => [x, y, z + 1, neighbor.pz, neighbor.nz],
  (x, y, z) => [x, y, z - 1, neighbor.nz, neighbor.pz],
];

const origin = 1 << 6;
const marked = 1 << 7;

export class Prim extends Generator {
  constructor(maze) {
    super(maze);
    const x = randomInt(maze.size);
    const y = randomInt(maze.size);
    const z = randomInt(maze.size);
    this.maze.set(x, y, z, origin);
    this.frontier = [];
    this.expand(x, y, z);
  }

  expand(x, y, z) {
    for (const direction of directions) {
      const [dx, dy, dz] = direction(x, y, z);
      if (this.maze.outOfBounds(dx, dy, dz)) {
        continue;
      }

      const j = this.maze.index(dx, dy, dz);
      if (this.maze[j] !== 0) {
        continue;
      }

      this.frontier.push([dx, dy, dz]);
      this.maze[j] = marked;
    }
  }

  step() {
    const [x, y, z] = popAt(this.frontier, randomInt(this.frontier.length));

    shuffle(directions);
    for (const direction of directions) {
      const [dx, dy, dz, pn, nn] = direction(x, y, z);
      if (this.maze.outOfBounds(dx, dy, dz)) {
        continue;
      }

      const j = this.maze.index(dx, dy, dz);
      if (this.maze[j] === 0 || this.maze[j] === marked) {
        continue;
      }

      const i = this.maze.index(x, y, z);
      this.maze[i] |= pn;
      this.maze[j] |= nn;
      break;
    }

    this.expand(x, y, z);

    return this.frontier.length > 0;
  }
}
