export class Maze {
  static Wall = 0;
  static Path = 1;

  constructor() {
    this.resize(100);
  }

  resize(size, value = Maze.Wall) {
    const iterable = { length: 2 * size + 1 };
    this.data = Array.from(iterable, () =>
      Array.from(iterable, () => Array.from(iterable, () => value)),
    );
  }
}
