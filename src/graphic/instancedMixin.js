import { Matrix4, Quaternion, Vector3 } from 'three';

const matrix4 = new Matrix4();

export const instancedMixin = {
  getPositionAt(index, position = new Vector3()) {
    index *= 16;
    position.x = this.matrixAttribute.array[index + 12];
    position.y = this.matrixAttribute.array[index + 13];
    position.z = this.matrixAttribute.array[index + 14];
    return position;
  },

  setPositionAt(index, x, y, z) {
    index *= 16;
    this.matrixAttribute.array[index + 12] = x;
    this.matrixAttribute.array[index + 13] = y;
    this.matrixAttribute.array[index + 14] = z;
  },

  getScaleAt(index, scale = new Vector3()) {
    index *= 16;
    scale.x = this.matrixAttribute.array[index];
    scale.y = this.matrixAttribute.array[index + 5];
    scale.z = this.matrixAttribute.array[index + 10];
    return scale;
  },

  setScaleAt(index, x, y, z) {
    index *= 16;
    this.matrixAttribute.array[index] = x;
    this.matrixAttribute.array[index + 5] = y;
    this.matrixAttribute.array[index + 10] = z;
  },

  getRotationAt(index, quaternion = new Quaternion()) {
    return quaternion.setFromRotationMatrix(this.getMatrixAt(index, matrix4));
  },

  setRotationAt(index, x, y, z, w) {
    this.setMatrixAt(
      index,
      this.getMatrixAt(index, matrix4).makeRotationFromQuaternion(new Quaternion(x, y, z, w)),
    );
  },
};
