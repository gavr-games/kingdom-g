export default class Coords {
  static sum(coord1, coord2) {
    return {
      x: coord1.x + coord2.x,
      y: coord1.y + coord2.y,
      z: coord1.z + coord2.z
    };
  }

  static rotate(pivot, coord, angle) {
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    let newCoord = {
      x: pivot.x,
      y: pivot.y,
      z: pivot.z
    };

    // translate point back to origin:
    newCoord.x -= coord.x;
    newCoord.z -= coord.z;

    // rotate point
    const xNew = coord.x * c - coord.z * s;
    const zNew = coord.x * s + coord.z * c;

    // translate point back:
    newCoord.x = xNew + pivot.x;
    newCoord.z = zNew + pivot.z;
    return newCoord;
  }

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
