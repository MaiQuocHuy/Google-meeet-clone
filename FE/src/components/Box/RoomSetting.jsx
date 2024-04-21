import React from "react";
import {
  turnoff,
  microphone as microphoneImg,
  lockmicrophone,
} from "../../assets/icon";

const RoomSetting = ({
  toggleBox,
  displayBox,
  shareToggle,
  setShareToggle,
  microphoneToggle,
  setMicrophoneToggle,
  cameraToggle,
  setCameraToggle,
  chatToggle,
  setChatToggle,
  socket,
  roomId,
  peerConnections,
  setPeerConnections,
  localPeerId,
  personnalMicrophone,
  personnalCamera,
  peerConnectionsOwnerShare,
  setPeerConnectionsOwnerShare,
  peerConnectionsShare,
  setPeerConnectionsShare,
}) => {
  const handleShareToggle = async () => {
    console.log(shareToggle);
    const newSharescreen = !shareToggle;
    setShareToggle(newSharescreen);
    const peers = Object.keys(peerConnectionsShare);
    for (let index = 0; index < peers.length; index++) {
      const remotePeerId = peers[index];
      const divRemotePeer = document.getElementById(
        "remoteshare_" + remotePeerId,
      );
      if (divRemotePeer) divRemotePeer.remove();
      console.log(remotePeerId + "Remote Peer id");
      if (peerConnectionsShare[remotePeerId]) {
        await peerConnectionsShare[remotePeerId].close();
        delete peerConnectionsShare[remotePeerId];
      }
    }
    setPeerConnectionsShare(peerConnectionsShare);
    socket.emit("changePermissionToolInRoom", {
      roomId,
      typeofTool: 3,
      permission: newSharescreen,
      senderId: localPeerId.current,
    });
  };

  const handleMicrophoneToggle = () => {
    console.log(microphoneToggle);
    const newMicrphone = !microphoneToggle;
    setMicrophoneToggle(newMicrphone);
    socket.emit("changePermissionToolInRoom", {
      roomId,
      typeofTool: 1,
      permission: newMicrphone,
      senderId: localPeerId.current,
    });
    const peers = Object.keys(peerConnections);
    for (let index = 0; index < peers.length; index++) {
      const remotePeerId = peers[index];
      const divRemotePeer = document.getElementById(
        "remotevideo_" + remotePeerId,
      );
      if (divRemotePeer) {
        const img = divRemotePeer.querySelector("img");
        if (img && newMicrphone == false && personnalMicrophone == true) {
          img.src = lockmicrophone;
        }
      }
    }
  };

  const handleCameraToggle = () => {
    console.log(cameraToggle);
    const newCamera = !cameraToggle;
    setCameraToggle(!cameraToggle);
    socket.emit("changePermissionToolInRoom", {
      roomId,
      typeofTool: 2,
      permission: newCamera,
      senderId: localPeerId.current,
    });
    const peers = Object.keys(peerConnections);
    for (let index = 0; index < peers.length; index++) {
      const remotePeerId = peers[index];
      const divRemotePeer = document.getElementById(
        "remotevideo_" + remotePeerId,
      );
      if (divRemotePeer) {
        const video = divRemotePeer.querySelector("video");
        if (video && newCamera == false && personnalCamera == true) {
          video.srcObject =
            "https://th.bing.com/th/id/OIP.Dy4J_s3zLJxmhXu4k0ISAgHaEo?pid=ImgDet&rs=1";
        }
      }
    }
  };

  const handleChatToggle = () => {
    console.log(chatToggle);
    const newChat = !chatToggle;
    setChatToggle(newChat);
    socket.emit("changePermissionToolInRoom", {
      roomId,
      typeofTool: 4,
      permission: newChat,
      senderId: localPeerId.current,
    });
  };

  const handleClick = (e) => {
    e.preventDefault();
    toggleBox(!displayBox);
  };

  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="flex justify-between px-4">
        <span className="text-lg font-semibold text-slate-500">Setting</span>
        <img
          src={turnoff}
          alt="Turn Off"
          className="h-[18px] w-[18px]"
          onClick={handleClick}
        />
      </div>
      <div className="flex items-center justify-between p-3">
        <p className="text-left text-sm text-gray-500">
          Use these host settings to keep control of your meeting. Only hosts
          have access to these controls.
        </p>
      </div>
      <div className="flex h-[64vh] flex-col gap-2 overflow-auto">
        <div className="border border-solid border-[#ccc] p-4">
          <span className="text-sm uppercase text-slate-500">
            Meeting Moderation
          </span>
        </div>
        <div className="flex flex-col justify-between px-4">
          <div>
            <span className="text-sm font-bold leading-4">Host management</span>
            <p className="w-[70%] text-[10px] text-slate-400">
              Let's you restrict what participants can do in the meeting and
              lets you appoint co-host
            </p>
            <div className="mt-4 flex flex-col gap-3 pl-4">
              <span className="block text-[12px] font-semibold uppercase text-slate-400">
                Let everyone
              </span>
              <div className="flex justify-between">
                <span className="text-[14px] font-medium">
                  Share Their Screen
                </span>
                <label
                  htmlFor="sharescreen"
                  className="relative top-1 float-right inline-block h-[20px] w-12 cursor-pointer rounded-full bg-slate-500"
                >
                  <input
                    type="checkbox"
                    id="sharescreen"
                    className="peer sr-only"
                    onChange={handleShareToggle}
                    checked={shareToggle}
                  />
                  <span className="absolute left-1 top-[2px] h-4/5 w-2/5 rounded-full bg-green-300 transition-all duration-500 peer-checked:left-[26px] peer-checked:bg-green-800"></span>
                </label>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] font-medium">
                  Send Chat Message
                </span>
                <label
                  htmlFor="sendchat"
                  className="relative top-1 float-right inline-block h-[20px] w-12 cursor-pointer rounded-full bg-slate-500"
                >
                  <input
                    type="checkbox"
                    id="sendchat"
                    className="peer sr-only"
                    onChange={handleChatToggle}
                    checked={chatToggle}
                  />
                  <span className="absolute left-1 top-[2px] h-4/5 w-2/5 rounded-full bg-green-300 transition-all duration-500 peer-checked:left-[26px] peer-checked:bg-green-800"></span>
                </label>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] font-medium">
                  Turn on their microphone
                </span>
                <label
                  htmlFor="turnonmicrophone"
                  className="relative top-1 float-right inline-block h-[20px] w-12 cursor-pointer rounded-full bg-slate-500"
                >
                  <input
                    type="checkbox"
                    id="turnonmicrophone"
                    className="peer sr-only"
                    onChange={handleMicrophoneToggle}
                    checked={microphoneToggle}
                  />
                  <span className="absolute left-1 top-[2px] h-4/5 w-2/5 rounded-full bg-green-300 transition-all duration-500 peer-checked:left-[26px] peer-checked:bg-green-800"></span>
                </label>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] font-medium">
                  Turn on their video
                </span>
                <label
                  htmlFor="turnonvideo"
                  className="relative top-1 float-right inline-block h-[20px] w-12 cursor-pointer rounded-full bg-slate-500"
                >
                  <input
                    type="checkbox"
                    id="turnonvideo"
                    className="peer sr-only"
                    onChange={handleCameraToggle}
                    checked={cameraToggle}
                  />
                  <span className="absolute left-1 top-[2px] h-4/5 w-2/5 rounded-full bg-green-300 transition-all duration-500 peer-checked:left-[26px] peer-checked:bg-green-800"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSetting;
