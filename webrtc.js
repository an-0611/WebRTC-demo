// webrtc.js

let localStream; // 本地視訊流
let peerConnection; // WebRTC 對等連接物件

// 獲取 HTML 元素
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const startButton = document.getElementById("startButton");
const callButton = document.getElementById("callButton");
const hangupButton = document.getElementById("hangupButton");

// 按鈕點擊事件處理
startButton.addEventListener("click", start);
callButton.addEventListener("click", call);
hangupButton.addEventListener("click", hangup);

// 初始化函數，啟動本地視訊
async function start() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideo.srcObject = localStream;
  } catch (err) {
    console.error("Error accessing media devices.", err);
  }
}

// 呼叫對方函數，建立 WebRTC 連接
async function call() {
  // 創建 RTCPeerConnection
  peerConnection = new RTCPeerConnection();

  // 添加本地流到 RTCPeerConnection
  localStream
    .getTracks()
    .forEach((track) => peerConnection.addTrack(track, localStream));

  // 監聽 ICE 候選者
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignal({ ice: event.candidate });
    }
  };

  // 監聽遠端流
  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  // 創建 SDP offer
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  // 發送 SDP offer 到對方
  sendSignal({ sdp: peerConnection.localDescription });
}

// 掛斷通話函數
function hangup() {
  // 關閉本地視訊流
  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
    localVideo.srcObject = null;
  }

  // 關閉遠端視訊流
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
    remoteVideo.srcObject = null;
  }
}

// 傳送信令函數，這裡假設有一個外部的信令服務器處理信令
function sendSignal(message) {
  // 假設這裡是向信令服務器發送信令的代碼，你需要根據實際情況實現
  console.log("Sending signal:", message);
  // signallingChannel.send(JSON.stringify(message));
}

// // 獲取 DOM 元素
// const localVideo = document.getElementById("localVideo");
// const remoteVideo = document.getElementById("remoteVideo");
// const startButton = document.getElementById("startButton");
// const callButton = document.getElementById("callButton");
// const hangupButton = document.getElementById("hangupButton");

// let localStream;
// let pc;

// const configuration = {
//   iceServers: [
//     {
//       urls: "stun:stun.l.google.com:19302",
//     },
//   ],
//   // iceServers 是一個重要的屬性，它告訴 RTCPeerConnection 使用哪些 STUN 或 TURN 伺服器來協助網路穿透和傳輸數據。
//   // iceServers 作用：
//   // (1) ICE (Interactive Connectivity Establishment) 協議
//   //     ICE 是一種用於建立媒體流連接的框架。它幫助客戶端在不同網路環境（如防火牆和 NAT）中尋找和維護連接。
//   // (2) STUN (Session Traversal Utilities for NAT)：
//   //     STUN 伺服器的主要功能是幫助客戶端發現自己的公共 IP 地址和所在的 NAT 類型。這對於穿越 NAT（網絡地址轉換）和防火牆至關重要。
//   //     在這裡，配置中的 urls 指向 Google 的公開 STUN 伺服器 (stun:stun.l.google.com:19302)。
//   //     當 RTCPeerConnection 試圖建立連接時，它會首先向 STUN 伺服器發送請求以獲取其公共 IP 地址和端口。
//   // (3) TURN (Traversal Using Relays around NAT)：
//   //     TURN 伺服器在 STUN 無法建立直接連接的情況下使用。它充當中繼伺服器，允許客戶端通過它轉發媒體流。
//   //     這對於那些無法通過 STUN 連接的情況（例如雙重 NAT）尤其重要。
//   //     在這個配置中，沒有列出任何 TURN 伺服器。根據具體應用場景，如果需要更高的連接成功率，可以添加 TURN 伺服器。

//   // iceServers 配置的工作流程：
//   // (1) 建立連接：當 RTCPeerConnection 尋求建立連接時，它會使用配置中指定的 STUN 伺服器獲取公共 IP 和端口信息。
//   // (2) ICE 候選：基於 STUN 返回的數據，生成 ICE 候選。這些候選會通過信令通道交換，幫助建立點對點連接。
//   // (3) 連接嘗試：RTCPeerConnection 嘗試使用這些候選進行連接。如果 STUN 候選無法建立連接，可以使用 TURN 伺服器（如果配置）進行中繼。
// };

// // 獲取本地視頻流
// startButton.onclick = async () => {
//   localStream = await navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true,
//   });
//   localVideo.srcObject = localStream;
// };

// // 建立 WebRTC 連接
// callButton.onclick = async () => {
//   pc = new RTCPeerConnection(configuration);

//   // 添加本地流到 PeerConnection
//   localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

//   // 設置遠端流
//   pc.ontrack = (event) => {
//     remoteVideo.srcObject = event.streams[0];
//   };

//   // 交換 ICE 候選
//   pc.onicecandidate = (event) => {
//     if (event.candidate) {
//       // 將 ICE 候選傳送給遠端
//       sendSignalingMessage({ type: "candidate", candidate: event.candidate });
//     }
//   };

//   // 創建和交換 offer
//   const offer = await pc.createOffer();
//   await pc.setLocalDescription(offer);
//   sendSignalingMessage({ type: "offer", offer: offer });
// };

// // 接收並設置 answer
// async function handleAnswer(answer) {
//   const remoteDesc = new RTCSessionDescription(answer);
//   await pc.setRemoteDescription(remoteDesc);
// }

// // 接收並添加 ICE 候選
// async function handleCandidate(candidate) {
//   await pc.addIceCandidate(new RTCIceCandidate(candidate));
// }

// // 處理信令消息
// function sendSignalingMessage(message) {
//   // 這裡需要實現一個信令服務器來交換消息
//   // 例如使用 WebSocket 或其他方法
// }

// // 挂斷通話
// hangupButton.onclick = () => {
//   pc.close();
//   pc = null;
// };
