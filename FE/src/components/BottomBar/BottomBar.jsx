import React, { useEffect, useRef, useState } from "react";
import {
  microphone,
  camera,
  emotion,
  sharescreen,
  hand,
  call,
  lockmicrophone,
  lockcamera,
  large,
  whiteboard,
} from "../../assets/icon";
import { v4 as uuidv4 } from "uuid";
import { forwardRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const BottomBar = forwardRef(function (
  {
    ToggleMicrophone,
    setMicrophone,
    ToggleCamera,
    setCamera,
    localStream,
    localPeerId,
    roomId,
    socket,
    setShareScreen,
    peerConnections,
    offerOptions,
    mediaConstraints,
    name,
    iceServers,
    participants,
    setPeerConnections,
    peerConnectionsShare,
    setPeerConnectionsShare,
    shareStream,
    shareScreen,
    toggleHand,
    toggleToast,
    peerConnectionsOwnerShare,
    setPeerConnectionsOwnerShare,
    microphoneToggle,
    checkOwnerInRoom,
    cameraToggle,
    shareToggle,
    toggleShare,
    setToggleShare,
    fullScreen,
    setFullScreen,
    canvas,
    setCanvas,
    ctx,
    setCtx,
    isDrawing,
    setIsDrawing,
  },
  ref,
) {
  // const shareStream = useRef();
  // const [toggleShare, setToggleShare] = useState(false);
  const navigate = useNavigate();
  const [toggleWhiteboard, setToggleWhiteboard] = useState(false);
  const trackShare = useRef(false);
  // const [canvas, setCanvas] = useState(() =>
  //   document.querySelector("#whiteboard"),
  // );
  // const [ctx, setCtx] = useState(() => canvas?.getContext("2d"));
  // const canvas = document.querySelector("#whiteboard");
  // const ctx = canvas.getContext("2d");

  const handleMicrophone = () => {
    console.log(localStream);
    const audioTrack = localStream.current
      .getTracks()
      .find((track) => track.kind === "audio");
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicrophone(audioTrack.enabled);
      console.log(localPeerId.current);
      console.log(roomId.current);
      socket.emit("toggleMicrophone", {
        roomId: roomId.current,
        peerUUID: localPeerId.current,
        audioTrack: audioTrack.enabled,
      });
    }
  };

  const handleCamera = () => {
    const videoTrack = localStream.current
      .getTracks()
      .find((track) => track.kind === "video");
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamera(videoTrack.enabled);
      socket.emit("toggleCamera", {
        roomId: roomId.current,
        peerUUID: localPeerId.current,
        videoTrack: videoTrack.enabled,
      });
    }
  };

  const handleToggleShareScreen = async () => {
    if (!toggleShare) {
      const arrsocketid = Object.keys(peerConnections);
      if (arrsocketid.length != 0) {
        console.log("All current Peer" + arrsocketid);
        await setScreenStream(mediaConstraints, arrsocketid.length);
        if (shareStream.current != null) {
          setLocalShareScreen(localPeerId.current);
          for (let index = 0; index < arrsocketid.length; index++) {
            const socket = arrsocketid[index];
            if (socket != localPeerId.current) {
              peerConnectionsOwnerShare[socket] = new RTCPeerConnection(
                iceServers,
              );
              addScreenTracks(peerConnectionsOwnerShare[socket]);
              peerConnectionsOwnerShare[socket].oniceconnectionstatechange = (
                event,
              ) => checkPeerShareDisconnect(event, socket);
              peerConnectionsOwnerShare[socket].onicecandidate = (event) =>
                sendShareIceCandidate(event, socket);
              await createOfferShare(
                peerConnectionsOwnerShare[socket],
                socket,
                name,
              );
              setPeerConnectionsOwnerShare({
                ...peerConnectionsOwnerShare,
                [socket]: peerConnectionsOwnerShare[socket],
              });
              trackShare.current = true;
            }
          }
          setToggleShare(true);
          const sharescreen = document.querySelector(".sharescreen");
          sharescreen.classList.add(
            "cursor-not-allowed",
            "disabled",
            "opacity-25",
          );
        }
      } else {
        toast.error("Ít nhất 2 người trong phòng");
      }
    }
  };

  const handleToggleRaiseYourHand = async () => {
    toggleHand.current = !toggleHand.current;
    socket.emit("raisehand", {
      name: name,
      roomId: roomId.current,
      peerId: localPeerId.current,
    });
  };

  async function stopScreenSharing() {
    // shareStream.current.getTracks().forEach((track) => track.stop());
    // shareStream.current = null;
    const divLocalStream = document.getElementById(
      "remoteshare_" + localPeerId.current,
    );
    console.log(divLocalStream);
    if (divLocalStream) {
      try {
        const arrsocketid = Object.keys(peerConnectionsOwnerShare);
        for (let index = 0; index < arrsocketid.length; index++) {
          const socket = arrsocketid[index];
          if (peerConnectionsOwnerShare[socket]) {
            await peerConnectionsOwnerShare[socket].close();
            delete peerConnectionsOwnerShare[socket];
          }
        }
        // Clear the peerConnectionsShare state
        shareStream.current = null;
        setPeerConnectionsOwnerShare(peerConnectionsOwnerShare);
        console.log("Da vao roi");
        divLocalStream.remove();
      } catch (error) {
        console.log(error);
      }
    }
    const sharescreen = document.querySelector(".sharescreen");
    sharescreen.classList.remove(
      "cursor-not-allowed",
      "disabled",
      "opacity-25",
    );
    setToggleShare(false);
    setFullScreen(false);
    const videoChatContainer = document.getElementById("videoChatContainer");
    Array.from(videoChatContainer.children).forEach((child) => {
      if (child.classList.contains("!max-h-[50%]")) {
        child.classList.remove("!max-h-[50%]");
        if (videoChatContainer.classList.contains("flex-wrap")) {
          videoChatContainer.classList.remove("flex-wrap");
        }
      }
      if (child.classList.contains("!max-w-[25%]")) {
        child.classList.remove("!max-w-[25%]");
      }
    });
    console.log(roomId.current);
    socket.emit("webrtc_toggle_sharescreen", {
      roomId: roomId.current,
      senderId: localPeerId.current,
    });
  }

  async function createOfferShare(rtcPeerConnection, socketId, name) {
    let sessionDescription;
    try {
      sessionDescription = await rtcPeerConnection.createOffer(offerOptions);
      rtcPeerConnection.setLocalDescription(sessionDescription);
    } catch (error) {
      console.error(error);
    }

    // console.log(`Sending offer share from peer ${socketId}`);
    console.log(`${localPeerId.current} in Room ${roomId.current}`);
    socket.emit("webrtc_offer_sharescreeen", {
      type: "webrtc_offer_sharescreeen",
      sdp: sessionDescription,
      roomId: roomId.current,
      receiverId: socketId,
      senderId: localPeerId.current,
      name: name,
    });
  }

  function checkPeerShareDisconnect(event, remotePeerId) {
    var state = peerConnectionsOwnerShare[remotePeerId].iceConnectionState;
    console.log(`connection with peer ${remotePeerId}: ${state}`);
    if (state === "failed" || state === "closed" || state === "disconnected") {
      console.log(`Peer ${remotePeerId} has disconnected`);
      const divDisconnected = document.getElementById(
        "remoteshare_" + remotePeerId,
      );
      if (divDisconnected) divDisconnected.remove();
    }
  }

  async function setScreenStream(mediaConstraints, length) {
    console.log("Screen stream set");
    let stream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia(mediaConstraints);
    } catch (error) {
      console.error("Could not get display media", error);
    }
    if (typeof stream != "undefined") {
      console.log(stream);
      shareStream.current = stream;
    } else {
      shareStream.current = null;
    }
  }

  function sendShareIceCandidate(event, remotePeerId) {
    if (event.candidate) {
      console.log(`Sending ICE Candidate from peer ${localPeerId.current}`);
      socket.emit("webrtc_ice_candidate_sharescreen", {
        receiverId: remotePeerId,
        senderId: localPeerId.current,
        roomId: roomId.current,
        label: event.candidate.sdpMLineIndex,
        candidate: event.candidate.candidate,
      });
    }
  }

  function setLocalShareScreen(localshareID) {
    if (ref.current.children.length < 1) {
      console.log("Track Share Screen");
      const div = document.createElement("div");
      div.id = "remoteshare_" + localshareID;
      div.classList.add(
        "relative",
        "max-h-full",
        "max-w-full",
        "min-h-[200px]",
        "min-w-[250px]",
      );
      const videoEle = document.createElement("video");
      videoEle.srcObject = shareStream.current;
      videoEle.setAttribute("autoPlay", "");
      videoEle.classList.add("h-full", "w-full", "px-2", "py-3");
      const spanEle = document.createElement("span");
      spanEle.classList.add(
        "absolute",
        "bottom-5",
        "left-4",
        "text-lg",
        "font-semibold",
        "text-white",
      );
      spanEle.textContent = name;
      const img = document.createElement("img");
      img.src = large;
      img.classList.add(
        "absolute",
        "top-[50%]",
        "-translate-y-[50%]",
        "left-[50%]",
        "h-[50px]",
        "w-[50px]",
        "opacity-0",
        "hover:opacity-100",
      );
      img.addEventListener("click", handleClickLarge);

      div.appendChild(videoEle);
      div.appendChild(spanEle);
      div.appendChild(img);
      const videoChatContainer = document.getElementById("videoChatContainer");
      ref.current.append(div);
    } else {
      console.log("Track Share Screen");
      const div = document.createElement("div");
      div.id = "remoteshare_" + localshareID;
      div.classList.add(
        "relative",
        "rounded-lg",
        "overflow-hidden",
        "max-w-[33%]",
        "basis-[33%]",
      );
      const videoEle = document.createElement("video");
      videoEle.srcObject = shareStream.current;
      videoEle.setAttribute("autoPlay", "");
      videoEle.classList.add("h-full", "w-full", "object-cover", "rounded-lg");
      const spanEle = document.createElement("span");
      spanEle.classList.add(
        "absolute",
        "bottom-5",
        "left-4",
        "text-lg",
        "font-semibold",
        "text-white",
        "overflow-hidden",
        "overflow-ellipsis",
        "whitespace-nowrap",
        "w-full",
      );
      spanEle.textContent = name;
      const img = document.createElement("img");
      img.src = large;
      img.classList.add(
        "absolute",
        "top-[50%]",
        "-translate-y-[50%]",
        "left-[50%]",
        "h-[50px]",
        "w-[50px]",
        "opacity-0",
        "hover:opacity-100",
      );
      img.addEventListener("click", handleClickLarge);
      div.appendChild(videoEle);
      div.appendChild(spanEle);
      div.appendChild(img);

      const videoChatContainer = document.getElementById("videoChatContainer");
      videoChatContainer.append(div);
    }
    // const div = document.createElement("div");
    // div.id = "remoteshare_" + localshareID;
    // div.classList.add("relative", "h-full");
    // const videoEle = document.createElement("video");
    // videoEle.srcObject = shareStream.current;
    // videoEle.setAttribute("autoPlay", "");
    // videoEle.classList.add("h-full", "w-full", "px-2", "py-3");
    // const spanDiv = document.createElement("span");
    // spanDiv.classList.add(
    //   "absolute",
    //   "bottom-5",
    //   "left-4",
    //   "text-lg",
    //   "font-semibold",
    //   "text-white",
    // );
    // spanDiv.textContent = name;
    // div.appendChild(videoEle);
    // div.appendChild(spanDiv);
    // ref.current.append(div);
  }

  function addScreenTracks(rtcPeerConnection) {
    console.log(
      "Trạng thái sau khi tạo mới:" + rtcPeerConnection.signalingState,
    );
    shareStream.current.getTracks().forEach((track) => {
      console.log(track);
      track.onended = () => {
        console.log("Ngừng chia sẻ màn hình");
        stopScreenSharing();
        setToggleShare(false);
      };
      console.log(track);
      rtcPeerConnection.addTrack(track, shareStream.current);
    });
    console.log(rtcPeerConnection);
    console.log("Screen streams added");
  }

  function addScreenTracksAgain(rtcPeerConnection) {
    rtcPeerConnection.getSenders().forEach((sender) => {
      rtcPeerConnection.removeTrack(sender);
    });

    // Add new tracks from shareStream
    shareStream.current.getTracks().forEach((track) => {
      rtcPeerConnection.addTrack(track, shareStream.current);
    });
  }

  const handleDisconnected = async () => {
    const remotePeers = Object.keys(peerConnections);
    for (let index = 0; index < remotePeers.length; index++) {
      const remoteSocket = remotePeers[index];
      if (remoteSocket != localPeerId.current) {
        await peerConnections[remoteSocket].close();
        delete peerConnections[remoteSocket];
        if (checkOwnerInRoom.current == true) {
          if (peerConnectionsOwnerShare[remoteSocket]) {
            peerConnectionsOwnerShare[remoteSocket].close();
            delete peerConnectionsOwnerShare[remoteSocket];
          }
          if (peerConnectionsShare[remoteSocket]) {
            peerConnectionsShare[remoteSocket].close();
            delete peerConnectionsShare[remoteSocket];
          }
        }
      }
    }
    console.log(localPeerId.current);
    if (checkOwnerInRoom.current == false) {
      socket.emit("webrtc_disconnect", {
        roomId: roomId.current,
        senderId: localPeerId.current,
        name,
      });
    } else {
      socket.emit("webrtc_disconnect_owner", {
        roomId: roomId.current,
      });
    }
    console.log("Da Roi Khoi Phong");
    if (checkOwnerInRoom.current == true) {
      setPeerConnectionsOwnerShare(peerConnectionsOwnerShare);
      setPeerConnectionsShare(peerConnectionsShare);
    }
    setPeerConnections(peerConnections);
    navigate("/");
  };

  function handleClickLarge(e) {
    e.preventDefault();
    console.log(ref.current);
    console.log(e.target.parentNode.parentNode);
    const videoChatContainer = document.getElementById("videoChatContainer");
    setFullScreen(false);
    if (Array.from(videoChatContainer.children).length > 0) {
      Array.from(videoChatContainer.children).forEach((child) => {
        if (child.classList.contains("!max-h-[50%]")) {
          child.classList.remove("!max-h-[50%]");
          if (videoChatContainer.classList.contains("flex-wrap")) {
            videoChatContainer.classList.remove("flex-wrap");
          }
        }
        if (child.classList.contains("!max-w-[25%]")) {
          child.classList.remove("!max-w-[25%]");
        }
      });
    }
    if (ref.current.children.length == 0) {
      const childShare = e.target.parentNode;
      childShare.className = "";
      childShare.classList.add(
        "relative",
        "max-h-full",
        "max-w-full",
        "min-h-[200px]",
        "min-w-[250px]",
      );
      ref.current.appendChild(childShare);
      // videoChatContainer.removeChild(e.target.parentNode);
    } else {
      //Click in img in videoChatContainer
      if (e.target.parentNode.parentNode.id != "mainSharescreen") {
        const childShareScreen = ref.current.children[0];
        const childChatContainer = e.target.parentNode;
        ref.current.replaceChild(childChatContainer, childShareScreen);

        childChatContainer.className = "";
        childChatContainer.classList.add(
          "relative",
          "max-h-full",
          "max-w-full",
          "min-h-[200px]",
          "min-w-[250px]",
        );

        childShareScreen.className = "";
        childShareScreen.classList.add(
          "relative",
          "max-w-[33%]",
          "basis-[33%]",
          "overflow-hidden",
          "rounded-lg",
        );
        console.log(e.target.parentNode.parentNode);
        videoChatContainer.appendChild(childShareScreen);
      } else {
        const childShareScreen = ref.current.children[0];
        childShareScreen.className = "";
        childShareScreen.classList.add(
          "relative",
          "max-w-[33%]",
          "basis-[33%]",
          "overflow-hidden",
          "rounded-lg",
        );
        videoChatContainer.appendChild(childShareScreen);
        console.log("davao flex-wrap");

        Array.from(videoChatContainer.children).forEach((child) => {
          child.classList.add("!max-h-[50%]");
          child.classList.add("!max-w-[25%]");
        });
        videoChatContainer.classList.add("flex-wrap");
        setFullScreen(true);
        // mainShareScreen.current.removeChild(childShareScreen);
      }
    }
  }

  const handleWhiteBoard = () => {
    console.log("Whiteboard");
    const whiteboardCont = document.querySelector(".whiteboard-cont");
    const mainShareScreen = document.getElementById("mainSharescreen");
    const videoChatContainer = document.getElementById("videoChatContainer");
    if (whiteboardCont.classList.contains("hidden")) {
      // const canvas = document.querySelector("#whiteboard");
      // const ctx = canvas.getContext("2d");
      // mainShareScreen.classList.add("hidden");
      videoChatContainer.classList.add("hidden");
      Array.from(mainShareScreen.children).length > 0 &&
        mainShareScreen.classList.add("hidden");
      whiteboardCont.classList.remove("hidden");
      const Canvas = document.getElementById("whiteboard");
      console.log(Canvas);
      setCanvas(Canvas);
      setCtx(Canvas.getContext("2d"));
      fitToContainer(Canvas);
      socket.emit("getCanvas", {
        roomId: roomId.current,
      });
      setToggleWhiteboard((prevValue) => !prevValue);
    } else {
      whiteboardCont.classList.add("hidden");
      Array.from(mainShareScreen.children).length > 0 &&
        mainShareScreen.classList.remove("hidden");
      videoChatContainer.classList.remove("hidden");
      setToggleWhiteboard((prevValue) => !prevValue);
    }
  };

  function fitToContainer(canvas) {
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  return (
    <>
      <div
        className="microphone h-[40px] w-[40px] rounded-full bg-[#3c4043] p-[8px]"
        onClick={() => {
          console.log(microphoneToggle);
          if (microphoneToggle == true) {
            handleMicrophone();
          } else if (checkOwnerInRoom.current == true) {
            handleMicrophone();
          }
        }}
      >
        <img
          src={`${ToggleMicrophone == true ? microphone : lockmicrophone}`}
          alt={"Microphone"}
        />
      </div>
      <div
        className="camera h-[40px] w-[40px] rounded-full bg-[#3c4043] p-[8px]"
        onClick={() => {
          if (cameraToggle == true) {
            handleCamera();
          } else if (checkOwnerInRoom.current == true) {
            handleCamera();
          }
        }}
      >
        <img
          src={`${ToggleCamera == true ? camera : lockcamera}`}
          alt={"Camera"}
        />
      </div>
      <div
        className={`h-[40px] w-[40px] rounded-full bg-[#3c4043] p-[8px] ${
          toggleWhiteboard == true ? "opacity-25" : ""
        }`}
        onClick={() => handleWhiteBoard()}
      >
        <img src={whiteboard} alt={"WhiteBoard"} />
      </div>
      <div
        className={`sharescreen relative h-[40px] w-[40px] rounded-full bg-[#3c4043] p-[8px]`}
        onClick={() => {
          console.log(shareToggle, checkOwnerInRoom);
          if (shareToggle == true) {
            handleToggleShareScreen();
          } else if (checkOwnerInRoom.current == true) {
            handleToggleShareScreen();
          }
        }}
      >
        <img src={sharescreen} alt={"ShareScreen"} />
      </div>
      <div
        className={`h-[40px] w-[40px] cursor-pointer rounded-full bg-[#3c4043] p-[8px] ${
          toggleHand.current && "bg-slate-400"
        }`}
        onClick={() => handleToggleRaiseYourHand()}
      >
        <img src={hand} alt={"Hand"} />
      </div>
      <div
        className="h-[40px] w-[40px] rounded-full bg-[#3c4043] p-[8px]"
        onClick={() => handleDisconnected()}
      >
        <img src={call} alt={"Call"} />
      </div>
    </>
  );
});

export default BottomBar;
