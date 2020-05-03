import WSClient from "../../../ws/wsclient";
import { EventBus } from "@/lib/event_bus";

export default function() {
  let localStorage = window.localStorage;
  localStorage.removeItem("token");
  localStorage.removeItem("id");
  WSClient.disconnect();
  EventBus.$emit("logout");
}
