import { InstancedMesh as InstancedMeshBase, Matrix4 } from 'three';

const positionMatrix = new Matrix4();

export class InstancedMesh extends InstancedMeshBase {
  setPositionAt(index, x, y, z) {
    this.setMatrixAt(index, positionMatrix.setPosition(x, y, z));
  }
}
