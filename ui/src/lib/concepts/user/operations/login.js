import WSClient from "../../../ws/wsclient";
import { EventBus } from "@/lib/event_bus";
import checkLocation from "./check_location";

export default function(data) {
  let localStorage = window.localStorage;
  localStorage.setItem("token", data.token);
  localStorage.setItem("id", data.id);
  WSClient.disconnect();
  checkLocation();
  EventBus.$emit("login");
}
