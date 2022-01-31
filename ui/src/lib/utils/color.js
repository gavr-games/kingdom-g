import * as BABYLON from "babylonjs";
const COLORS = [
  BABYLON.Color3.Blue(),
  BABYLON.Color3.Red(),
  BABYLON.Color3.Green(),
  BABYLON.Color3.Yellow(),
  BABYLON.Color3.Teal(),
  BABYLON.Color3.Magenta(),
  BABYLON.Color3.White(),
  BABYLON.Color3.Purple(),
  BABYLON.Color3.Gray(),
  BABYLON.Color3.Black()
];
export default class Color {
  static getColorFromMap(number) {
    return COLORS[number % 10];
  }
}
