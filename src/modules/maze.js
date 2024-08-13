export class Maze extends Uint8Array {
  constructor(size) {
    super(size ** 3);
    this.size = size;
    this.strides = [1, this.size, this.size ** 2];
  }

  get elements() {
    return this.length;
  }

  get connectors() {
    return this.length - 1;
  }

  get dimensions() {
    return 2 * this.size - 1;
  }

  outOfBounds(x, y, z) {
    return x < 0 || x >= this.size || y < 0 || y >= this.size || z < 0 || z >= this.size;
  }

  index(x, y, z) {
    return x + this.size * y + this.size ** 2 * z;
  }

  get(x, y, z) {
    return this[this.index(x, y, z)];
  }

  set(x, y, z, value) {
    this[this.index(x, y, z)] = value;
  }
}
