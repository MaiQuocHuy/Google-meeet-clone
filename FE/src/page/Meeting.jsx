import React, { useEffect, useRef, useState } from "react";
import { iconsBox, iconsFunc } from "../data";
import {
  IconBox,
  IconFunc,
  RoomChat,
  RoomDetail,
  RoomPeople,
  RoomSetting,
} from "../components";
import BottomBar from "../components/BottomBar/BottomBar";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  eraser,
  large,
  lockcamera,
  lockmicrophone,
  microphone as microphoneImg,
  trash,
} from "../assets/icon";

import { useAuth } from "../context/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { useOwner } from "../context/owner";
import { useJoin } from "../context/join";
import { useSocket } from "../context/socket";
import { useLayoutEffect } from "react";
import Login from "./Login";

const Meeting = () => {
  const socket = useSocket();
  const [join, setJoin] = useJoin();
  const [auth, setAuth] = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [owner, setOwner] = useOwner();
  const { id } = useParams();
  const [displayBox, setDisplayBox] = useState(false);
  const videoLocalName = useRef();
  const [activeComponent, setActiveComponent] = useState(0);
  const [gridCols, setGridCols] = useState([1]);
  const [microphone, setMicrophone] = useState(true);
  const [camera, setCamera] = useState(true);
  const [shareScreen, setShareScreen] = useState(false);
  const videoChatContainer = useRef();
  const videoLocal = useRef();
  const participants = useRef(1);
  const [participantsDetail, setParticipantsDetail] = useState([]);
  const currentLocation = useRef(false);
  const [mediaConstraints, setMediaConstraints] = useState({
    audio: true,
    video: true,
  });

  const [offerOptions, setOfferOptions] = useState({
    offerToReceiveVideo: 1,
    offerToReceiveAudio: 1,
  });
  const [animation, setAnimation] = useState(false);
  const [checkExistRaiseHand, setCheckExistRaiseHand] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [peerConnections, setPeerConnections] = useState({});
  const [peerConnectionsShare, setPeerConnectionsShare] = useState({});
  const [peerConnectionsOwnerShare, setPeerConnectionsOwnerShare] = useState(
    {},
  );

  const [shareToggle, setShareToggle] = useState(false);
  const [microphoneToggle, setMicrophoneToggle] = useState(false);
  const [cameraToggle, setCameraToggle] = useState(false);
  const [chatToggle, setChatToggle] = useState(false);

  const mainShareScreen = useRef();
  const localPeerId = useRef();
  const localStream = useRef();
  const roomId = useRef(id);
  const shareStream = useRef();
  const toggleHand = useRef(false);
  const [peopleWaiting, setPeopleWaiting] = useState([]);
  const checkOwnerInRoom = useRef(false);
  //sharescreenOwner not permission
  const [toggleShare, setToggleShare] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };
  const [fullScreen, setFullScreen] = useState(false);

  const [canvas, setCanvas] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(0);
  const [cursor, setCursor] = useState({
    offsetX: 0,
    offsetY: 0,
  });
  const isDrawingRef = useRef(isDrawing);
  const cursorRef = useRef(cursor);
  const [colorCurrent, setColorCurrent] = useState("black");
  const [drawsize, setDrawsize] = useState(3);
  const colorRef = useRef(colorCurrent);
  const [colorRemote, setColorRemote] = useState("black");
  const [drawsizeRemote, setDrawsizeRemote] = useState(3);
  const colorRemoteRef = useRef(colorRemote);

  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  useEffect(() => {
    cursorRef.current = cursor;
  }, [cursor.offsetX, cursor.offsetY, cursor]);

  useEffect(() => {
    colorRef.current = colorCurrent;
  }, [colorCurrent]);

  useEffect(() => {
    colorRemoteRef.current = colorRemote;
  }, [colorRemote]);

  useEffect(() => {
    const cookieInfo = JSON.parse(getCookie("userInfo"));
    const cookieToken = getCookie("token");
    if (cookieInfo) {
      console.log(cookieInfo);
      setAuth({
        ...auth,
        user: {
          fullName: cookieInfo.fullName,
          avatar: cookieInfo.avatar,
          userId: cookieInfo.userId,
        },
        token: cookieToken,
      });
    } else if (!cookieToken) {
      navigate("/login");
    }
  }, []);

  const getCookie = (cookieName) => {
    return Cookies.get(cookieName) || null;
  };

  useEffect(() => {
    if (peerConnectionsOwnerShare.size == 0 && peerConnectionsShare.size == 0) {
      if (Array.from(videoChatContainer.children).length > 0) {
        Array.from(videoChatContainer.children).forEach((child) => {
          if (child.classList.contains("max-h-[50%]")) {
            child.classList.remove("max-h-[50%]");
          }
        });
      }
    }
  }, [peerConnectionsOwnerShare, peerConnectionsShare]);

  function resetHeight() {}

  useEffect(() => {
    if (peerConnectionsOwnerShare || peerConnectionsShare) {
      console.log(
        JSON.stringify(peerConnectionsOwnerShare) + "Owner",
        JSON.stringify(peerConnectionsShare) + "Remote",
        "Kiem tra",
      );
    }
  }, [peerConnectionsShare, peerConnectionsOwnerShare]);

  useEffect(() => {
    if (owner.isOwner) {
      console.log(owner);
      checkOwnerInRoom.current = true;
      socket.emit("owner_join", {
        room: id,
        userId: auth.user.userId,
        fullName: auth.user.fullName,
        avatar: auth.user.avatar,
      });
      setAnimation(true);
    } else {
      // not owner
      console.log("Kiem tra nguoi vao room");
      if (owner.idOwner) {
        console.log(owner.idOwner);
        console.log(auth.user);
        // checkOwnerInRoom.current = false;
        console.log("Animation:" + animation);
        socket.emit("ask_to_join", {
          room: id,
          userId: auth.user.userId,
          fullName: auth.user.fullName,
          avatar: auth.user.avatar,
          owner: owner.idOwner,
        });
      }
    }
  }, [owner.isOwner || owner.idOwner]);

  useEffect(() => {
    if (auth.user.fullName && auth.token) {
      console.log(auth.token);
      roomId.current = id;
      console.log(location);
      if (
        location?.state?.owner == "owner" &&
        location?.state?.pathName == "/"
      ) {
        setAnimation(true);
        checkOwnerInRoom.current = true;
        socket.emit("newRoom", {
          room: id,
          owner: auth.user.userId,
          fullName: auth.user.fullName,
          avatar: auth.user.avatar,
        });
      } else if (owner.isOwner) {
        checkOwnerInRoom.current = true;
        setAnimation(true);
      } else if (location?.state?.pathName != "/join-meeting/" + id) {
        navigate(`/join-meeting/${id}`);
      }
      // else {
      //   if (join.length > 0) {
      //     const idFind = join.findIndex(
      //       (item) => item.idMeeting == id && item.isMeeting,
      //     );
      //     if (idFind == -1) {
      //       navigate(`/join-meeting/${id}`);
      //     }
      //   }
      // }
    }
  }, [auth.user.fullName || auth.token || owner.isOwner || owner.idOwner]);

  useEffect(() => {
    socket.on("reject_join", async (event) => {
      console.log("Da tu choi roi nhe");
      alert("Da tu choi roi nhe");
      setTimeout(() => {
        navigate(`/join-meeting/${id}`);
      }, 3000);
    });
    return () => {
      socket.off("reject_join");
    };
  }, []);

  useEffect(() => {
    socket.on("accept_join", async (event) => {
      console.log("Da Chap Nhan roi nhe");
      setAnimation(true);
      checkOwnerInRoom.current = false;
      setJoin([...join, { idMeeting: id, isMeeting: true }]);
      socket.emit("join", {
        room: id,
        userId: auth.user.userId,
        fullName: auth.user.fullName,
        avatar: auth.user.avatar,
      });
    });
    return () => {
      socket.off("accept_join");
    };
  }, [auth.user.fullName || auth.token]);

  useEffect(() => {
    if (participants.current) {
      console.log(participants.current);
    }
  }, [participants.current]);

  useEffect(() => {
    if (localPeerId.current && localStream.current) {
      let flag = false;
      if (peerConnections.length > 0) {
        const rtcPeerConnections = Object.keys(peerConnections);
        rtcPeerConnections.forEach((peerId) => {
          if (peerId != localPeerId.current) {
            if (peerConnections[peerId].iceConnectionState == "connected") {
              flag = true;
            }
          }
        });
        if (flag) {
          console.log("Da vao roi nghe");
          if (location?.state?.microphone) {
            const audioTrack = localStream.current
              .getTracks()
              .find((track) => track.kind === "audio");
            if (audioTrack) {
              audioTrack.enabled = !audioTrack.enabled;
              setMicrophone(audioTrack.enabled);
              socket.emit("toggleMicrophone", {
                roomId: roomId.current,
                peerUUID: localPeerId.current,
                audioTrack: audioTrack.enabled,
              });
            }
          }
          if (location?.state?.camera) {
            const videoTrack = localStream.current
              .getTracks()
              .find((track) => track.kind === "video");
            if (videoTrack) {
              videoTrack.enabled = !videoTrack.enabled;
              setCamera(videoTrack.enabled);
              socket.emit("toggleCamera", {
                roomId: roomId.current,
                peerUUID: localPeerId.current,
                audioTrack: videoTrack.enabled,
              });
            }
          }
          const updatedLocation = { ...location, state: undefined };
          navigate(updatedLocation, { replace: true });
        }
      }
    }
  }, [peerConnections]);

  useEffect(() => {
    socket.on("room_created", async (event) => {
      console.log(event);
      localPeerId.current = event.peerId;
      videoLocalName.current.textContent = auth.user.fullName;
      document.querySelector(".roomId").textContent = event.room.roomId;
      document.querySelector(
        ".timeReal",
      ).textContent = `${currentTime.getHours()}:${currentTime.getMinutes()}`;
      console.log(new RTCPeerConnection(iceServers));
      console.log(`Current peer ID: ${localPeerId.current}`);
      console.log(
        `Socket event callback: room_created with by peer ${localPeerId.current}, created room ${event.roomId}`,
      );
      await setLocalStream(mediaConstraints);
      setCameraToggle(event.room.permissionVideo == 1 ? true : false);
      setMicrophoneToggle(event.room.permissionMicrophone == 1 ? true : false);
      setShareToggle(event.room.permissionShareScreen == 1 ? true : false);
      setChatToggle(event.room.permissionChat == 1 ? true : false);
    });
    return () => {
      socket.off("room_created");
    };
  }, [animation]);

  useEffect(() => {
    socket.on("room_joined", async (event) => {
      localPeerId.current = event.peerId;
      console.log(`Current peer ID: ${localPeerId.current}`);
      console.log(
        `Socket event callback: room_joined by peer ${localPeerId.current}, joined room ${event.roomId} with ${event.name}`,
      );
      console.log(`Emit start_call from peer ${localPeerId.current}`);
      videoLocalName.current.textContent = event.fullName;
      document.querySelector(".roomId").textContent = event.room.roomId;
      document.querySelector(
        ".timeReal",
      ).textContent = `${currentTime.getHours()}:${currentTime.getMinutes()}`;
      await setLocalStream(mediaConstraints);
      setCameraToggle(event.room.permissionVideo == 1 ? true : false);
      setMicrophoneToggle(event.room.permissionMicrophone == 1 ? true : false);
      setShareToggle(event.room.permissionShareScreen == 1 ? true : false);
      setChatToggle(event.room.permissionChat == 1 ? true : false);
      socket.emit("start_call", {
        roomId: event.roomId,
        senderId: localPeerId.current,
        name: event.fullName,
      });
    });
    return () => {
      socket.off("room_joined");
    };
  }, [animation]);

  useEffect(() => {
    socket.on("getCanvas", (url) => {
      let img = new Image();
      img.onload = start;
      img.src = url;
      function start() {
        ctx.drawImage(img, 0, 0);
      }
    });
    return () => {
      socket.off("getCanvas");
    };
  }, [canvas, ctx]);

  useEffect(() => {
    socket.on("start_call", async (event) => {
      console.log("event.shareSreen");
      const remotePeerId = event.senderId;
      const nameSender = event.name;
      console.log("Name Join:" + nameSender);
      console.log(
        `Socket event callback: start_call. RECEIVED from ${remotePeerId}`,
      );
      peerConnections[remotePeerId] = new RTCPeerConnection(iceServers);

      console.log(peerConnections[remotePeerId]);
      addLocalTracks(peerConnections[remotePeerId]);
      peerConnections[remotePeerId].ontrack = (event) =>
        setRemoteStream(event, remotePeerId, nameSender);
      peerConnections[remotePeerId].oniceconnectionstatechange = (event) => {
        console.log("Kiem tra lai peer");
        checkPeerDisconnect(event, remotePeerId);
      };
      peerConnections[remotePeerId].onicecandidate = (event) =>
        sendIceCandidate(event, remotePeerId);
      await createOffer(
        peerConnections[remotePeerId],
        remotePeerId,
        auth.user.fullName,
      );
      setPeerConnections({
        ...peerConnections,
        [remotePeerId]: peerConnections[remotePeerId],
      });
    });
    return () => {
      socket.off("start_call");
    };
  }, [auth.user.fullName || auth.token, animation, peerConnections]);

  useEffect(() => {
    socket.on("start_share", async (event) => {
      if (shareStream.current != null) {
        const remotePeerId = event.senderId;
        console.log("Name of local:" + auth.user.fullName);
        console.log(
          `Socket event callback: start_share. RECEIVED from ${remotePeerId}`,
        );
        peerConnectionsOwnerShare[remotePeerId] = new RTCPeerConnection(
          iceServers,
        );
        addScreenTracks(peerConnectionsOwnerShare[remotePeerId]);
        peerConnectionsOwnerShare[remotePeerId].oniceconnectionstatechange = (
          event,
        ) => checkPeerShareDisconnect(event, remotePeerId);
        peerConnectionsOwnerShare[remotePeerId].onicecandidate = (event) =>
          sendShareIceCandidate(event, remotePeerId);
        await createOfferShare(
          peerConnectionsOwnerShare[remotePeerId],
          remotePeerId,
          auth.user.fullName,
        );

        setPeerConnectionsShare({
          ...peerConnectionsOwnerShare,
          [remotePeerId]: peerConnectionsOwnerShare[remotePeerId],
        });
      }
    });
    return () => {
      socket.off("start_share");
    };
  }, [
    auth.user.fullName,
    animation,
    peerConnectionsShare,
    peerConnectionsOwnerShare,
  ]);

  useEffect(() => {
    socket.on("webrtc_toggle_sharescreen", async (event) => {
      const remotePeerId = event.senderId;
      console.log(
        `Socket event callback: webrtc_toggle_sharescreen. RECEIVED from ${remotePeerId}`,
      );
      const divRemoteShare = document.getElementById(
        "remoteshare_" + remotePeerId,
      );
      if (divRemoteShare) divRemoteShare.remove();
      if (peerConnectionsShare[remotePeerId]) {
        await peerConnectionsShare[remotePeerId].close();
        delete peerConnectionsShare[remotePeerId];
      }
      setPeerConnectionsShare(peerConnectionsShare);
    });

    return () => {
      socket.off("webrtc_toggle_sharescreen");
    };
  }, [animation, peerConnectionsShare]);

  useEffect(() => {
    socket.on("toggleRaiseYourHand", async (event) => {
      const remotePeerId = event.senderId;
      const remoteName = event.senderName;
      toggleToast(remotePeerId, remoteName);
    });
    return () => {
      socket.off("toggleRaiseYourHand");
    };
  }, []);

  useEffect(() => {
    socket.on("start_raisehand", async (event) => {
      console.log("Start_raise_hand");
      const remotePeerId = event.senderId;
      const remoteName = event.senderName;
      toggleToast(remotePeerId, remoteName);
    });
    return () => {
      socket.off("start_raisehand");
    };
  }, [animation]);

  useEffect(() => {
    socket.on("ask_to_join", async (event) => {
      console.log(event);
      // const remotePeerId = event.peerId;
      // const remoteUserId = event.userId;
      // const fullName = event.fullName;
      // const avatar = event?.avatar;
      toast("Someone comes in", {
        toastId: event.peerId,
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });

      setPeopleWaiting([
        ...peopleWaiting,
        {
          fullName: event.fullName,
          avatar: event.avatar,
          userId: event.userId,
          peerId: event.peerId,
        },
      ]);
    });
    return () => {
      socket.off("ask_to_join");
    };
  }, [owner.isOwner || owner.idOwner]);

  useEffect(() => {
    socket.on("update_participants", async (event) => {
      console.log("Update Participant" + event.roomParticipants);
      setParticipantsDetail(event.roomParticipants);
    });
    return () => {
      socket.off("update_participants");
    };
  }, [participantsDetail]);

  async function createOfferShare(rtcPeerConnection, socketId, name) {
    let sessionDescription;
    try {
      sessionDescription = await rtcPeerConnection.createOffer(offerOptions);
      rtcPeerConnection.setLocalDescription(sessionDescription);
    } catch (error) {
      console.error(error);
    }

    console.log(`Sending offer share from peer ${socketId}`);
    console.log(`${localPeerId.current}`);
    socket.emit("webrtc_offer_sharescreeen", {
      type: "webrtc_offer_sharescreeen",
      sdp: sessionDescription,
      roomId: roomId.current,
      receiverId: socketId,
      senderId: localPeerId.current,
      name: name,
    });
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

  function addScreenTracks(rtcPeerConnection) {
    shareStream.current.getTracks().forEach((track) => {
      console.log(track);
      rtcPeerConnection.addTrack(track, shareStream.current);
    });
    console.log(rtcPeerConnection);
    console.log("Screen streams added");
  }

  useEffect(() => {
    socket.on("webrtc_offer", async (event) => {
      console.log(
        `Socket event callback: webrtc_offer. RECEIVED from ${event.senderId} and ${event.name}`,
      );
      const remotePeerId = event.senderId;
      const nameSender = event.name;
      peerConnections[remotePeerId] = new RTCPeerConnection(iceServers);
      console.log(new RTCSessionDescription(event.sdp));
      peerConnections[remotePeerId].setRemoteDescription(
        new RTCSessionDescription(event.sdp),
      );

      console.log(
        `Remote description set on peer ${localPeerId.current} after offer received`,
      );
      addLocalTracks(peerConnections[remotePeerId]);
      peerConnections[remotePeerId].ontrack = (event) => {
        setRemoteStream(event, remotePeerId, nameSender);
      };
      peerConnections[remotePeerId].oniceconnectionstatechange = (event) => {
        console.log("Kiem tra lai peer");
        checkPeerDisconnect(event, remotePeerId);
      };
      peerConnections[remotePeerId].onicecandidate = (event) =>
        sendIceCandidate(event, remotePeerId);
      await createAnswer(peerConnections[remotePeerId], remotePeerId);
      setPeerConnections({
        ...peerConnections,
        [remotePeerId]: peerConnections[remotePeerId],
      });
    });

    return () => {
      socket.off("webrtc_offer");
    };
  }, [auth.user.fullName || auth.token, peerConnections]);

  useEffect(() => {
    socket.on("webrtc_answer", async (event) => {
      console.log(
        `Socket event callback: webrtc_answer. RECEIVED from ${event.senderId}`,
      );

      console.log(
        `Remote description set on peer ${localPeerId} after answer received`,
      );
      peerConnections[event.senderId].setRemoteDescription(
        new RTCSessionDescription(event.sdp),
      );
      console.log(new RTCSessionDescription(event.sdp));
      setPeerConnections({
        ...peerConnections,
        [event.senderId]: peerConnections[event.senderId],
      });
    });

    return () => {
      socket.off("webrtc_answer");
    };
  }, [peerConnections]);

  useEffect(() => {
    socket.on("webrtc_ice_candidate", (event) => {
      const senderPeerId = event.senderId;
      console.log(
        `Socket event callback: webrtc_ice_candidate. RECEIVED from ${senderPeerId}`,
      );

      // ICE candidate configuration.
      let candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate,
      });
      peerConnections[senderPeerId].addIceCandidate(candidate);
      setPeerConnections({
        ...peerConnections,
        [senderPeerId]: peerConnections[senderPeerId],
      });
    });
    return () => {
      socket.off("webrtc_ice_candidate");
    };
  }, [peerConnections]);

  useEffect(() => {
    socket.on("webrtc_ice_candidate_sharescreen", (event) => {
      try {
        const senderPeerId = event.senderId;
        console.log(
          `Socket event callback: webrtc_ice_candidate_sharescreen. RECEIVED from ${senderPeerId}`,
        );

        // ICE candidate configuration.
        let candidate = new RTCIceCandidate({
          sdpMLineIndex: event.label,
          candidate: event.candidate,
        });
        console.log(peerConnectionsShare[senderPeerId]);
        peerConnectionsShare[senderPeerId].addIceCandidate(candidate);
        setPeerConnectionsShare({
          ...peerConnectionsShare,
          [senderPeerId]: peerConnectionsShare[senderPeerId],
        });
      } catch (error) {
        console.log(error);
      }
    });
    return () => {
      socket.off("webrtc_ice_candidate_sharescreen");
    };
  }, [peerConnectionsShare]);

  useEffect(() => {
    socket.on("webrtc_offer_sharescreeen", async (event) => {
      console.log(
        `Socket event callback: webrtc_offer_sharescreeen. RECEIVED from ${event.senderId} `,
      );
      // console.log(peerConnectionsShare[event.senderId] + "Sender");
      const senderId = event.senderId;
      const name = event.name;
      peerConnectionsShare[senderId] = new RTCPeerConnection(iceServers);
      // console.log(new RTCSessionDescription(event.sdp));
      peerConnectionsShare[senderId].setRemoteDescription(
        new RTCSessionDescription(event.sdp),
      );
      console.log(
        `Remote description set on peer ${localPeerId.current} after offer received`,
      );
      // addLocalTracks(peerConnectionsShare[senderId]);
      console.log(peerConnectionsShare[senderId]);

      peerConnectionsShare[senderId].ontrack = (event) => {
        console.log("Davao");
        setRemoteShareScreen(event, senderId, name);
      };
      peerConnectionsShare[senderId].oniceconnectionstatechange = (event) =>
        checkPeerShareDisconnect(event, senderId);
      peerConnectionsShare[senderId].onicecandidate = (event) =>
        sendShareIceCandidate(event, senderId);
      await createAnswerOfferShare(peerConnectionsShare[senderId], senderId);
      setPeerConnectionsShare({
        ...peerConnectionsShare,
        [senderId]: peerConnectionsShare[senderId],
      });
    });

    return () => {
      socket.off("webrtc_offer_sharescreeen");
    };
  }, [peerConnectionsShare]);

  useEffect(() => {
    socket.on("webrtc_answer_sharescreen", async (event) => {
      console.log(
        `Socket event callback: webrtc_answer_sharescreen. RECEIVED from ${event.senderId}`,
      );

      console.log(
        `Remote description set on peer ${localPeerId.current} after answer received`,
      );
      console.log(peerConnectionsOwnerShare[event.senderId]);
      peerConnectionsOwnerShare[event.senderId].setRemoteDescription(
        new RTCSessionDescription(event.sdp),
      );

      setPeerConnectionsOwnerShare({
        ...peerConnectionsOwnerShare,
        [event.senderId]: peerConnectionsOwnerShare[event.senderId],
      });
    });

    return () => {
      socket.off("webrtc_answer_sharescreen");
    };
  }, [peerConnectionsOwnerShare]);

  useEffect(() => {
    socket.on("toggleMicrophone", (event) => {
      const audioTrack = event.audioTrack;
      const remotePeerId = event.senderId;
      const divRemotePeer = document.getElementById(
        "remotevideo_" + remotePeerId,
      );
      if (divRemotePeer) {
        const img = divRemotePeer.querySelector("img");
        if (img) {
          img.src = audioTrack ? microphoneImg : lockmicrophone;
        }
      }
    });
    return () => {
      socket.off("toggleMicrophone");
    };
  }, []);

  useEffect(() => {
    socket.on("toggleCamera", (event) => {
      const videoTrack = event.videoTrack;
      const remotePeerId = event.senderId;
      const divRemotePeer = document.getElementById(
        "remotevideo_" + remotePeerId,
      );
      if (divRemotePeer) {
        const video = divRemotePeer.querySelector("video");
        if (video) {
          video.src =
            videoTrack == false &&
            "https://th.bing.com/th/id/OIP.Dy4J_s3zLJxmhXu4k0ISAgHaEo?pid=ImgDet&rs=1";
        }
      }
    });
    return () => {
      socket.off("toggleCamera");
    };
  }, []);

  useEffect(() => {
    socket.on("raisehand", (event) => {
      const peerId = event.peerId;
      const name = event.name;
      if (peerId) {
        console.log(toasts);
        if (toasts.length != 0) {
          const indexToRemove = toasts.findIndex((item) => item === peerId);
          if (indexToRemove != -1) {
            const newToasts = [...toasts];
            newToasts.splice(indexToRemove, 1);
            console.log("Da vao roi nhe");
            toast.dismiss(peerId);
            setToasts(newToasts);
          } else {
            toast(`${name} raised hand`, {
              toastId: peerId,
              position: "top-center",
              autoClose: false,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: false,
            });
            setToasts((prevToasts) => [...prevToasts, peerId]);
          }
        } else {
          console.log(peerId + "Raise hand");
          toast(`${name} raised hand`, {
            toastId: peerId,
            position: "top-center",
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
          });
          setToasts((prevToasts) => [...prevToasts, peerId]);
        }
      }
    });
    return () => {
      socket.off("raisehand");
    };
  }, [toasts]);

  useEffect(() => {
    socket.on("changePermissionToolInRoom", async (event) => {
      console.log(event);
      const typeofTool = event.typeofTool;
      const permission = event.permission;
      const senderId = event.senderId;
      if (typeofTool == 1) {
        // setMicrophoneToggle(permission);
        const audioTrack = localStream.current
          .getTracks()
          .find((track) => track.kind === "audio");

        if (permission == false) {
          audioTrack.enabled = permission;
          setMicrophone(audioTrack.enabled);
          const remotePeerId = Object.keys(peerConnections);
          for (let index = 0; index < remotePeerId.length; index++) {
            const remoteSocket = remotePeerId[index];
            if (remoteSocket && senderId != remoteSocket) {
              const microphone = document.querySelector(".microphone");
              console.log(microphone);
              const divRemotePeer = document.getElementById(
                "remotevideo_" + remoteSocket,
              );
              if (divRemotePeer) {
                const img = divRemotePeer.querySelector("img");
                if (img) {
                  img.src = lockmicrophone;
                  microphone.classList.add(
                    "cursor-not-allowed",
                    "disabled",
                    "opacity-25",
                  );
                }
              }
            }
          }
          setMicrophoneToggle(permission);
        } else {
          console.log("True");
          const microphone = document.querySelector(".microphone");
          microphone.classList.remove(
            "cursor-not-allowed",
            "disabled",
            "opacity-25",
          );
          setMicrophoneToggle(permission);
        }
      } else if (typeofTool == 2) {
        const videoTrack = localStream.current
          .getTracks()
          .find((track) => track.kind === "video");

        if (permission == false) {
          videoTrack.enabled = permission;
          setCamera(videoTrack.enabled);
          const remotePeerId = Object.keys(peerConnections);
          for (let index = 0; index < remotePeerId.length; index++) {
            const remoteSocket = remotePeerId[index];
            if (remoteSocket && senderId != remoteSocket) {
              const camera = document.querySelector(".camera");
              console.log(camera);
              const divRemotePeer = document.getElementById(
                "remotevideo_" + remoteSocket,
              );
              if (divRemotePeer) {
                const video = divRemotePeer.querySelector("video");
                if (video) {
                  video.src =
                    "https://th.bing.com/th/id/OIP.Dy4J_s3zLJxmhXu4k0ISAgHaEo?pid=ImgDet&rs=1";
                  camera.classList.add(
                    "cursor-not-allowed",
                    "disabled",
                    "opacity-25",
                  );
                }
              }
            }
          }
          setCameraToggle(permission);
        } else {
          console.log("True");
          const camera = document.querySelector(".camera");
          camera.classList.remove(
            "cursor-not-allowed",
            "disabled",
            "opacity-25",
          );
          setCameraToggle(permission);
        }
        // setCameraToggle(permission);
      } else if (typeofTool == 3) {
        if (permission == false) {
          const peers = Object.keys(peerConnectionsOwnerShare);
          for (let index = 0; index < peers.length; index++) {
            const peerId = peers[index];
            console.log(peerId + "PeeridOwnerShare");
            if (peerId) {
              // const sharescreen = document.querySelector(".sharescreen");
              if (peerConnectionsOwnerShare[peerId]) {
                await peerConnectionsOwnerShare[peerId].close();
                delete peerConnectionsOwnerShare[peerId];
                // sharescreen.classList.add(
                //   "cursor-not-allowed",
                //   "disabled",
                //   "opacity-25",
                // );
              }
            }
          }
          const peerShare = Object.keys(peerConnectionsShare);
          for (let index = 0; index < peerShare.length; index++) {
            const remotePeerId = peerShare[index];
            if (remotePeerId && remotePeerId != senderId) {
              const divRemoteShare = document.getElementById(
                "remoteshare_" + remotePeerId,
              );
              if (divRemoteShare) divRemoteShare.remove();
              if (peerConnectionsShare[remotePeerId]) {
                await peerConnectionsShare[remotePeerId].close();
                delete peerConnectionsShare[remotePeerId];
              }
            }
          }
          console.log(toggleShare);
          if (toggleShare == true) {
            const divRemoteShare = document.getElementById(
              "remoteshare_" + localPeerId.current,
            );
            if (divRemoteShare) divRemoteShare.remove();
          }
          const sharescreen = document.querySelector(".sharescreen");
          sharescreen.classList.add(
            "cursor-not-allowed",
            "disabled",
            "opacity-25",
          );
          if (shareStream.current != null) {
            shareStream.current.getTracks().forEach((track) => track.stop());
            shareStream.current = null;
          }
          setShareToggle(false);
          setToggleShare(false);
          checkOwnerInRoom.current = false;
          console.log(peerConnectionsOwnerShare + "OwnerShare");
          setPeerConnectionsShare(peerConnectionsShare);
          setPeerConnectionsOwnerShare(peerConnectionsOwnerShare);
        } else {
          console.log("True");
          const sharescreen = document.querySelector(".sharescreen");
          sharescreen.classList.remove(
            "cursor-not-allowed",
            "disabled",
            "opacity-25",
          );
          setToggleShare(false);
          setShareToggle(true);
        }
        // setShareToggle(permission);
      } else if (typeofTool == 4) {
        // setChatToggle(permission);
        console.log(event);
        setChatToggle(permission);
      }
    });
    return () => {
      socket.off("changePermissionToolInRoom");
    };
  }, [
    shareToggle,
    microphoneToggle,
    cameraToggle,
    chatToggle,
    toggleShare,
    peerConnectionsOwnerShare,
    peerConnectionsShare,
  ]);

  useEffect(() => {
    socket.on("message", (event) => {
      const peerId = event.peerId;
      const name = event.name;
      const message = event.message;
      const formatTime = event.formatTime;
      setMessages([
        ...messages,
        {
          peerId,
          name,
          message,
          formatTime,
        },
      ]);
    });
    return () => {
      socket.off("message");
    };
  }, [messages]);

  useEffect(() => {
    // Cập nhật thời gian mỗi giây
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Xóa interval khi component bị hủy
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    socket.on("webrtc_disconnect", async (event) => {
      const senderId = event.senderId;
      if (senderId) {
        await peerConnections[senderId].close();
        delete peerConnections[senderId];
        const divRemotePeer = document.getElementById(
          "remotevideo_" + senderId,
        );
        if (peerConnectionsOwnerShare[senderId]) {
          await peerConnectionsOwnerShare[senderId].close();
          delete peerConnectionsOwnerShare[senderId];
        }
        if (peerConnectionsShare[senderId]) {
          await peerConnectionsShare[senderId].close();
          delete peerConnectionsShare[senderId];
        }
        const divRemotePeerShare = document.getElementById(
          "remoteshare_" + senderId,
        );
        if (divRemotePeerShare) divRemotePeerShare.remove();
        if (divRemotePeer) divRemotePeer.remove();
      }
      console.log(peerConnections);
      console.log("Da xoa thanh cong" + senderId);
      const indexToRemove = participantsDetail.findIndex(
        (item) => item.socketId === senderId,
      );
      if (indexToRemove != -1) {
        participantsDetail.splice(indexToRemove, 1);
      }

      console.log(participantsDetail);
      setPeerConnections(peerConnections);
      setPeerConnectionsOwnerShare(peerConnectionsOwnerShare);
      setPeerConnectionsShare(peerConnectionsShare);
    });
    return () => {
      socket.off("webrtc_disconnect");
    };
  }, [
    peerConnections,
    participantsDetail,
    peerConnectionsOwnerShare,
    peerConnectionsShare,
  ]);

  useEffect(() => {
    socket.on("webrtc_disconnect_owner", async (event) => {
      const arrsocketid = Object.keys(peerConnections);
      for (let index = 0; index < arrsocketid.length; index++) {
        const socket = arrsocketid[index];
        if (socket && peerConnections[socket]) {
          await peerConnections[socket].close();
          delete peerConnections[socket];
          if (peerConnectionsOwnerShare[socket]) {
            await peerConnectionsOwnerShare[socket].close();
            delete peerConnectionsOwnerShare[socket];
          }
          if (peerConnectionsShare[socket]) {
            await peerConnectionsShare[socket].close();
            delete peerConnectionsShare[socket];
          }
          const divRemotePeer = document.getElementById(
            "remotevideo_" + socket,
          );
          const divRemotePeerShare = document.getElementById(
            "remoteshare_" + socket,
          );
          if (divRemotePeerShare) divRemotePeerShare.remove();
          if (divRemotePeer) divRemotePeer.remove();
        }
      }
      setPeerConnections(peerConnections);
      setPeerConnectionsOwnerShare(peerConnectionsOwnerShare);
      setPeerConnectionsShare(peerConnectionsShare);
      navigate("/");
    });
    return () => {
      socket.off("webrtc_disconnect_owner");
    };
  }, [peerConnections, peerConnectionsOwnerShare, peerConnectionsShare]);

  const handleMouseDown = (e) => {
    console.log(isDrawingRef.current, e, "Mouse Down");
    setCursor({
      ...cursorRef.current,
      offsetX: e.offsetX,
      offsetY: e.offsetY,
    });
    setIsDrawing(1);
  };

  const handleMouseMove = (e) => {
    if (isDrawingRef.current === 1) {
      console.log(e, "Mouse move");
      console.log(cursorRef.current, "Mouse Move");
      draw(
        e.offsetX,
        e.offsetY,
        cursorRef.current.offsetX,
        cursorRef.current.offsetY,
      );
      socket.emit(
        "draw",
        e.offsetX,
        e.offsetY,
        cursorRef.current.offsetX,
        cursorRef.current.offsetY,
        colorRef.current,
        drawsize,
        roomId.current,
      );
      setCursor({
        ...cursorRef.current,
        offsetX: e.offsetX,
        offsetY: e.offsetY,
      });
    }
  };

  const handleMouseUp = () => {
    if (isDrawingRef.current === 1) {
      console.log("Mouse Up");
      setIsDrawing(0);
    }
  };

  useEffect(() => {
    if (canvas != null) {
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [canvas]); // No dependencies to avoid unnecessary re-renders

  useEffect(() => {
    socket.on("draw", (newx, newy, oldx, oldy, color, size) => {
      console.log(color, "Draw");
      drawRemote(newx, newy, oldx, oldy, color, size);
    });
    return () => {
      socket.off("draw");
    };
  }, [ctx, canvas]);

  useEffect(() => {
    socket.on("clearBoard", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    return () => {
      socket.off("clearBoard");
    };
  }, [ctx, canvas]);

  function drawRemote(newx, newy, oldx, oldy, color, size) {
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(oldx, oldy);
    ctx.lineTo(newx, newy);
    ctx.stroke();
    ctx.closePath();
  }

  function draw(newx, newy, oldx, oldy) {
    console.log(colorCurrent, newx, "Draw");
    ctx.strokeStyle = colorRef.current;
    ctx.lineWidth = drawsize;
    ctx.beginPath();
    ctx.moveTo(oldx, oldy);
    ctx.lineTo(newx, newy);
    ctx.stroke();
    ctx.closePath();
    socket.emit("store canvas", {
      url: canvas.toDataURL(),
      roomId: roomId.current,
    });
  }

  async function setLocalStream(mediaConstraints) {
    console.log("Local stream set");
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    } catch (error) {
      console.log("Could not get user media", error);
    }

    localStream.current = stream;
    videoLocal.current.srcObject = stream;
  }

  function addLocalTracks(rtcPeerConnection) {
    localStream.current.getTracks().forEach((track) => {
      rtcPeerConnection.addTrack(track, localStream.current);
    });
    console.log("Local tracks added");
  }

  async function createOffer(rtcPeerConnection, remotePeerId, name) {
    let sessionDescription;
    try {
      sessionDescription = await rtcPeerConnection.createOffer(offerOptions);
      rtcPeerConnection.setLocalDescription(sessionDescription);
    } catch (error) {
      console.error(error);
    }

    console.log(
      `Sending offer from peer ${localPeerId.current} to peer ${remotePeerId} with name ${name}`,
    );
    socket.emit("webrtc_offer", {
      type: "webrtc_offer",
      sdp: sessionDescription,
      roomId: roomId.current,
      senderId: localPeerId.current,
      receiverId: remotePeerId,
      name: name,
    });
  }

  async function createAnswer(rtcPeerConnection, remotePeerId) {
    let sessionDescription;
    try {
      sessionDescription = await rtcPeerConnection.createAnswer(offerOptions);
      rtcPeerConnection.setLocalDescription(sessionDescription);
    } catch (error) {
      console.error(error);
    }

    console.log(
      `Sending answer from peer ${localPeerId.current} to peer ${remotePeerId}`,
    );
    socket.emit("webrtc_answer", {
      type: "webrtc_answer",
      sdp: sessionDescription,
      roomId: roomId.current,
      senderId: localPeerId.current,
      receiverId: remotePeerId,
    });
  }

  async function createAnswerOfferShare(rtcPeerConnection, senderId) {
    let sessionDescription;
    try {
      sessionDescription = await rtcPeerConnection.createAnswer(offerOptions);
      rtcPeerConnection.setLocalDescription(sessionDescription);
    } catch (error) {
      console.error(error);
    }

    console.log(
      `Sending answer from peer ${localPeerId.current} to peer ${senderId}`,
    );
    socket.emit("webrtc_answer_sharescreen", {
      type: "webrtc_answer_sharescreen",
      sdp: sessionDescription,
      roomId: roomId.current,
      receiverId: senderId,
      senderId: localPeerId.current,
    });
  }

  function setRemoteStream(event, remotePeerId, nameSender) {
    console.log("Remote stream set");
    console.log(event);
    if (event.track.kind == "video") {
      participants.current += 1;
      if (participants.current <= 5) {
        const div = document.createElement("div");
        div.classList.add(
          "relative",
          "rounded-lg",
          "overflow-hidden",
          "max-w-[33%]",
          "basis-[33%]",
        );
        div.id = "remotevideo_" + remotePeerId;
        const videoREMOTO = document.createElement("video");
        videoREMOTO.srcObject = event.streams[0];
        // videoREMOTO.id = "remotevideo_" + remotePeerId;
        videoREMOTO.setAttribute("autoPlay", "");
        videoREMOTO.classList.add(
          "h-full",
          "w-full",
          "object-cover",
          "rounded-lg",
        );
        const img = document.createElement("img");
        img.src = microphoneImg;
        img.classList.add(
          "absolute",
          "right-4",
          "top-5",
          "h-[16px]",
          "w-[16px]",
        );
        const span = document.createElement("span");
        span.classList.add(
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
        span.textContent = nameSender;
        div.appendChild(videoREMOTO);
        div.appendChild(span);
        div.appendChild(img);
        videoChatContainer.current.append(div);
        // updateResponsivePreRemoteWidth();
      } else if (participants.current == 6) {
        const div = document.createElement("div");
        div.classList.add("relative", "rounded-lg");
        div.id = "remotevideo_" + remotePeerId;
        const videoREMOTO = document.createElement("video");
        videoREMOTO.srcObject = event.streams[0];
        // videoREMOTO.id = "remotevideo_" + remotePeerId;
        videoREMOTO.setAttribute("autoPlay", "");
        videoREMOTO.classList.add("hidden");
        const spanEle = document.createElement("span");
        spanEle.classList.add(
          "absolute",
          "text-lg",
          "text-center",
          "count",
          "overflow-hidden",
          "overflow-ellipsis",
          "whitespace-nowrap",
          "w-full",
        );
        spanEle.textContent = `+${1}`;
        div.appendChild(videoREMOTO);
        div.appendChild(spanEle);
        videoChatContainer.current.append(div);
        // updateResponsivePreRemoteWidth();
      } else if (participants.current > 6) {
        const spanElement = document.querySelector(".count");
        const videoREMOTO = document.createElement("video");
        videoREMOTO.srcObject = event.streams[0];
        videoREMOTO.setAttribute("autoPlay", "");
        videoREMOTO.classList.add("hidden");
        if (spanElement)
          spanElement.textContent = `+${participants.current - 5}`;
      }
    }
  }

  function updateResponsivePreRemoteWidth() {
    // Assuming videoChatContainer is your parent container
    const parentContainer = videoChatContainer?.current;

    // Iterate over the children and update their heights
    for (let i = 0; i < parentContainer?.children?.length; i++) {
      const child = parentContainer.children[i];

      // Calculate and set the height for each child
      const newWidth =
        Math.floor(parentContainer.offsetWidth / participants.current) + "px";
      child.style.width = newWidth;
    }
  }

  function updateResponsivePreRemoteHeight() {
    // Assuming videoChatContainer is your parent container
    const parentContainer = videoChatContainer?.current;

    // Iterate over the children and update their heights
    for (let i = 0; i < parentContainer?.children?.length; i++) {
      const child = parentContainer.children[i];

      // Calculate and set the height for each child
      const newHeight =
        Math.floor(parentContainer.offsetHeight / participants.current) + "px";
      child.style.height = newHeight;
      console.log(newHeight);
    }
  }

  function setRemoteShareScreen(event, remoteShareId, name) {
    console.log(event);
    try {
      if (event.track.kind == "video") {
        if (mainShareScreen.current.children.length < 1) {
          console.log(event + "Track Share Screen");
          const div = document.createElement("div");
          div.id = "remoteshare_" + remoteShareId;
          div.classList.add(
            "relative",
            "max-h-full",
            "max-w-full",
            "min-h-[200px]",
            "min-w-[250px]",
          );
          const videoEle = document.createElement("video");
          videoEle.srcObject = event.streams[0];
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

          spanEle.textContent = name;
          div.appendChild(videoEle);
          div.appendChild(spanEle);
          div.appendChild(img);
          mainShareScreen.current.append(div);
        } else {
          console.log(event + "Track Share Screen");
          const div = document.createElement("div");
          div.id = "remoteshare_" + remoteShareId;
          div.classList.add(
            "relative",
            "rounded-lg",
            "overflow-hidden",
            "max-w-[33%]",
            "basis-[33%]",
          );
          const videoEle = document.createElement("video");
          videoEle.srcObject = event.streams[0];
          videoEle.setAttribute("autoPlay", "");
          videoEle.classList.add(
            "h-full",
            "w-full",
            "object-cover",
            "rounded-lg",
          );
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
          videoChatContainer.current.append(div);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  function sendIceCandidate(event, remotePeerId) {
    if (event.candidate) {
      console.log(
        `Sending ICE Candidate from peer ${localPeerId.current} to peer ${remotePeerId}`,
      );
      socket.emit("webrtc_ice_candidate", {
        senderId: localPeerId.current,
        receiverId: remotePeerId,
        roomId: roomId.current,
        label: event.candidate.sdpMLineIndex,
        candidate: event.candidate.candidate,
      });
    }
  }

  function sendShareIceCandidate(event, remotePeerId) {
    if (event.candidate) {
      console.log(
        `Sending ICE Candidate from peer ${localPeerId.current} to peer ${remotePeerId}`,
      );
      socket.emit("webrtc_ice_candidate_sharescreen", {
        receiverId: remotePeerId,
        senderId: localPeerId.current,
        roomId: roomId.current,
        label: event.candidate.sdpMLineIndex,
        candidate: event.candidate.candidate,
      });
    }
  }

  function checkPeerDisconnect(event, remotePeerId) {
    let state = peerConnections[remotePeerId].iceConnectionState;
    console.log(`connection with peer ${remotePeerId}: ${state}`);
    if (Object.keys(peerConnections).length != 0) {
      if (peerConnections[remotePeerId].iceConnectionState == "connected") {
        console.log(location);
        console.log(currentLocation);
        // if (currentLocation.current == false) {
        console.log("Chi 1 Lan thoi");
        if (location.state?.microphone == false) {
          const audioTrack = localStream.current
            .getTracks()
            .find((track) => track.kind === "audio");
          if (audioTrack) {
            audioTrack.enabled = false;
            setMicrophone(audioTrack.enabled);
            socket.emit("toggleMicrophone", {
              roomId: roomId.current,
              peerUUID: localPeerId.current,
              audioTrack: audioTrack.enabled,
            });
          }
        }
        if (location.state?.camera == false) {
          const videoTrack = localStream.current
            .getTracks()
            .find((track) => track.kind === "video");
          if (videoTrack) {
            videoTrack.enabled = false;
            setCamera(videoTrack.enabled);
            socket.emit("toggleCamera", {
              roomId: roomId.current,
              peerUUID: localPeerId.current,
              audioTrack: videoTrack.enabled,
            });
          }
          // }
          // currentLocation.current = true;
        }
      }
    }
    if (state === "failed" || state === "closed" || state === "disconnected") {
      console.log(`Peer ${remotePeerId} has disconnected`);
      const divDisconnected = document.getElementById(
        "remotevideo_" + remotePeerId,
      );
      participants.current -= 1;
      if (divDisconnected) divDisconnected.remove();
    }
  }

  function checkPeerShareDisconnect(event, remotePeerId) {
    var state = peerConnectionsShare[remotePeerId].iceConnectionState;
    console.log(`connection with peer ${remotePeerId}: ${state}`);
    if (state === "failed" || state === "closed" || state === "disconnected") {
      console.log(`Peer ${remotePeerId} has disconnected`);
      const divDisconnected = document.getElementById(
        "remoteshare_" + remotePeerId,
      );
      if (divDisconnected) divDisconnected.remove();
    }
  }

  function toggleToast(id, message) {
    // Kiểm tra xem toast có tồn tại hay không
    if (!toasts.some((t) => t.id === id)) {
      // Nếu không tồn tại, thêm vào danh sách
      setToasts((prevToasts) => [...prevToasts, { id }]);
      // Xuất hiện toast
      toast(message, {
        toastId: id,
        position: "bottom-right",
        hideProgressBar: false,
        closeOnClick: false,
        autoClose: 20000,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } else {
      removeToast(id);
    }
  }

  const removeToast = (id) => {
    // Xóa toast khỏi danh sách
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    // Xóa toast
    toast.dismiss(id);
  };

  function handleClickLarge(e) {
    e.preventDefault();
    console.log(mainShareScreen.current);
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
    if (mainShareScreen.current.children.length == 0) {
      const childShare = e.target.parentNode;
      childShare.className = "";
      childShare.classList.add(
        "relative",
        "max-h-full",
        "max-w-full",
        "min-h-[200px]",
        "min-w-[250px]",
      );
      mainShareScreen.current.appendChild(childShare);
      // videoChatContainer.removeChild(e.target.parentNode);
    } else {
      //Click in img in videoChatContainer
      if (e.target.parentNode.parentNode.id != "mainSharescreen") {
        const childShareScreen = mainShareScreen.current.children[0];
        const childChatContainer = e.target.parentNode;
        mainShareScreen.current.replaceChild(
          childChatContainer,
          childShareScreen,
        );

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
        const childShareScreen = mainShareScreen.current.children[0];
        childShareScreen.className = "";
        childShareScreen.classList.add(
          "relative",
          "max-w-[33%]",
          "basis-[33%]",
          "overflow-hidden",
          "rounded-lg",
        );
        videoChatContainer.appendChild(childShareScreen);
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

  const setColor = (color) => {
    // Implement your setColor logic here
    setColorCurrent(color);
    console.log(`Color selected: ${color}`);
  };

  const setEraser = () => {
    // Implement your setEraser logic here
    setColorCurrent("white");
    console.log("Eraser selected");
  };

  const clearBoard = () => {
    // Implement your clearBoard logic here
    if (
      window.confirm(
        "Are you sure you want to clear board? This cannot be undone",
      )
    ) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      socket.emit("store canvas", {
        url: canvas.toDataURL(),
        roomId: roomId.current,
      });
      socket.emit("clearBoard", {
        roomId: roomId.current,
      });
    } else return;
    console.log("Clear board selected");
  };

  return (
    <main className="h-[100vh] bg-[#202124]">
      {animation == false ? (
        <div className="fixed bottom-0 left-0 right-0 top-0 bg-slate-800"></div>
      ) : (
        <>
          <ToastContainer
            position="bottom-right"
            autoClose={false}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />

          <div className="relative flex h-[90vh] max-h-[90vh] w-[100vw] gap-4 overflow-hidden">
            <div
              className={`bg-gray-500 ${
                displayBox
                  ? "w-[calc(100%-360px)] max-w-[calc(100%-360px)]"
                  : "w-full max-w-full"
              } transition-all duration-200 ease-linear`}
            >
              <div
                // ${
                // displayBox ? "py-[34vh]" : ""
                // }
                className={`flex h-full w-full flex-col items-center justify-center p-2 sm:flex-row`}
              >
                {console.log(
                  peerConnectionsShare,
                  peerConnectionsOwnerShare,
                  "Share Screen",
                )}
                <div
                  className={`flex h-full w-full max-w-[60%] items-center justify-center p-2 ${
                    mainShareScreen?.current?.children?.length != 0
                      ? ""
                      : "hidden"
                  }`}
                  ref={mainShareScreen}
                  id="mainSharescreen"
                ></div>
                <div
                  className={`flex h-full max-w-full flex-1 ${
                    mainShareScreen?.current?.children?.length == 1
                      ? "flex-wrap"
                      : "items-center"
                  } justify-center gap-2 px-2 py-14 pr-[18px] md:flex-row md:gap-2 md:px-1 ${
                    fullScreen == false ? "" : "flex-wrap"
                  }`}
                  ref={videoChatContainer}
                  id="videoChatContainer"
                >
                  {/* ${
                    videoChatContainer?.current?.children?.length <= 3 &&
                    "max-w-[33%] basis-[33%]"
                  } */}
                  <div
                    className={`relative max-w-[33%] basis-[33%] overflow-hidden rounded-lg`}
                    id="local-video"
                  >
                    <video
                      autoPlay
                      className="h-full w-full rounded-lg object-cover"
                      ref={videoLocal}
                    ></video>
                    <span
                      className="absolute bottom-5 left-4 w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-lg font-semibold text-white"
                      ref={videoLocalName}
                    ></span>
                    <img
                      src={microphone ? microphoneImg : lockmicrophone}
                      alt="Microphone"
                      className="absolute right-4 top-5 h-[16px] w-[16px]"
                    />
                  </div>
                </div>
                {/* whiteboard */}
                <div className="whiteboard-cont relative hidden">
                  <canvas
                    id="whiteboard"
                    className="rounded-xl bg-white"
                    height="600"
                    width="1000"
                  ></canvas>
                  <div className="colors-cont absolute right-[80px] top-[80px] flex flex-col">
                    <div
                      className="black mt-[10px] h-[30px] w-[30px] cursor-pointer rounded-full bg-black"
                      onClick={() => setColor("black")}
                    ></div>
                    <div
                      className="red mt-[10px] h-[30px] w-[30px] cursor-pointer rounded-full bg-red-700"
                      onClick={() => setColor("#e74c3c")}
                    ></div>
                    <div
                      className="yellow mt-[10px] h-[30px] w-[30px] cursor-pointer rounded-full bg-[#f1c40f]"
                      onClick={() => setColor("#f1c40f")}
                    ></div>
                    <div
                      className="green mt-[10px] h-[30px] w-[30px] cursor-pointer rounded-full bg-[#badc58]"
                      onClick={() => setColor("#badc58")}
                    ></div>

                    <div
                      className="eraser mt-[10px] h-[30px] w-[30px] cursor-pointer text-[26px] text-[rgb(43,43,43)]"
                      onClick={setEraser}
                    >
                      <img src={eraser} alt="Eraser" />
                    </div>
                    <div
                      className="clearboard mt-[10px] h-[30px] w-[30px] cursor-pointer text-[26px] text-[rgb(43,43,43)]"
                      onClick={clearBoard}
                    >
                      <img src={trash} alt="Trash" />
                    </div>
                  </div>
                </div>
                {/* end whiteboard */}
              </div>
            </div>
            <div
              className={`absolute right-[-400px] w-[360px] ${
                displayBox ? "right-[0px]" : ""
              } px-4 py-2 transition-all duration-200 ease-linear`}
            >
              <div className="h-[calc(90vh-16px)] w-full rounded-lg bg-white">
                {activeComponent == 1 && (
                  <RoomDetail
                    toggleBox={(displayBox) => setDisplayBox(displayBox)}
                    displayBox={displayBox}
                    roomId={id}
                  />
                )}
                {activeComponent == 2 && (
                  <RoomPeople
                    peopleWaiting={peopleWaiting}
                    setPeopleWaiting={setPeopleWaiting}
                    socket={socket}
                    join={join}
                    setJoin={setJoin}
                    roomId={id}
                    toggleBox={(displayBox) => setDisplayBox(displayBox)}
                    displayBox={displayBox}
                    participantsDetail={participantsDetail}
                    setParticipantsDetail={(data) =>
                      setParticipantsDetail(data)
                    }
                    toasts={toasts}
                  />
                )}
                {activeComponent == 3 && (
                  <RoomChat
                    toggleBox={(displayBox) => setDisplayBox(displayBox)}
                    displayBox={displayBox}
                    name={auth.user.fullName}
                    socket={socket}
                    localPeerId={localPeerId}
                    roomId={id}
                    currentTime={currentTime}
                    messages={messages}
                    setChatToggle={(data) => setChatToggle(data)}
                    chatToggle={chatToggle}
                    checkOwnerInRoom={checkOwnerInRoom}
                  />
                )}
                {activeComponent == 4 && (
                  <RoomSetting
                    toggleBox={(displayBox) => setDisplayBox(displayBox)}
                    displayBox={displayBox}
                    shareToggle={shareToggle}
                    roomId={id}
                    setShareToggle={(data) => setShareToggle(data)}
                    microphoneToggle={microphoneToggle}
                    setMicrophoneToggle={(data) => setMicrophoneToggle(data)}
                    cameraToggle={cameraToggle}
                    setCameraToggle={(data) => setCameraToggle(data)}
                    chatToggle={chatToggle}
                    setChatToggle={(data) => setChatToggle(data)}
                    socket={socket}
                    peerConnections={peerConnections}
                    setPeerConnections={(data) => setPeerConnections(data)}
                    localPeerId={localPeerId}
                    personnalMicrophone={microphone}
                    personnalCamera={camera}
                    peerConnectionsOwnerShare={peerConnectionsOwnerShare}
                    setPeerConnectionsOwnerShare={(data) =>
                      setPeerConnectionsOwnerShare(data)
                    }
                    peerConnectionsShare={peerConnectionsShare}
                    setPeerConnectionsShare={(data) =>
                      setPeerConnectionsShare(data)
                    }
                  />
                )}
              </div>
            </div>
          </div>
          {/* Interaction */}
          <div className="flex h-[10vh] justify-evenly md:justify-between md:px-6">
            {/* Timming */}
            <div className="hidden items-center gap-3 md:flex">
              <span className="text-md timeReal font-bold text-white">
                8:43
              </span>
              <div className="h-[16px] w-[1px] bg-white"></div>
              <span className="text-md roomId font-bold text-white">
                pag-dbjz-sxj
              </span>
            </div>
            {/* Function */}
            <div className="flex items-center gap-2 md:gap-3">
              <BottomBar
                ToggleMicrophone={microphone}
                setMicrophone={(data) => setMicrophone(data)}
                ToggleCamera={camera}
                setCamera={(data) => setCamera(data)}
                localStream={localStream}
                localPeerId={localPeerId}
                roomId={roomId}
                socket={socket}
                shareScreen={shareScreen}
                setShareScreen={setShareScreen}
                peerConnections={peerConnections}
                peerConnectionsShare={peerConnectionsShare}
                setPeerConnectionsShare={(data) =>
                  setPeerConnectionsShare(data)
                }
                offerOptions={offerOptions}
                mediaConstraints={mediaConstraints}
                name={auth.user.fullName}
                iceServers={iceServers}
                participants={participants}
                setPeerConnections={(data) => setPeerConnections(data)}
                shareStream={shareStream}
                toggleHand={toggleHand}
                ref={mainShareScreen}
                toggleToast={toggleToast}
                peerConnectionsOwnerShare={peerConnectionsOwnerShare}
                setPeerConnectionsOwnerShare={(data) =>
                  setPeerConnectionsOwnerShare(data)
                }
                toasts={toasts}
                setToasts={(data) => setToasts(data)}
                microphoneToggle={microphoneToggle}
                cameraToggle={cameraToggle}
                shareToggle={shareToggle}
                checkOwnerInRoom={checkOwnerInRoom}
                toggleShare={toggleShare}
                setToggleShare={(data) => setToggleShare(data)}
                fullScreen={fullScreen}
                setFullScreen={(data) => setFullScreen(data)}
                canvas={canvas}
                setCanvas={(data) => setCanvas(data)}
                ctx={ctx}
                setCtx={(data) => setCtx(data)}
                isDrawing={isDrawing}
                setIsDrawing={(data) => setIsDrawing(data)}
              />
            </div>
            {/* Box */}
            <div className="flex items-center gap-2 md:gap-3">
              {iconsBox.map((item, index) => {
                if (checkOwnerInRoom.current == true) {
                  return (
                    <IconBox
                      key={item.name}
                      src={item.src}
                      name={item.name}
                      index={index + 1}
                      activeComponent={activeComponent}
                      changeComponent={(activeComponent) =>
                        setActiveComponent(activeComponent)
                      }
                      toggleBox={(displayBox) => setDisplayBox(displayBox)}
                      displayBox={displayBox}
                    />
                  );
                } else {
                  if (item.name == "lock") {
                    return <></>;
                  } else {
                    return (
                      <>
                        <IconBox
                          key={item.name}
                          src={item.src}
                          name={item.name}
                          index={index + 1}
                          activeComponent={activeComponent}
                          changeComponent={(activeComponent) =>
                            setActiveComponent(activeComponent)
                          }
                          toggleBox={(displayBox) => setDisplayBox(displayBox)}
                          displayBox={displayBox}
                        />
                      </>
                    );
                  }
                }
              })}
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default Meeting;
