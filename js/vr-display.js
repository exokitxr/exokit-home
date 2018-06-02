const vrDisplay = THREE => {

const defaultCanvasSize = [1280, 1024];

const localVector = new THREE.Vector3();
const localMatrix = new THREE.Matrix4();

class VRPose {
  constructor(position = new Float32Array(3), orientation = Float32Array.from([0, 0, 0, 1])) {
    this.position = position;
    this.orientation = orientation;
  }

  set(position, orientation) {
    position.toArray(this.position);
    orientation.toArray(this.orientation);
  }

  copy(vrPose) {
    if (this.position) {
      this.position.set(vrPose.position);
    }
    if (this.orientation) {
      this.orientation.set(vrPose.orientation);
    }
  }
}
class VRFrameData {
  constructor() {
    // c = new THREE.PerspectiveCamera(); c.fov = 90; c.updateProjectionMatrix(); c.projectionMatrix.elements
    this.leftProjectionMatrix = Float32Array.from([1.0000000000000002, 0, 0, 0, 0, 1.0000000000000002, 0, 0, 0, 0, -1.00010000500025, -1, 0, 0, -0.200010000500025, 0]);
    // new THREE.Matrix4().toArray()
    this.leftViewMatrix = Float32Array.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    this.rightProjectionMatrix = this.leftProjectionMatrix.slice();
    this.rightViewMatrix = this.leftViewMatrix.slice();
    this.pose = new VRPose();

    VRFrameData.nonstandard.init.call(this);
  }

  copy(frameData) {
    this.leftProjectionMatrix.set(frameData.leftProjectionMatrix);
    this.leftViewMatrix.set(frameData.leftViewMatrix);
    this.rightProjectionMatrix.set(frameData.rightProjectionMatrix);
    this.rightViewMatrix.set(frameData.rightViewMatrix);
    this.pose.copy(frameData.pose);

    VRFrameData.nonstandard.copy.call(this, frameData);
  }
}
VRFrameData.nonstandard = {
  init() {},
  copy() {},
};
class GamepadButton {
  constructor() {
     this.value = 0;
     this.pressed = false;
     this.touched = false;
  }

  copy(button) {
    this.value = button.value;
    this.pressed = button.pressed;
    this.touched = button.touched;
  }
}
class GamepadPose {
  constructor() {
    this.hasPosition = true;
    this.hasOrientation = true;
    this.position = new Float32Array(3);
    this.linearVelocity = new Float32Array(3);
    this.linearAcceleration = new Float32Array(3);
    this.orientation = Float32Array.from([0, 0, 0, 1]);
    this.angularVelocity = new Float32Array(3);
    this.angularAcceleration = new Float32Array(3);
  }

  copy(pose) {
    this.hasPosition = pose.hasPosition;
    this.hasOrientation = pose.hasOrientation;
    this.position.set(pose.position);
    this.linearVelocity.set(pose.linearVelocity);
    this.linearAcceleration.set(pose.linearAcceleration);
    this.orientation.set(pose.orientation);
    this.angularVelocity.set(pose.angularVelocity);
    this.angularAcceleration.set(pose.angularAcceleration);
  }
}
class Gamepad {
  constructor(hand, index) {
    this.hand = hand;
    this.index = index;

    this.connected = true;
    this.buttons = Array(16);
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i] = new GamepadButton();
    }
    this.pose = new GamepadPose();
    this.axes = new Float32Array(10);

    Gamepad.nonstandard.init.call(this);
  }

  copy(gamepad) {
    this.connected = gamepad.connected;
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].copy(gamepad.buttons[i]);
    }
    this.pose.copy(gamepad.pose);
    this.axes.set(gamepad.axes);

    Gamepad.nonstandard.copy.call(this, gamepad);
  }
}
Gamepad.nonstandard = {
  init() {},
  copy() {},
};
class VRStageParameters {
  constructor() {
    // new THREE.Matrix4().compose(new THREE.Vector3(0, 0, 0), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)).toArray(new Float32Array(16))
    this.sittingToStandingTransform = Float32Array.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  copy(vrStageParameters) {
    this.sittingToStandingTransform.set(vrStageParameters.sittingToStandingTransform);
  }
}

class MRDisplay {
  constructor(name) {
    this.name = name;

    this.isPresenting = false;
    this.capabilities = {
      canPresent: true,
      hasExternalDisplay: true,
      hasPosition: true,
      maxLayers: 1,
    };
    this.depthNear = 0.1;
    this.depthFar = 10000.0;
    this.stageParameters = new VRStageParameters();

    this._width = defaultCanvasSize[0] / 2;
    this._height = defaultCanvasSize[1];
    this._leftOffset = 0;
    this._leftFov = Float32Array.from([45, 45, 45, 45]);
    this._rightOffset = 0;
    this._rightFov = Float32Array.from([45, 45, 45, 45]);
    this._rafs = [];
  }

