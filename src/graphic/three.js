import CameraControls from 'camera-controls';
import * as THREE from 'three';

CameraControls.install({ THREE });

export { CameraViewBox } from '@/graphic/cameraViewBox';
export * from 'three';
export { Interaction } from 'three.interaction/src/index';
export { CameraControls };

export function vec3(x = 0, y = 0, z = 0) {
  return new THREE.Vector3(x, y, z);
}

export function dispose(object) {
  object.traverse((object) => {
    object.geometry?.dispose();
    object.material?.dispose();
    object.texture?.dispose();
    object.clear?.();
    object.dispose?.();
  });
}
