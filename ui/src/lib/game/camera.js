import * as BABYLON from "babylonjs";
import boardConfig from "./board/config";

const CameraZ = 30;
const CameraSize = 1;

class Camera {
  constructor(scene, canvas) {
    this.scene = scene;
    this.canvas = canvas;
    this.camera = null;
  }

  create() {
    this.createLimitPlanes(20);
    this.camera = new BABYLON.FreeCamera(
      "MainCamera",
      new BABYLON.Vector3(-17, CameraZ, -17),
      this.scene
    );
    this.camera.setTarget(new BABYLON.Vector3(10, 5, 10));
    this.camera.attachControl(this.canvas, true);
    this.camera.checkCollisions = true;
    this.camera.ellipsoid = new BABYLON.Vector3(
      CameraSize,
      CameraSize,
      CameraSize
    );
    this.camera.applyGravity = true;
  }

  createLimitPlanes(size) {
    let bottomP = BABYLON.MeshBuilder.CreatePlane(
      "cameraPlane",
      {
        width: boardConfig.cellSize * (size + 20),
        height: boardConfig.cellSize * (size + 20)
      },
      this.scene
    );
    bottomP.visibility = 0;
    bottomP.position.x = boardConfig.cellSize * 10;
    bottomP.position.z = boardConfig.cellSize * 10;
    bottomP.position.y = CameraZ - CameraSize - CameraSize;
    bottomP.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);
    bottomP.checkCollisions = true;
    bottomP.isPickable = false;

    let northP = BABYLON.MeshBuilder.CreatePlane(
      "cameraPlane",
      {
        width: boardConfig.cellSize * (size + 20),
        height: boardConfig.cellSize * 10
      },
      this.scene
    );
    northP.visibility = 0;
    northP.position.x = boardConfig.cellSize * 10;
    northP.position.z = boardConfig.cellSize * (size + 10);
    northP.position.y = CameraZ - CameraSize;
    northP.checkCollisions = true;

    let southP = BABYLON.MeshBuilder.CreatePlane(
      "cameraPlane",
      {
        width: boardConfig.cellSize * (size + 20),
        height: boardConfig.cellSize * 10
      },
      this.scene
    );
    southP.visibility = 0;
    southP.position.x = boardConfig.cellSize * 10;
    southP.position.z = -boardConfig.cellSize * 10;
    southP.position.y = CameraZ - CameraSize;
    southP.rotate(BABYLON.Axis.Y, Math.PI, BABYLON.Space.WORLD);
    southP.checkCollisions = true;

    let westP = BABYLON.MeshBuilder.CreatePlane(
      "cameraPlane",
      {
        width: boardConfig.cellSize * (size + 20),
        height: boardConfig.cellSize * 10
      },
      this.scene
    );
    westP.visibility = 0;
    westP.position.x = -boardConfig.cellSize * 10;
    westP.position.z = boardConfig.cellSize * 10;
    westP.position.y = CameraZ - CameraSize;
    westP.rotate(BABYLON.Axis.Y, (Math.PI * 3) / 2, BABYLON.Space.WORLD);
    westP.checkCollisions = true;

    let eastP = BABYLON.MeshBuilder.CreatePlane(
      "cameraPlane",
      {
        width: boardConfig.cellSize * (size + 20),
        height: boardConfig.cellSize * 10
      },
      this.scene
    );
    eastP.visibility = 0;
    eastP.position.x = boardConfig.cellSize * (size + 10);
    eastP.position.z = boardConfig.cellSize * 10;
    eastP.position.y = CameraZ - CameraSize;
    eastP.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD);
    eastP.checkCollisions = true;
  }
}

export default Camera;
