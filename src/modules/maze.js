export class Maze {
  static Wall = 0;
  static Path = 1;

  constructor(size = 100) {
    this.resize(size);
  }

  resize(size, value = Maze.Wall) {
    const iterable = { length: size };
    this.data = Array.from(iterable, () =>
      Array.from(iterable, () => Array.from(iterable, () => value)),
    );
  }
}
