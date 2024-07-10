export class Maze {
  constructor(size) {
    this.data = new Uint8Array(size ** 3);
    this.size = size;
    this.stride = {
      x: 1,
      y: size,
      z: size ** 2,
    };
  }

  index(x, y, z) {
    return x + this.stride.y * y + this.stride.z * z;
  }
}
