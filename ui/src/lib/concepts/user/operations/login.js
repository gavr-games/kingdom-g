import WSClient from "../../../ws/wsclient";
import { EventBus } from "@/lib/event_bus";
import checkLocation from "./check_location";

export default function(token) {
  let localStorage = window.localStorage;
  localStorage.setItem("token", token);
  WSClient.disconnect();
  checkLocation();
  EventBus.$emit("login");
}
