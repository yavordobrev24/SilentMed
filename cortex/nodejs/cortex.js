const WebSocket = require("ws");
const fs = require("fs");
/**
 * This class handle:
 *  - create websocket connection
 *  - handle request for : headset , request access, control headset ...
 *  - handle 2 main flows : sub and train flow
 *  - use async/await and Promise for request need to be run on sync
 */

const WARNING_CODE_HEADSET_DISCOVERY_COMPLETE = 142;
const WARNING_CODE_HEADSET_CONNECTED = 104;

class Cortex {
  constructor(user, socketUrl) {
    // create socket
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    this.socket = new WebSocket(socketUrl);

    // read user infor
    this.user = user;
    this.isHeadsetConnected = false;
  }

  queryHeadsetId() {
    return new Promise((resolve, reject) => {
      const QUERY_HEADSET_ID = 2;
      let socket = this.socket;
      let queryHeadsetRequest = {
        jsonrpc: "2.0",
        id: QUERY_HEADSET_ID,
        method: "queryHeadsets",
        params: {},
      };
      const sendQueryRequest = () => {
        console.log("queryHeadsetRequest");
        socket.send(JSON.stringify(queryHeadsetRequest));
      };

      sendQueryRequest();

      socket.on("message", (data) => {
        try {
          if (JSON.parse(data)["id"] == QUERY_HEADSET_ID) {
            // console.log(data)
            // console.log(JSON.parse(data)['result'].length)
            if (JSON.parse(data)["result"].length > 0) {
              JSON.parse(data)["result"].forEach((headset) => {
                if (headset["status"] === "connected") {
                  this.isHeadsetConnected = true;
                }
              });
              resolve(JSON.parse(data));
            } else {
              console.log(
                "No have any headset, please connect headset with your pc."
              );
              this.isHeadsetConnected = false;
            }
          }
        } catch (error) {
          console.error(error);
        }
      });

      // Schedule subsequent requests every 1 minute
      setInterval(sendQueryRequest, 60000);
    });
  }

  requestAccess() {
    let socket = this.socket;
    let user = this.user;
    return new Promise(function (resolve, reject) {
      const REQUEST_ACCESS_ID = 1;
      let requestAccessRequest = {
        jsonrpc: "2.0",
        method: "requestAccess",
        params: {
          clientId: user.clientId,
          clientSecret: user.clientSecret,
        },
        id: REQUEST_ACCESS_ID,
      };

      // console.log('start send request: ',requestAccessRequest)
      socket.send(JSON.stringify(requestAccessRequest));

      socket.on("message", (data) => {
        try {
          if (JSON.parse(data)["id"] == REQUEST_ACCESS_ID) {
            resolve(data);
          }
        } catch (error) {}
      });
    });
  }

  authorize() {
    let socket = this.socket;
    let user = this.user;
    return new Promise(function (resolve, reject) {
      const AUTHORIZE_ID = 4;
      let authorizeRequest = {
        jsonrpc: "2.0",
        method: "authorize",
        params: {
          clientId: user.clientId,
          clientSecret: user.clientSecret,
          license: user.license,
          debit: user.debit,
        },
        id: AUTHORIZE_ID,
      };
      socket.send(JSON.stringify(authorizeRequest));
      socket.on("message", (data) => {
        try {
          if (JSON.parse(data)["id"] == AUTHORIZE_ID) {
            let cortexToken = JSON.parse(data)["result"]["cortexToken"];
            resolve(cortexToken);
            // Call controlDevice("refresh") when authorization is successful
            this.refreshHeadsetList();
          }
        } catch (error) {}
      });
    });
  }

  controlDevice(headsetId) {
    let socket = this.socket;
    const CONTROL_DEVICE_ID = 3;
    let controlDeviceRequest = {
      jsonrpc: "2.0",
      id: CONTROL_DEVICE_ID,
      method: "controlDevice",
      params: {
        command: "connect",
        headset: headsetId,
      },
    };
    return new Promise(function (resolve, reject) {
      socket.send(JSON.stringify(controlDeviceRequest));
      console.log("control device request: ", controlDeviceRequest);
      socket.on("message", (data) => {
        try {
          let response = JSON.parse(data);
          if (response["id"] == CONTROL_DEVICE_ID) {
            if (response.error) {
              console.log(response.error.message);
              setTimeout(() => {
                socket.send(JSON.stringify(controlDeviceRequest));
              }, 10000);
            } else {
              resolve(response);
            }
          }
        } catch (error) {}
      });
    });
  }