  getLayers() {
    return [
      {
        leftBounds: [0, 0, 0.5, 1],
        rightBounds: [0.5, 0, 0.5, 1],
        source: null,
      }
    ];
  }

  getEyeParameters(eye) {
    const leftEye = eye === 'left';
    const _fovArrayToVRFieldOfView = fovArray => ({
      leftDegrees: fovArray[0],
      rightDegrees: fovArray[1],
      upDegrees: fovArray[2],
      downDegrees: fovArray[3],
    });
    return {
      renderWidth: this._width,
      renderHeight: this._height,
      offset: leftEye ? this._leftOffset : this._rightOffset,
      fieldOfView: _fovArrayToVRFieldOfView(leftEye ? this._leftFov : this._rightFov),
    };
  }

  requestPresent(layers) {
    return (this.onrequestpresent ? this.onrequestpresent(layers) : Promise.resolve())
      .then(() => {
        this.isPresenting = true;

        if (this.onvrdisplaypresentchange) {
          this.onvrdisplaypresentchange();
        }
      });
  }

  exitPresent() {
    return (this.onexitpresent ? this.onexitpresent() : Promise.resolve())
      .then(() => {
        this.isPresenting = false;

        for (let i = 0; i < this._rafs.length; i++) {
          this.cancelAnimationFrame(this._rafs[i]);
        }
        this._rafs.length = 0;

        if (this.onvrdisplaypresentchange) {
          this.onvrdisplaypresentchange();
        }
      });
  }

  requestAnimationFrame(fn) {
    if (this.onrequestanimationframe) {
      const animationFrame = this.onrequestanimationframe(timestamp => {
        this._rafs.splice(animationFrame, 1);
        fn(timestamp);
      });
      this._rafs.push(animationFrame);
      return animationFrame;
    }
  }

  cancelAnimationFrame(animationFrame) {
    if (this.oncancelanimationframe) {
      const result = this.oncancelanimationframe(animationFrame);
      const index = this._rafs.indexOf(animationFrame);
      if (index !== -1) {
        this._rafs.splice(index, 1);
      }
      return result;
    }
  }

  submitFrame() {}

  destroy() {
    for (let i = 0; i < this._rafs.length; i++) {
      this.cancelAnimationFrame(this._rafs[i]);
    }
  }
}
class VRDisplay extends MRDisplay {
  constructor(name = 'VR') {
    super(name);

    this._frameData = new VRFrameData();
  }

  getFrameData(frameData) {
    frameData.set(this._frameData.leftProjectionMatrix);
    frameData.set(this._frameData.leftViewMatrix);
    frameData.set(this._frameData.rightViewMatrix);
    frameData.set(this._frameData.rightProjectionMatrix);
    frameData.pose.position.set(this._frameData.pose.position);
    frameData.pose.orientation.set(this._frameData.pose.orientation);
  }

