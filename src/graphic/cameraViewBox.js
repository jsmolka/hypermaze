// https://github.com/moroine/three.js/blob/CameraViewBox/examples/js/math/CameraViewBox.js

import * as THREE from '@/graphic/three';

export class CameraViewBox {
  constructor() {
    /**
     * Camera basis
     *   - x: horizontal pointing to right
     *   - y: vertical pointing to top
     *   - z: normal to camera plane pointing backward
     */
    this.viewBasis = {
      x: new THREE.Vector3(),
      y: new THREE.Vector3(),
      z: new THREE.Vector3(),
    };

    /**
     * Coefficient to scale the view box
     */
    this.fitRatio = 1;

    /**
     * Tangent of the camera vertical field of view angle
     */
    this.verticalTanFov = 0;
    /**
     * Tangent of the camera horizontal field of view angle
     */
    this.horizontalTanFov = 0;

    /**
     * Directional vectors that defines the view projection
     *    - top:
     *      - Colinear to the top plane camera viewing frustrum
     *      - Colinear to the plane defined by the normal viewBasis.x
     *      - Inverse way to viewBasis.z (viewBasis.z.dot(top) < 0)
     *    - bottom:
     *      - Colinear to the bottom plane camera viewing frustrum
     *      - Colinear to the plane defined by the normal viewBasis.x
     *      - Inverse way to viewBasis.z (viewBasis.z.dot(bottom) < 0)
     *    - left:
     *      - Colinear to the left plane camera viewing frustrum
     *      - Colinear to the plane defined by the normal viewBasis.y
     *      - Inverse way to viewBasis.z (viewBasis.z.dot(left) < 0)
     *    - right:
     *      - Colinear to the right plane camera viewing frustrum
     *      - Colinear to the plane defined by the normal viewBasis.y
     *      - Inverse way to viewBasis.z (viewBasis.z.dot(right) < 0)
     */
    this.viewProjection = {
      top: new THREE.Vector3(),
      left: new THREE.Vector3(),
      bottom: new THREE.Vector3(),
      right: new THREE.Vector3(),
    };

    this.bounds = {
      isEmpty: true,
      /**
       * Arbitrary point, basically the first point
       */
      anchor: new THREE.Vector3(),
      /**
       * Plane parallel to Camera plane passing by the anchor
       */
      plane: new THREE.Plane(),
      /**
       * Max distance from the anchor to any point intersecting the plane through viewProjection.top direction
       */
      top: -Infinity,
      /**
       * Min distance from the anchor to any point intersecting the plane through viewProjection.left direction
       */
      left: +Infinity,
      /**
       * Max distance from the anchor to any point intersecting the plane through viewProjection.bottom direction
       */
      bottom: +Infinity,
      /**
       * Max distance from the anchor to any point intersecting the plane through viewProjection.right direction
       */
      right: -Infinity,
    };
  }
}

