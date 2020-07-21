// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import "../css/app.scss";
import "../css/header.scss";
import "../css/button.scss";
import "../css/side_menu.scss";
import "../css/wait_view.scss";

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import deps with the dep name or local files with a relative path, for example:
//
//     import {Socket} from "phoenix"
//     import socket from "./socket"
//
import "phoenix_html";
// things
import socket from "./socket";

let Hooks = {};
Hooks.RoomMessages = {
  mounted() {
    // console.log("mounted")
    this.el.scrollTop = this.el.scrollHeight;
  },
  updated() {
    // console.log("updated")
    this.el.scrollTop = this.el.scrollHeight;
  },
};

// Enable connecting to a LiveView socket
// import {Socket} from "phoenix"
// import LiveSocket from "phoenix_live_view"

// let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content");
// let liveSocket = new LiveSocket("/live", Socket, {params: {_csrf_token: csrfToken}, hooks: Hooks})
// liveSocket.connect()

let channel = socket.channel("call", {});
channel
  .join()
  .receive("ok", () => {
    console.log("Joined successfully 2");
  })
  .receive("error", () => {
    console.log("Unable to join");
  });

let localStream, peerConnection;
let localVideo = document.getElementById("localVideo");
let remoteVideo = document.getElementById("remoteVideo");
let connectButton = document.getElementById("connect");
let callButton = document.getElementById("call");
let hangupButton = document.getElementById("hangup");

hangupButton.disabled = true;
callButton.disabled = true;
connectButton.onclick = connect;
callButton.onclick = call;
hangupButton.onclick = hangup;

function connect() {
  navigator.getUserMedia({ video: true }, gotStreamVideo, (error) => {
    console.log("getUserMedia error: ", error);
  });
  navigator.getUserMedia(
    { audio: true, video: true },
    gotStreamAudioVideo,
    (error) => {
      console.log("getUserMedia error: ", error);
    }
  );
}

function gotStreamVideo(stream) {
  console.log("Received local video stream");
  localVideo.srcObject = stream;
}

function gotStreamAudioVideo(stream) {
  console.log("Received local Audio/Video stream");
  localStream = stream;
  setupPeerConnection();
}

function setupPeerConnection() {
  connectButton.disabled = true;
  callButton.disabled = false;
  hangupButton.disabled = false;
  console.log("Waiting for call");

  let servers = {
    iceServers: [
      {
        url: "stun:stun1.l.google.com:19302",
      },
    ],
  };

  peerConnection = new RTCPeerConnection(servers);
  console.log("Created local peer connection");
  peerConnection.onicecandidate = gotLocalIceCandidate;
  peerConnection.onaddstream = gotRemoteStream;
  console.log(peerConnection.onaddstream);
  peerConnection.addStream(localStream);
  console.log("Added localStream to localPeerConnection");
}

function call() {
  callButton.disabled = true;
  console.log("Starting call");
  peerConnection.createOffer(gotLocalDescription, handleError);
}

function gotLocalDescription(description) {
  peerConnection.setLocalDescription(
    description,
    () => {
      channel.push("message", {
        body: JSON.stringify({
          sdp: peerConnection.localDescription,
        }),
      });
    },
    handleError
  );
  console.log("Offer from localPeerConnection: \n" + description.sdp);
}

function gotRemoteDescription(description) {
  console.log("Answer from remotePeerConnection: \n" + description.sdp);
  peerConnection.setRemoteDescription(
    new RTCSessionDescription(description.sdp)
  );
  peerConnection.createAnswer(gotLocalDescription, handleError);
}

function gotRemoteStream(event) {
  remoteVideo.srcObject = event.stream;
  console.log("Received remote stream");
}

function gotLocalIceCandidate(event) {
  if (event.candidate) {
    console.log("Local ICE candidate: \n" + event.candidate.candidate);
    channel.push("message", {
      body: JSON.stringify({
        candidate: event.candidate,
      }),
    });
  }
}

function gotRemoteIceCandidate(event) {
  callButton.disabled = true;
  if (event.candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    console.log("Remote ICE candidate: \n " + event.candidate.candidate);
  }
}

function hangup() {
  console.log("Ending call");
  peerConnection.close();
  localVideo.src = null;
  peerConnection = null;
  hangupButton.disabled = true;
  connectButton.disabled = false;
  callButton.disabled = true;
}

function handleError(error) {
  console.log(error.name + ": " + error.message);
}

