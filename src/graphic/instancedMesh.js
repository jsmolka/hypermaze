import { instancedMixin } from '@/graphic/instancedMixin';
import { InstancedMesh as InstancedMeshBase, Matrix4 } from 'three';

export class InstancedMesh extends InstancedMeshBase {
  constructor(geometry, material, count) {
    super(geometry, material, count);
    Object.assign(this, instancedMixin);
  }

  get matrixAttribute() {
    return this.instanceMatrix;
  }

  getMatrixAt(index, matrix = new Matrix4()) {
    super.getMatrixAt(index, matrix);
    return matrix;
  }
}