Object.assign(CameraViewBox.prototype, {
  isCameraViewBox: true,

  setFitRatio: function (fitRatio) {
    this.fitRatio = fitRatio;

    return this;
  },

  setViewFromCamera: (function () {
    let x = new THREE.Vector3();
    let y = new THREE.Vector3();
    let z = new THREE.Vector3();

    return function (camera) {
      camera.updateMatrixWorld(true);

      camera.matrixWorld.extractBasis(x, y, z);

      return this.setViewFromBasis(x, y, z, camera.fov, camera.aspect);
    };
  })(),

  setViewFromBasis: (function () {
    let v = new THREE.Vector3();

    return function (x, y, z, fov, aspect) {
      let vFov = THREE.MathUtils.degToRad(fov);
      this.verticalTanFov = 2 * Math.tan(vFov / 2);

      let hFov = 2 * Math.atan((this.verticalTanFov / 2) * aspect);
      this.horizontalTanFov = 2 * Math.tan(hFov / 2);

      this.viewBasis.x.copy(x);
      this.viewBasis.y.copy(y);
      this.viewBasis.z.copy(z);

      this.viewProjection.top.set(0, 0, 0);
      this.viewProjection.bottom.set(0, 0, 0);
      this.viewProjection.left.set(0, 0, 0);
      this.viewProjection.right.set(0, 0, 0);

      v.copy(z).multiplyScalar(-Math.cos(vFov / 2));
      this.viewProjection.top.add(v);
      this.viewProjection.bottom.add(v);
      v.copy(y).multiplyScalar(Math.sin(vFov / 2));
      this.viewProjection.top.add(v);
      this.viewProjection.bottom.add(v.negate());

      v.copy(z).multiplyScalar(-Math.cos(hFov / 2));
      this.viewProjection.left.add(v);
      this.viewProjection.right.add(v);
      v.copy(x).multiplyScalar(Math.sin(hFov / 2));
      this.viewProjection.right.add(v);
      this.viewProjection.left.add(v.negate());

      return this;
    };
  })(),

  setFromObject: function (object) {
    this.makeEmpty();

    return this.expandByObject(object);
  },

  setFromObjects: function (objects) {
    this.makeEmpty();

    return this.expandByObjects(objects);
  },

  makeEmpty: function () {
    this.isEmpty = true;
    this.bounds.top = -Infinity;
    this.bounds.left = +Infinity;
    this.bounds.bottom = +Infinity;
    this.bounds.right = -Infinity;

    return this;
  },

  expandByObject: (function () {
    // Computes the world-axis-aligned bounding box of an object (including its children),
    // accounting for both the object's, and children's, world transforms

    let scope, i, l;

    let v1 = new THREE.Vector3();

    function traverse(node) {
      let geometry = node.geometry;

      if (geometry !== undefined) {
        if (geometry.isGeometry) {
          let vertices = geometry.vertices;

          for (i = 0, l = vertices.length; i < l; i++) {
            v1.copy(vertices[i]);
            v1.applyMatrix4(node.matrixWorld);

            scope.expandByPoint(v1);
          }
        } else if (geometry.isBufferGeometry) {
          let attribute = geometry.attributes.position;

          if (attribute !== undefined) {
            for (i = 0, l = attribute.count; i < l; i++) {
              v1.fromBufferAttribute(attribute, i).applyMatrix4(node.matrixWorld);

              scope.expandByPoint(v1);
            }
          }
        }
      }
    }

    return function expandByObject(object) {
      scope = this;

      object.updateMatrixWorld(true);

      object.traverse(traverse);

      return this;
    };
  })(),

  expandByObjects: function (objects) {
    for (let i = 0; i < objects.length; i++) {
      this.expandByObject(objects[i]);
    }

    return this;
  },

  expandByPoint: (function () {
    let ray = new THREE.Ray();
    let projectedPoint = new THREE.Vector3();
    let distance;

    return function (point) {
      if (this.isEmpty) {
        // If empty, then set the anchor and the plane

        this.bounds.anchor.copy(point);
        this.bounds.plane.setFromNormalAndCoplanarPoint(this.viewBasis.z, this.bounds.anchor);

        this.isEmpty = false;
      }

      ray.origin.copy(point);

      /*** TOP ***/
      ray.direction.copy(this.viewProjection.top);
      if (ray.intersectPlane(this.bounds.plane, projectedPoint) === null) {
        ray.direction.negate();
        ray.intersectPlane(this.bounds.plane, projectedPoint);
      }
      distance = projectedPoint.sub(this.bounds.anchor).dot(this.viewBasis.y);
      this.bounds.top = Math.max(this.bounds.top, distance);

      /*** BOTTOM ***/
      ray.direction.copy(this.viewProjection.bottom);
      if (ray.intersectPlane(this.bounds.plane, projectedPoint) === null) {
        ray.direction.negate();
        ray.intersectPlane(this.bounds.plane, projectedPoint);
      }
      distance = projectedPoint.sub(this.bounds.anchor).dot(this.viewBasis.y);
      this.bounds.bottom = Math.min(this.bounds.bottom, distance);

      /*** LEFT ***/
      ray.direction.copy(this.viewProjection.left);
      if (ray.intersectPlane(this.bounds.plane, projectedPoint) === null) {
        ray.direction.negate();
        ray.intersectPlane(this.bounds.plane, projectedPoint);
      }
      distance = projectedPoint.sub(this.bounds.anchor).dot(this.viewBasis.x);
      this.bounds.left = Math.min(this.bounds.left, distance);

      /*** RIGHT ***/
      ray.direction.copy(this.viewProjection.right);
      if (ray.intersectPlane(this.bounds.plane, projectedPoint) === null) {
        ray.direction.negate();
        ray.intersectPlane(this.bounds.plane, projectedPoint);
      }
      distance = projectedPoint.sub(this.bounds.anchor).dot(this.viewBasis.x);
      this.bounds.right = Math.max(this.bounds.right, distance);
    };
  })(),

  getTarget: (function () {
    let position = new THREE.Vector3();

    return function getTarget(target, plane) {
      return this.getCameraPositionAndTarget(position, target, plane);
    };
  })(),

  getCameraPosition: (function () {
    let target = new THREE.Vector3();

    return function getTarget(position) {
      return this.getCameraPositionAndTarget(position, target);
    };
  })(),

  getCameraPositionAndTarget: (function () {
    let v = new THREE.Vector3();
    let center = new THREE.Vector3();
    let ray = new THREE.Ray();

    return function (position, target, plane) {
      center.copy(this.bounds.anchor);

      v.copy(this.viewBasis.y).multiplyScalar((this.bounds.top + this.bounds.bottom) / 2);
      center.add(v);

      v.copy(this.viewBasis.x).multiplyScalar((this.bounds.left + this.bounds.right) / 2);
      center.add(v);

      let distance = Math.max(
        (this.bounds.top - this.bounds.bottom) / this.verticalTanFov,
        (this.bounds.right - this.bounds.left) / this.horizontalTanFov,
      );

      v.copy(this.viewBasis.z).multiplyScalar(distance * this.fitRatio);

      position.copy(center).add(v);
      target.copy(center);

      if (plane !== undefined) {
        ray.origin.copy(position);
        ray.direction.copy(this.viewBasis.z).negate();
        if (ray.intersectPlane(plane, target) === null) {
          ray.direction.negate();
          if (null === ray.intersectPlane(plane, target)) {
            console.warn('CameraViewBox: unable to put target on given floor plane');
          }
        }
      }

      return this;
    };
  })(),
});