  createSession(authToken, headsetId) {
    return new Promise(async (resolve, reject) => {
      let socket = this.socket;
      const CREATE_SESSION_ID = 5;
      let sessionId;
      const checkHeadsetId = async () => {
        const response = await this.queryHeadsetId();
        const found = response["result"].find(
          (item) =>
            String(item["id"]) === String(headsetId) &&
            item["status"] === "connected"
        );
        if (found) {
          clearInterval(queryInterval);
          let createSessionRequest = {
            jsonrpc: "2.0",
            id: CREATE_SESSION_ID,
            method: "createSession",
            params: {
              cortexToken: authToken,
              headset: headsetId,
              status: "active",
            },
          };
          socket.send(JSON.stringify(createSessionRequest));

          socket.on("message", (data) => {
            let parsedData = JSON.parse(data);
            if (parsedData.id === CREATE_SESSION_ID) {
              sessionId = parsedData["result"]["id"];
              resolve(sessionId);
            }
          });
        }
      };
      const queryInterval = setInterval(checkHeadsetId, 30000);
      checkHeadsetId();
    });
  }

  subRequest(stream, authToken, sessionId, filename) {
    let socket = this.socket;
    const SUB_REQUEST_ID = 6;
    let subRequest = {
      jsonrpc: "2.0",
      method: "subscribe",
      params: {
        cortexToken: authToken,
        session: sessionId,
        streams: stream,
      },
      id: SUB_REQUEST_ID,
    };
    console.log("sub eeg request: ", subRequest);
    socket.send(JSON.stringify(subRequest));
    socket.on("message", (data) => {
      try {
        if (JSON.parse(data)["id"] == SUB_REQUEST_ID) {
          console.log("REQ DATA");
          // console.log(data.toString("utf8"));
          //console.log("\r\n");
        }
      } catch (error) {}
    });
    socket.on("close", () => {
      const filePath = path.join(__dirname, `${fileName}.txt`);
      fs.writeFileSync(filePath, "", { flag: "w" });
      process.kill();
    });
  }

  /**
   * - query headset infor
   * - connect to headset with control device request
   * - authentication and get back auth token
   * - create session and get back session id
   */
  async querySessionInfo() {
    let qhResult = "";
    let headsetId = "";
    await this.queryHeadsetId().then((result) => {
      qhResult = result;
    });
    this.qhResult = qhResult;
    this.headsetId = qhResult["result"][0]["id"];
    let ctResult = "";
    await this.controlDevice(this.headsetId).then((result) => {
      ctResult = result;
    });
    this.ctResult = ctResult;
    console.log(ctResult);

    let authToken = "";
    await this.authorize().then((auth) => {
      authToken = auth;
    });
    this.authToken = authToken;

    let sessionId = "";
    await this.createSession(authToken, this.headsetId).then((result) => {
      sessionId = result;
    });
    this.sessionId = sessionId;

    console.log("HEADSET ID -----------------------------------");
    console.log(this.headsetId);
    console.log("\r\n");
    console.log("CONNECT STATUS -------------------------------");
    console.log(this.ctResult);
    console.log("\r\n");
    console.log("AUTH TOKEN -----------------------------------");
    console.log(this.authToken);
    console.log("\r\n");
    console.log("SESSION ID -----------------------------------");
    console.log(this.sessionId);
    console.log("\r\n");
  }

  /**
   * - check if user logined
   * - check if app is granted for access
   * - query session info to prepare for sub and train
   */
  async checkGrantAccessAndQuerySessionInfo() {
    let requestAccessResult = "";
    await this.requestAccess().then((result) => {
      requestAccessResult = result;
    });

    let accessGranted = JSON.parse(requestAccessResult);

    // check if user is logged in CortexUI
    if ("error" in accessGranted) {
      console.log(
        "You must login on CortexUI before request for grant access then rerun"
      );
      throw new Error(
        "You must login on CortexUI before request for grant access"
      );
    } else {
      console.log(accessGranted["result"]["message"]);
      // console.log(accessGranted['result'])
      if (accessGranted["result"]["accessGranted"]) {
        await this.querySessionInfo();
      } else {
        console.log(
          "You must accept access request from this app on CortexUI then rerun"
        );
        throw new Error(
          "You must accept access request from this app on CortexUI"
        );
      }
    }
  }

