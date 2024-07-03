import { randomInt, shuffle } from '@/utils/random';

const dirOne = [
  (x, y, z) => [x + 1, y, z],
  (x, y, z) => [x - 1, y, z],
  (x, y, z) => [x, y + 1, z],
  (x, y, z) => [x, y - 1, z],
  (x, y, z) => [x, y, z + 1],
  (x, y, z) => [x, y, z - 1],
];

const dirTwo = [
  (x, y, z) => [x + 2, y, z],
  (x, y, z) => [x - 2, y, z],
  (x, y, z) => [x, y + 2, z],
  (x, y, z) => [x, y - 2, z],
  (x, y, z) => [x, y, z + 2],
  (x, y, z) => [x, y, z - 2],
];

const indices = [0, 1, 2, 3, 4, 5];

export class Maze {
  static Wall = 0;
  static Path = 1;

  constructor(size = 100) {
    this.resize(size);
    this.create();
  }

  get length() {
    return this.data.length;
  }

  resize(size, value = Maze.Wall) {
    this.size = size;
    const iterable = { length: 2 * size - 1 };
    this.data = Array.from(iterable, () =>
      Array.from(iterable, () => Array.from(iterable, () => value)),
    );
  }

  get(x, y, z) {
    const length = this.data.length;
    return x >= 0 && x < length && y >= 0 && y < length && z >= 0 && z < length
      ? this.data[x][y][z]
      : undefined;
  }

  set(x, y, z, value) {
    const length = this.data.length;
    if (x >= 0 && x < length && y >= 0 && y < length && z >= 0 && z < length) {
      this.data[x][y][z] = value;
    }
  }

  walk(x, y, z) {
    shuffle(indices);
    for (const index of indices) {
      const [x2, y2, z2] = dirTwo[index](x, y, z);
      if (this.get(x2, y2, z2) === Maze.Wall) {
        const [x1, y1, z1] = dirOne[index](x, y, z);
        this.set(x1, y1, z1, Maze.Path);
        this.set(x2, y2, z2, Maze.Path);
        return [x2, y2, z2];
      }
    }
    return [null, null, null];
  }

  backtrack(stack) {
    while (stack.length > 0) {
      const [x, y, z] = stack.pop();
      for (const direction of dirTwo) {
        const [x2, y2, z2] = direction(x, y, z);
        if (this.get(x2, y2, z2) === Maze.Wall) {
          return [x, y, z];
        }
      }
    }
    return [null, null, null];
  }

  create() {
    let x = 2 * randomInt(this.size);
    let y = 2 * randomInt(this.size);
    let z = 2 * randomInt(this.size);
    this.set(x, y, z, Maze.Path);

    const stack = [];
    while (x != null && y != null && z != null) {
      while (x != null && y != null && z != null) {
        stack.push([x, y, z]);
        [x, y, z] = this.walk(x, y, z);
      }
      [x, y, z] = this.backtrack(stack);
    }
  }
}
