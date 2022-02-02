import Coords from "@/lib/utils/coords";

class BuildingState {
  constructor(id) {
    this.id = parseInt(id);
  }

  get type() {
    const obj = window.client.api.get_object(parseInt(this.id));
    return obj.type;
  }

  get objectClass() {
    const obj = window.client.api.get_object(parseInt(this.id));
    return obj.class;
  }

  get coords() {
    const obj = window.client.api.get_object(parseInt(this.id));
    return Coords.parsePosition(obj.position);
  }

  get allCoords() {
    //TODO: take flip into account
    const obj = window.client.api.get_object(parseInt(this.id));
    const baseCoords = Coords.parsePosition(obj.position);
    let coords = [];
    for (const [key] of Object.entries(obj.coords)) {
      const rotation = this.rotation || 0;
      coords.push(
        Coords.sum(
          baseCoords,
          Coords.rotate(
            { x: 0, y: 0, z: 0 },
            Coords.parse(key),
            (rotation * Math.PI) / 2
          )
        )
      );
    }
    return coords;
  }

  get rotation() {
    const obj = window.client.api.get_object(parseInt(this.id));
    return obj.rotation;
  }

  get health() {
    const obj = window.client.api.get_object(parseInt(this.id));
    return obj.health;
  }

  get maxHealth() {
    const obj = window.client.api.get_object(parseInt(this.id));
    return obj["max_health"];
  }

  get player() {
    const obj = window.client.api.get_object(parseInt(this.id));
    return obj.player;
  }
}

export default BuildingState;