channel.on("message", (payload) => {
  let message = JSON.parse(payload.body);
  if (message.sdp) {
    gotRemoteDescription(message);
  } else {
    gotRemoteIceCandidate(message);
  }
});

// let channel = socket.channel("call", {});
// channel
//   .join()
//   .receive("ok", () => {
//     console.log("Joined successfully 2");
//   })
//   .receive("error", () => {
//     console.log("Unable to join");
//   });

// function pushPeerMessage(type, content) {
//   channel.push("peer-message", {
//     body: JSON.stringify({
//       type,
//       content,
//     }),
//   });
// }

// const mediaConstraints = {
//   audio: true,
//   video: true,
// };

// const devices = navigator.mediaDevices;

// const connectButton = document.getElementById("connect");
// const callButton = document.getElementById("call");
// const disconnectButton = document.getElementById("disconnect");

// const remoteVideo = document.getElementById("remote-stream");
// const localVideo = document.getElementById("local-stream");

// let peerConnection;
// let remoteStream = new MediaStream();

// setVideoStream(remoteVideo, remoteStream);

// disconnectButton.disabled = true;
// callButton.disabled = true;
// connectButton.onclick = connect;
// callButton.onclick = call;
// disconnectButton.onclick = disconnect;

// async function connect() {
//   connectButton.disabled = true;
//   disconnectButton.disabled = false;
//   callButton.disabled = false;
//   const localStream = await devices.getUserMedia(mediaConstraints);
//   setVideoStream(localVideo, localStream);
//   peerConnection = createPeerConnection(localStream);
// }

// async function call() {
//   let offer = await peerConnection.createOffer();
//   peerConnection.setLocalDescription(offer);
//   pushPeerMessage("video-offer", offer);
// }

// function createPeerConnection(stream) {
//   let pc = new RTCPeerConnection({
//     iceServers: [
//       {
//         urls: "stun:stun.stunprotocol.org",
//       },
//     ],
//   });
//   pc.ontrack = handleOnTrack;
//   pc.onicecandidate = handleIceCandidate;
//   stream.getTracks().forEach((track) => pc.addTrack(track));
//   return pc;
// }

// function handleOnTrack(event) {
//   log(event);
//   remoteStream.addTrack(event.track);
// }

// function handleIceCandidate(event) {
//   if (!!event.candidate) {
//     pushPeerMessage("ice-candidate", event.candidate);
//   }
// }

// function disconnect() {
//   connectButton.disabled = false;
//   disconnectButton.disabled = true;
//   callButton.disabled = true;
//   unsetVideoStream(localVideo);
//   unsetVideoStream(remoteVideo);
//   peerConnection.close();
//   peerConnection = null;
//   remoteStream = new MediaStream();
//   setVideoStream(remoteVideo, remoteStream);
//   pushPeerMessage("disconnect", {});
// }

// function receiveRemote(offer) {
//   let remoteDescription = new RTCSessionDescription(offer);
//   peerConnection.setRemoteDescription(remoteDescription);
// }

// async function answerCall(offer) {
//   receiveRemote(offer);
//   let answer = await peerConnection.createAnswer();
//   peerConnection
//     .setLocalDescription(answer)
//     .then(() =>
//       pushPeerMessage("video-answer", peerConnection.localDescription)
//     );
// }

// channel.on("peer-message", (payload) => {
//   const message = JSON.parse(payload.body);
//   switch (message.type) {
//     case "video-offer":
//       log("offered: ", message.content);
//       answerCall(message.content);
//       break;
//     case "video-answer":
//       log("answered: ", message.content);
//       receiveRemote(message.content);
//       break;
//     case "ice-candidate":
//       log("candidate: ", message.content);
//       let candidate = new RTCIceCandidate(message.content);
//       peerConnection
//         .addIceCandidate(candidate)
//         .catch(reportError("adding and ice candidate"));
//       break;
//     case "disconnect":
//       disconnect();
//       break;
//     default:
//       reportError("unhandled message type")(message.type);
//   }
// });

// function setVideoStream(videoElement, stream) {
//   videoElement.srcObject = stream;
// }

// function unsetVideoStream(videoElement) {
//   if (videoElement.srcObject) {
//     videoElement.srcObject.getTracks().forEach((track) => track.stop());
//   }
//   videoElement.removeAttribute("src");
//   videoElement.removeAttribute("srcObject");
// }

// const reportError = (where) => (error) => {
//   console.error(where, error);
// };

// function log() {
//   console.log(...arguments);
// }
