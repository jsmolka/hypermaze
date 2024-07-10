export class Maze extends Uint8Array {
  constructor(size) {
    super(size ** 3);
    this.size = size;
  }

  get elements() {
    return 2 * this.length - 1;
  }

  get elementDims() {
    return 2 * this.size - 1;
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
