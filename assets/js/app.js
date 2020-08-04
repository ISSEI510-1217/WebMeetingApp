import "phoenix_html";
import socket from "./socket";

let channel = socket.channel("call", {});
channel
  .join()
  .receive("ok", () => {
    console.log("Joined successfully");
  })
  .receive("error", () => {
    console.log("Unable to join");
  });

function pushPeerMessage(type, content) {
  channel.push("peer-message", {
    body: JSON.stringify({
      type,
      content,
    }),
  });
}

const mediaConstraints = {
  audio: true,
  video: true,
};

const connectButton = document.getElementById("connect");
const callButton = document.getElementById("call");
const disconnectButton = document.getElementById("hangup");

const remoteVideo = document.getElementById("remoteVideo");
const localVideo = document.getElementById("localVideo");

let peerConnection;
let remoteStream = new MediaStream();

setVideoStream(remoteVideo, remoteStream);

disconnectButton.disabled = true;
callButton.disabled = true;
connectButton.onclick = connect;
callButton.onclick = call;
disconnectButton.onclick = disconnect;

navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
    getUserMedia: function(c) {
      return new Promise(function(y, n) {
        (navigator.mozGetUserMedia ||
         navigator.webkitGetUserMedia).call(navigator, c, y, n);
      });
    }
 } : null);
 
 if (!navigator.mediaDevices) {
   console.log("getUserMedia() not supported.");
   return;
 }

async function connect() {
  connectButton.disabled = true;
  disconnectButton.disabled = false;
  callButton.disabled = false;
  console.log("check1")
  const localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
  console.log("check2")
  if (localStream) {
    console.log("Adding local stream...");
    setVideoStream(localVideo, localStream);
    peerConnection = createPeerConnection(localStream);
  } else {
    console.warn("no local stream, but continue.");
  }
}

async function call() {
  let offer = await peerConnection.createOffer();
  peerConnection.setLocalDescription(offer);
  pushPeerMessage("video-offer", offer);
}

function createPeerConnection(stream) {
  let pc = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  });
  console.log(pc);
  pc.ontrack = handleOnTrack;
  pc.onicecandidate = handleIceCandidate;
  stream.getTracks().forEach((track) => pc.addTrack(track));
  console.log(pc);
  return pc;
}

function handleOnTrack(event) {
  log(event);
  remoteStream.addTrack(event.track);
}

function handleIceCandidate(event) {
  if (!!event.candidate) {
    pushPeerMessage("ice-candidate", event.candidate);
  }
}

function disconnect() {
  connectButton.disabled = false;
  disconnectButton.disabled = true;
  callButton.disabled = true;
  unsetVideoStream(localVideo);
  unsetVideoStream(remoteVideo);
  peerConnection.close();
  peerConnection = null;
  remoteStream = new MediaStream();
  setVideoStream(remoteVideo, remoteStream);
  pushPeerMessage("disconnect", {});
}

function receiveRemote(offer) {
  let remoteDescription = new RTCSessionDescription(offer);
  peerConnection.setRemoteDescription(remoteDescription);
}

async function answerCall(offer) {
  receiveRemote(offer);
  let answer = await peerConnection.createAnswer();
  peerConnection
    .setLocalDescription(answer)
    .then(() =>
      pushPeerMessage("video-answer", peerConnection.localDescription)
    );
}

channel.on("peer-message", (payload) => {
  const message = JSON.parse(payload.body);
  switch (message.type) {
    case "video-offer":
      log("offered: ", message.content);
      answerCall(message.content);
      break;
    case "video-answer":
      log("answered: ", message.content);
      receiveRemote(message.content);
      break;
    case "ice-candidate":
      log("candidate: ", message.content);
      let candidate = new RTCIceCandidate(message.content);
      peerConnection
        .addIceCandidate(candidate)
        .catch(reportError("adding and ice candidate"));
      break;
    case "disconnect":
      disconnect();
      break;
    default:
      reportError("unhandled message type")(message.type);
  }
});

function setVideoStream(videoElement, stream) {
  console.log("set");
  videoElement.srcObject = stream;
}

function unsetVideoStream(videoElement) {
  if (videoElement.srcObject) {
    videoElement.srcObject.getTracks().forEach((track) => track.stop());
  }
  videoElement.removeAttribute("src");
  videoElement.removeAttribute("srcObject");
}

const reportError = (where) => (error) => {
  console.error(where, error);
};

function log() {
  console.log(...arguments);
}
