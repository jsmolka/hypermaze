import { CameraControls } from '@/graphic/cameraControls';
import { CameraViewBox } from '@/graphic/cameraViewBox';
import { dispose } from '@/graphic/dispose';
import { Renderer } from '@/graphic/renderer.js';
import { merge } from 'lodash-es';
import { Clock, PerspectiveCamera, Scene, Vector3 } from 'three';

export class Graphic {
  constructor(container, options = {}) {
    options = merge(
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
    this.initCameraControls();
  }

  get cameraFrustum() {
    return {
      fov: 45,
      aspect: this.renderer.width / this.renderer.height,
      near: 1,
      far: 20000,
    };
  }

  initRenderer(container) {
    this.renderer = new Renderer(container);
  }

  initScene() {
    this.scene = new Scene();
  }

  initCamera() {
    this.camera = new PerspectiveCamera();
    Object.assign(this.camera, this.cameraFrustum);
    this.resetCamera();
  }

  initCameraControls() {
    this.controls = new CameraControls(this.camera, this.renderer.domElement);
    this.controls.smoothTime = 0;
    this.controls.draggingSmoothTime = 0;
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;
    this.controls.mouseButtons.left = CameraControls.ACTION.OFFSET;
    this.controls.mouseButtons.middle = CameraControls.ACTION.DOLLY;
    this.controls.mouseButtons.right = CameraControls.ACTION.ROTATE;

    const clock = new Clock();
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
    this.controls.dispose();
    dispose(this.scene);
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
    const target = new Vector3();

    const viewBox = new CameraViewBox();
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
    this.setCamera(new Vector3(-1000, -1000, 1000), new Vector3(0, 0, 1));
  }
}
