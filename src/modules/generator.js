export class Generator {
  constructor(maze) {
    this.maze = maze;
  }

  /**
   * @abstract
   * @return {boolean}
   */
  step() {}

  build() {
    while (this.step());
  }
}
