import Coords from "@/lib/utils/coords";

class BuildingState {
  constructor(id) {
    this.id = parseInt(id);
  }

  get type() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj.type;
  }

  get objectClass() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj.class;
  }

  get coords() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return Coords.parsePosition(obj.position);
  }

  get rotation() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj.rotation;
  }

  get health() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj.health;
  }

  get maxHealth() {
    let obj = window.client.api.get_object(parseInt(this.id));
    return obj["max_health"];
  }
}

export default BuildingState;
