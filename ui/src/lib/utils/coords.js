export default class Coords {
  static parse(coordsString) {
    let coords = {
      x: 0,
      y: 0,
      z: 0
    };
    coords.x = parseInt(coordsString.split(" ")[0].replace("[", ""));
    coords.z = parseInt(coordsString.split(" ")[1].replace("]", ""));
    return coords;
  }

  static parsePosition(pos) {
    let coords = {
      x: 0,
      y: 0,
      z: 0
    };
    coords.x = pos[0];
    coords.z = pos[1];
    return coords;
  }
}