  /**
   *
   * - check login and grant access
   * - subcribe for stream
   * - logout data stream to console or file
   */
  sub(streams, fileName, timeoutMillis) {
    const fs = require("fs");
    const path = require("path");

    this.socket.on("open", async () => {
      await this.checkGrantAccessAndQuerySessionInfo();

      // Specify the file path based on the fileName provided
      const filePath = path.join(__dirname, `${fileName}.txt`);

      this.subRequest(streams, this.authToken, this.sessionId, this.fileName);

      let lastWriteTime = Date.now();

      this.socket.on("message", (data) => {
        // Check if the timeout has elapsed
        if (Date.now() - lastWriteTime >= timeoutMillis) {
          try {
            // Truncate the file and write the new data
            fs.writeFileSync(filePath, `${data}\n`, { flag: "w" });
            lastWriteTime = Date.now(); // Update the last write time
            console.log("DATA");
          } catch (error) {
            console.error("Error writing to file:", error);
          }
        }
      });

      this.socket.on("close", () => {
        console.log("Closing");
      });
    });
  }
  setupProfile(authToken, headsetId, profileName, status) {
    const SETUP_PROFILE_ID = 7;
    let setupProfileRequest = {
      jsonrpc: "2.0",
      method: "setupProfile",
      params: {
        cortexToken: authToken,
        headset: headsetId,
        profile: profileName,
        status: status,
      },
      id: SETUP_PROFILE_ID,
    };
    // console.log(setupProfileRequest)
    let socket = this.socket;
    return new Promise(function (resolve, reject) {
      socket.send(JSON.stringify(setupProfileRequest));
      socket.on("message", (data) => {
        if (status == "create") {
          resolve(data);
        }

        try {
          // console.log('inside setup profile', data)
          if (JSON.parse(data)["id"] == SETUP_PROFILE_ID) {
            if (JSON.parse(data)["result"]["action"] == status) {
              console.log(
                "SETUP PROFILE -------------------------------------"
              );
              // console.log(data)
              console.log("\r\n");
              resolve(data);
            }
          }
        } catch (error) {}
      });
    });
  }

  queryProfileRequest(authToken) {
    const QUERY_PROFILE_ID = 9;
    let queryProfileRequest = {
      jsonrpc: "2.0",
      method: "queryProfile",
      params: {
        cortexToken: authToken,
      },
      id: QUERY_PROFILE_ID,
    };

    let socket = this.socket;
    return new Promise(function (resolve, reject) {
      socket.send(JSON.stringify(queryProfileRequest));
      socket.on("message", (data) => {
        try {
          if (JSON.parse(data)["id"] == QUERY_PROFILE_ID) {
            // console.log(data)
            resolve(data);
          }
        } catch (error) {}
      });
    });
  }

  refreshHeadsetList() {
    const REFRESH_HEADSET_LIST_ID = 14;
    const refreshHeadsetListRequest = {
      jsonrpc: "2.0",
      id: REFRESH_HEADSET_LIST_ID,
      method: "controlDevice",
      params: {
        command: "refresh",
      },
    };
    console.log("Refresh the headset list");
    socket.send(JSON.stringify(refreshHeadsetListRequest));
  }

  listenForWarnings() {
    this.socket.on("message", (data) => {
      try {
        const message = JSON.parse(data);
        if (message.warning) {
          console.log("Warning Received Code:", message.warning.code);
          console.log("Message:", message.warning.message);
          console.log("--------------------------------------");

          if (message.warning.code === WARNING_CODE_HEADSET_CONNECTED) {
            this.isHeadsetConnected = true;
          }
          // After headset scanning finishes, if no headset is connected yet, the app should call the controlDevice("refresh") again
          if (
            message.warning.code === WARNING_CODE_HEADSET_DISCOVERY_COMPLETE &&
            !this.isHeadsetConnected
          ) {
            this.refreshHeadsetList();
          }
        }
      } catch (error) {}
    });
  }
}

// ---------------------------------------------------------
let socketUrl = "wss://localhost:6868";
let user = {
  license: "",
  clientId: "uHz49YQawus1U1GERMWtXAPRMEx6anHl99wk3uQN",
  clientSecret:
    "mkBaQ9fY864hzh8Yf1p1wz6uhhL5IhBEzPVV39kYg1K2uWjA4fIZj1URqvba1aC48DVNDeVa1UEMg7Xw6iUTFk8TfduH6kackterRPGeRFGWPqcb45psl9nRQwwaCjjk",
  debit: 1,
};

let c = new Cortex(user, socketUrl);
c.listenForWarnings();

let streams = ["mot"];
let fileName = "stream_data_log";
let timeoutMillis = 1000;
c.sub(streams, fileName, timeoutMillis);
