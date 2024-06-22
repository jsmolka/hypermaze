import * as THREE from '@/graphic/three';
import _ from 'lodash';

export class Renderer extends THREE.WebGLRenderer {
  constructor(container, options = {}) {
    options = _.merge(
      {
        alpha: true,
        antialias: true,
        logarithmicDepthBuffer: true,
        preserveDrawingBuffer: false,
        stencil: false,
      },
      options,
    );
    super(options);

    container.appendChild(this.domElement);
    this.domElement.style.outline = 'none';
    this.domElement.tabIndex = 0;

    this.setPixelRatio(window.devicePixelRatio);
    this.setClearColor(0xffffff, 0);
    this.resize();
  }

  get container() {
    return this.domElement.parentNode;
  }

  get width() {
    return this.container.clientWidth;
  }

  get height() {
    return this.container.clientHeight;
  }

  dispose() {
    this.forceContextLoss();
    super.dispose();
    this.domElement = null;
  }

  resize(rect = null) {
    const w = Math.floor(rect?.width ?? this.width);
    const h = Math.floor(rect?.height ?? this.height);
    this.setSize(w, h);
  }
}
