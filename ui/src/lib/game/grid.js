import * as BABYLON from "babylonjs";
import boardConfig from "./board/config";

class Grid {
  constructor(scene) {
    this.scene = scene;
    this.width = 20;
  }

  create() {
    for (let n = 0; n < this.width; n++) {
      let myPoints = [
        new BABYLON.Vector3(0, 0, boardConfig.cellSize * n),
        new BABYLON.Vector3(
          boardConfig.cellSize * this.width,
          0,
          boardConfig.cellSize * n
        )
      ];
      BABYLON.MeshBuilder.CreateLines(
        "lines",
        { points: myPoints },
        this.scene
      );
    }
    for (let n = 0; n < this.width; n++) {
      let myPoints = [
        new BABYLON.Vector3(boardConfig.cellSize * n, 0, 0),
        new BABYLON.Vector3(
          boardConfig.cellSize * n,
          0,
          boardConfig.cellSize * this.width
        )
      ];
      BABYLON.MeshBuilder.CreateLines(
        "lines",
        { points: myPoints },
        this.scene
      );
    }
    this.showWorldAxis(3);
  }

  makeTextPlane(text, color, size) {
    let dynamicTexture = new BABYLON.DynamicTexture(
      "DynamicTexture",
      50,
      this.scene,
      true
    );
    dynamicTexture.hasAlpha = true;
    dynamicTexture.drawText(
      text,
      5,
      40,
      "bold 36px Arial",
      color,
      "transparent",
      true
    );
    let plane = BABYLON.Mesh.CreatePlane("TextPlane", size, this.scene, true);
    plane.material = new BABYLON.StandardMaterial(
      "TextPlaneMaterial",
      this.scene
    );
    plane.material.backFaceCulling = false;
    plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    plane.material.diffuseTexture = dynamicTexture;
    return plane;
  }

  showWorldAxis(size) {
    var axisX = BABYLON.Mesh.CreateLines(
      "axisX",
      [
        BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(size, 0, 0),
        new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
        new BABYLON.Vector3(size, 0, 0),
        new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
      ],
      this.scene
    );
    axisX.color = new BABYLON.Color3(1, 0, 0);
    var xChar = this.makeTextPlane("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    var axisY = BABYLON.Mesh.CreateLines(
      "axisY",
      [
        BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(0, size, 0),
        new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
        new BABYLON.Vector3(0, size, 0),
        new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
      ],
      this.scene
    );
    axisY.color = new BABYLON.Color3(0, 1, 0);
    var yChar = this.makeTextPlane("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    var axisZ = BABYLON.Mesh.CreateLines(
      "axisZ",
      [
        BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(0, 0, size),
        new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
        new BABYLON.Vector3(0, 0, size),
        new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
      ],
      this.scene
    );
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    var zChar = this.makeTextPlane("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
  }
}

export default Grid;
