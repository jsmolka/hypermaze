import { Renderer } from '@/graphic/renderer.js';
import * as THREE from '@/graphic/three';
import { vec3 } from '@/graphic/three';
import _ from 'lodash';

export class Graphic {
  constructor(container, options = {}) {
    options = _.merge(
      {
        fitRatio: 1.05,
      },
      options,
    );

    this.fitRatio = options.fitRatio;
    this.renderRaf = null;
    this.cameraControlsRaf = null;

    this.initRenderer(container);
    this.initScene();
    this.initCamera();
    this.initInteraction();
    this.initControls();
  }

  get cameraFrustum() {
    return {
      fov: 45,
      aspect: this.renderer.width / this.renderer.height,
      near: 1,
      far: 20_000,
    };
  }

  initRenderer(container) {
    this.renderer = new Renderer(container);
  }

  initScene() {
    this.scene = new THREE.Scene();
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      this.cameraFrustum.fov,
      this.cameraFrustum.aspect,
      this.cameraFrustum.near,
      this.cameraFrustum.far,
    );
    this.resetCamera();
  }

  initInteraction() {
    this.interaction = new THREE.Interaction(this.renderer, this.scene, this.camera, {
      autoPreventDefault: true,
    });
  }

  initControls() {
    this.controls = new THREE.CameraControls(this.camera, this.renderer.domElement);
    this.controls.smoothTime = 0;
    this.controls.draggingSmoothTime = 0;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.mouseButtons.left = THREE.CameraControls.ACTION.OFFSET;
    this.controls.mouseButtons.middle = THREE.CameraControls.ACTION.DOLLY;
    this.controls.mouseButtons.right = THREE.CameraControls.ACTION.ROTATE;

    const clock = new THREE.Clock();
    const update = () => {
      const updated = this.controls.update(clock.getDelta());
      if (updated) {
        this.camera.updateMatrixWorld();
        this.render();
      }
      this.cameraControlsRaf = window.requestAnimationFrame(update);
    };
    update();
  }

  dispose() {
    window.cancelAnimationFrame(this.renderRaf);
    window.cancelAnimationFrame(this.cameraControlsRaf);
    this.renderer.dispose();
    this.interaction.removeAllListeners ??= () => {};
    this.interaction.destroy();
    this.controls.dispose();
    THREE.dispose(this.scene);
  }

  render() {
    this.renderRaf ??= window.requestAnimationFrame(() => {
      this.renderRaf = null;
      this.forceRender();
    });
  }

  forceRender() {
    this.renderer.render(this.scene, this.camera);
  }

  resize(rect = null) {
    this.renderer.resize(rect);

    Object.assign(this.camera, this.cameraFrustum);
    this.camera.updateProjectionMatrix();
    this.controls.update();

    this.forceRender();
  }

  fitAndCenter() {
    const target = vec3();

    const viewBox = new THREE.CameraViewBox();
    viewBox.setViewFromCamera(this.camera);
    viewBox.setFitRatio(this.fitRatio);
    viewBox.setFromObject(this.scene);
    viewBox.getCameraPositionAndTarget(this.camera.position, target);

    this.controls.setLookAt(
      this.camera.position.x,
      this.camera.position.y,
      this.camera.position.z,
      target.x,
      target.y,
      target.z,
    );
    this.controls.setFocalOffset(0, 0, 0);
    this.controls.setOrbitPoint(0, 0, 0);

    this.render();
  }

  setCamera(position, up) {
    this.camera.position.copy(position);
    this.camera.up.copy(up);
    this.camera.lookAt(this.scene.position);

    if (!this.controls) {
      return;
    }

    this.controls.updateCameraUp();
    this.controls.reset();
    this.fitAndCenter();
  }

  resetCamera() {
    this.setCamera(vec3(-1000, -1000, 1000), vec3(0, 0, 1));
  }
}
