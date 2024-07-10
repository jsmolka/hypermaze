import { randomInt, shuffle } from '@/utils/random';

const neighbor = Object.freeze({
  px: 1 << 0,
  nx: 1 << 1,
  py: 1 << 2,
  ny: 1 << 3,
  pz: 1 << 4,
  nz: 1 << 5,
});

const directions = [
  (x, y, z) => [x + 1, y, z, neighbor.px, neighbor.nx],
  (x, y, z) => [x - 1, y, z, neighbor.nx, neighbor.px],
  (x, y, z) => [x, y + 1, z, neighbor.py, neighbor.ny],
  (x, y, z) => [x, y - 1, z, neighbor.ny, neighbor.py],
  (x, y, z) => [x, y, z + 1, neighbor.pz, neighbor.nz],
  (x, y, z) => [x, y, z - 1, neighbor.nz, neighbor.pz],
];

export class RecursiveBacktracking {
  constructor(maze) {
    this.maze = maze;
    this.x = randomInt(maze.size);
    this.y = randomInt(maze.size);
    this.z = randomInt(maze.size);
    this.stack = [[this.x, this.y, this.z]];
  }

  step() {
    loop: while (true) {
      shuffle(directions);
      for (const direction of directions) {
        const [x, y, z, p, n] = direction(this.x, this.y, this.z);
        if (x < 0 || x >= this.maze.size) continue;
        if (y < 0 || y >= this.maze.size) continue;
        if (z < 0 || z >= this.maze.size) continue;
        const j = this.maze.index(x, y, z);
        if (this.maze.data[j] === 0) {
          const i = this.maze.index(this.x, this.y, this.z);
          this.maze.data[i] |= p;
          this.maze.data[j] |= n;
          this.x = x;
          this.y = y;
          this.z = z;

          const coordinates = [x, y, z];
          this.stack.push(coordinates);
          return coordinates;
        }
      }

      while (this.stack.length > 0) {
        [this.x, this.y, this.z] = this.stack.pop();
        for (const direction of directions) {
          const [x, y, z] = direction(this.x, this.y, this.z);
          if (x < 0 || x >= this.maze.size) continue;
          if (y < 0 || y >= this.maze.size) continue;
          if (z < 0 || z >= this.maze.size) continue;
          const j = this.maze.index(x, y, z);
          if (this.maze.data[j] === 0) {
            continue loop;
          }
        }
      }
      return null;
    }
  }

  build() {
    while (this.step() != null);
  }
}
