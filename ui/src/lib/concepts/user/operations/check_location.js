import WSClient from "../../../ws/wsclient";
import isUserLoggedIn from "../../user/operations/is_logged_in";
import getId from "../../user/operations/get_id";

export default function() {
  if (isUserLoggedIn()) {
    WSClient.sendMsg(`user:${getId()}`, {
      action: "check_location",
      data: {}
    });
  }
}
