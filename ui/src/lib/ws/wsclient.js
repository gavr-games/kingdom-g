"use strict";
import { Socket } from "phoenix";
import { EventBus } from "../event_bus";
import getToken from "../concepts/token/operations/get_token";
import axios from "axios";

class WSClient {
  constructor() {
    this.channels = [];
    this.socket = null;
    this.connected = false;
    this.debug = true;
  }

  connect() {
    let wsUrl = "wss://" + window.location.hostname + "/socket";
    this.socket = new Socket(wsUrl, {
      params: {
        token: getToken()
      }
    });
    if (this.debug) {
      console.log("trying to connect");
    }
    this.socket.onError(this.checkAuth);
    this.socket.connect();
    this.connected = true;
  }

  checkAuth() {
    axios
      .post("/api/check_auth", {
        token: getToken()
      })
      .then(function(response) {
        if (response.data.user_id === null) {
          let localStorage = window.localStorage;
          localStorage.removeItem("token");
          window.location.reload();
        }
      });
  }

  disconnect() {
    if (this.connected) {
      this.socket.disconnect();
      this.channels = [];
      this.connected = false;
      if (this.debug) {
        console.log("disconnected");
      }
    }
  }

  setDebug(debug) {
    this.debug = debug;
  }

  joinChannel(channelName) {
    if (!this.connected) {
      this.connect();
    }
    if (this.channels[channelName] !== undefined) {
      return;
    }
    let channel = this.socket.channel(channelName, {});

    channel.on("msg", payload => {
      if (this.debug) {
        console.log(channelName, "msg", payload);
      }
      EventBus.$emit(`received-${channelName}-msg`, payload);
    });

    channel.on("error", payload => {
      if (this.debug) {
        console.log(channelName, "error", payload);
      }
      EventBus.$emit(`received-${channelName}-error`, payload);
    });

    channel
      .join()
      .receive("ok", resp => {
        if (this.debug) {
          console.log("Joined successfully " + channelName, resp);
          EventBus.$emit("joined-channel", { channel: channelName });
        }
      })
      .receive("error", resp => {
        if (this.debug) {
          console.log("Unable to join " + channelName, resp);
          EventBus.$emit("join-channel-error", { channel: channelName });
        }
      });

    this.channels[channelName] = channel;
  }

  leaveChannel(channelName) {
    if (this.channels[channelName]) {
      this.channels[channelName].leave();
      this.channels[channelName] = undefined;
      if (this.debug) {
        console.log("Leave channel " + channelName);
      }
    }
  }

  sendMsg(channelName, msg) {
    this.joinChannel(channelName);
    this.channels[channelName].push("msg", msg);
  }
}
const client = new WSClient();
export default client;
