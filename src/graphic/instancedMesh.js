import { InstancedMesh as InstancedMeshBase, Matrix4, Quaternion, Vector3 } from 'three';

const matrix4 = new Matrix4();

export class InstancedMesh extends InstancedMeshBase {
  getMatrixAt(index, matrix = new Matrix4()) {
    super.getMatrixAt(index, matrix);
    return matrix;
  }

  getPositionAt(index, position = new Vector3()) {
    return position.setFromMatrixPosition(this.getMatrixAt(index, matrix4));
  }

  setPositionAt(index, x, y, z) {
    this.setMatrixAt(index, this.getMatrixAt(index, matrix4).setPosition(x, y, z));
  }

  getScaleAt(index, scale = new Vector3()) {
    return scale.setFromMatrixScale(this.getMatrixAt(index, matrix4));
  }

  setScaleAt(index, x, y, z) {
    if (x instanceof Vector3) {
      const v = x;
      x = v.x;
      y = v.y;
      z = v.z;
    }
    this.setMatrixAt(index, this.getMatrixAt(index, matrix4).makeScale(x, y, z));
  }

  getRotationAt(index, quaternion = new Quaternion()) {
    return quaternion.setFromRotationMatrix(this.getMatrixAt(index, matrix4));
  }

  setRotationAt(index, x, y, z, w) {
    const q = x instanceof Quaternion ? x : new Quaternion(x, y, z, w);
    this.setMatrixAt(index, this.getMatrixAt(index, matrix4).makeRotationFromQuaternion(q));
  }
}
