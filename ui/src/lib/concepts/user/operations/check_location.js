import WSClient from "../../../ws/wsclient";
import isUserLoggedIn from "../../user/operations/is_logged_in";

export default function() {
  if (isUserLoggedIn()) {
    WSClient.sendMsg("user", {
      action: "check_location",
      data: {}
    });
  }
}
