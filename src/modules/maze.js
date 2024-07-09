import { randomInt, shuffle } from '@/utils/random';

const neighbor = Object.freeze({
  px: 1 << 0,
  nx: 1 << 1,
  py: 1 << 2,
  ny: 1 << 3,
  pz: 1 << 4,
  nz: 1 << 5,
});

export class Maze {
  constructor(size) {
    this.data = new Uint8Array(size ** 3);
    this.size = size;
    this.stride = {
      x: 1,
      y: size,
      z: size ** 2,
    };

    this.directions = [
      (x, y, z) => [x + 1, y, z, neighbor.px, neighbor.nx],
      (x, y, z) => [x - 1, y, z, neighbor.nx, neighbor.px],
      (x, y, z) => [x, y + 1, z, neighbor.py, neighbor.ny],
      (x, y, z) => [x, y - 1, z, neighbor.ny, neighbor.py],
      (x, y, z) => [x, y, z + 1, neighbor.pz, neighbor.nz],
      (x, y, z) => [x, y, z - 1, neighbor.nz, neighbor.pz],
    ];

    this.create();
  }

  index(x, y, z) {
    return x + this.stride.y * y + this.stride.z * z;
  }

  create() {
    if (this.size <= 1) {
      return;
    }

    let x = randomInt(this.size);
    let y = randomInt(this.size);
    let z = randomInt(this.size);

    const stack = [];
    while (x != null) {
      while (x != null) {
        stack.push([x, y, z]);
        [x, y, z] = this.walk(x, y, z);
      }
      [x, y, z] = this.backtrack(stack);
    }
  }

  walk(cx, cy, cz) {
    shuffle(this.directions);
    for (const direction of this.directions) {
      const [nx, ny, nz, np, nn] = direction(cx, cy, cz);
      if (nx < 0 || nx >= this.size) continue;
      if (ny < 0 || ny >= this.size) continue;
      if (nz < 0 || nz >= this.size) continue;

      const ni = this.index(nx, ny, nz);
      if (this.data[ni] === 0) {
        const ci = this.index(cx, cy, cz);
        this.data[ci] |= np;
        this.data[ni] |= nn;
        return [nx, ny, nz];
      }
    }
    return [null, null, null];
  }

  backtrack(stack) {
    while (stack.length > 0) {
      const [cx, cy, cz] = stack.pop();
      for (const direction of this.directions) {
        const [nx, ny, nz, ..._] = direction(cx, cy, cz);
        if (nx < 0 || nx >= this.size) continue;
        if (ny < 0 || ny >= this.size) continue;
        if (nz < 0 || nz >= this.size) continue;
        if (this.data[this.index(nx, ny, nz)] === 0) {
          return [cx, cy, cz];
        }
      }
    }
    return [null, null, null];
  }
}