  update(update) {
    const {
      depthNear,
      depthFar,
      renderWidth,
      renderHeight,
      leftOffset,
      leftFov,
      rightOffset,
      rightFov,
      frameData,
      stageParameters,
      handsArray,
    } = update;

    if (depthNear !== undefined) {
      this.depthNear = depthNear;
    }
    if (depthFar !== undefined) {
      this.depthFar = depthFar;
    }
    if (renderWidth !== undefined) {
      this._width = renderWidth;
    }
    if (renderHeight !== undefined) {
      this._height = renderHeight;
    }
    if (leftOffset !== undefined) {
      this._leftOffset = leftOffset;
    }
    if (leftFov !== undefined) {
      this._leftFov = leftOffset;
    }
    if (rightOffset !== undefined) {
      this._rightOffset = rightOffset;
    }
    if (rightFov !== undefined) {
      this._rightFov = rightFov;
    }
    if (frameData !== undefined) {
      this._frameData.copy(frameData);
    }
    if (stageParameters !== undefined) {
      this.stageParameters.copy(stageParameters);
    }
    if (handsArray !== undefined) {
      this._frameData.hands[0].set(handsArray[0]);
      this._frameData.hands[1].set(handsArray[1]);
    }
  }
}
class FakeVRDisplay extends MRDisplay {
  constructor() {
    super('FAKE');

    this.position = new THREE.Vector3();
    this.quaternion = new THREE.Quaternion();
    this.gamepads = gamepads;

    this.isPresenting = false;
    this.depthNear = 0.1;
    this.depthFar = 10 * 1024;
    this._width = defaultCanvasSize[0];
    this._height = defaultCanvasSize[1];
    this._leftOffset = 0;
    this._leftFov = 90;
    this._rightOffset = 0;
    this._rightFov = 90;
    this.stageParameters = new VRStageParameters();

    this._frameData = new VRFrameData();
  }

  setSize(width, height) {
    this._width = width;
    this._height = height;
  }

  update() {
    localMatrix.compose(
      this.position,
      this.quaternion,
      localVector.set(1, 1, 1)
    )
     .getInverse(localMatrix)
     .toArray(this._frameData.leftViewMatrix);
    this._frameData.rightViewMatrix.set(this._frameData.leftViewMatrix);
    this._frameData.pose.set(this.position, this.quaternion);

    const globalGamepads = getAllGamepads();
    gamepads[0] = globalGamepads[0];
    gamepads[1] = globalGamepads[1];
  }

  requestPresent() {
    return Promise.resolve()
      .then(() => {
        this.isPresenting = true;
      });
  }

  exitPresent() {
    return Promise.resolve()
      .then(() => {
        this.isPresenting = false;
      });
  }

  getFrameData(frameData) {
    frameData.copy(this._frameData);
  }

  getLayers() {
    return [
      {
        leftBounds: [0, 0, 1, 1],
        rightBounds: [1, 0, 1, 1],
        source: null,
      }
    ];
  }
}

const createVRDisplay = () => new FakeVRDisplay();

const gamepads = [null, null];
const getGamepads = () => gamepads;

let allGamepads = null;
const getAllGamepads = () => {
  if (allGamepads === null) { // defer so constructor overrides can be declared
    allGamepads = [
      new Gamepad('left', 0),
      new Gamepad('right', 1),
    ];
  }
  return allGamepads;
};

return {
  MRDisplay,
  VRDisplay,
  FakeVRDisplay,
  VRFrameData,
  VRPose,
  VRStageParameters,
  Gamepad,
  GamepadButton,
  createVRDisplay,
  getGamepads,
  getAllGamepads,
};

};

if (typeof window !== 'undefined') {
  const {
    VRDisplay,
    FakeVRDisplay,
    VRFrameData,
    VRPose,
    VRStageParameters,
    Gamepad,
    GamepadButton,
    createVRDisplay,
    getGamepads,
  } = vrDisplay(window.THREE);

  if (window.VRDisplay === undefined) {
    window.VRDisplay = VRDisplay;
  }
  if (window.FakeVRDisplay === undefined) {
    window.FakeVRDisplay = FakeVRDisplay;
  }
  if (window.VRFrameData === undefined) {
    window.VRFrameData = VRFrameData;
  } else {
    window.VRFrameData.prototype.copy = VRFrameData.prototype.copy;
  }
  if (window.VRPose === undefined) {
    window.VRPose = VRPose;
  } else {
    window.VRPose.prototype.copy = VRPose.prototype.copy;
  }
  if (window.VRStageParameters === undefined) {
    window.VRStageParameters = VRStageParameters;
  }
  if (window.Gamepad === undefined) {
    window.Gamepad = Gamepad;
  }
  if (window.GamepadButton === undefined) {
    window.GamepadButton = GamepadButton;
  }
  if (window.navigator.createVRDisplay === undefined) {
    window.navigator.createVRDisplay = createVRDisplay;
  }
  if (window.navigator.getGamepads === undefined) {
    window.navigator.getGamepads = getGamepads;
  }
} else {
  module.exports = vrDisplay;
}
