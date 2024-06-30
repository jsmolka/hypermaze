import { BoxGeometry } from 'three';

export class CubeGeometry extends BoxGeometry {
  constructor(size = 1) {
    super(size, size, size);
  }
}
