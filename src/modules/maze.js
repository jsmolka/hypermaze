export class Maze extends Uint8Array {
  constructor(size) {
    super(size ** 3);
    this.size = size;
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
    if (x < 0 || x >= this.size) return true;
    if (y < 0 || y >= this.size) return true;
    if (z < 0 || z >= this.size) return true;
    return false;
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
