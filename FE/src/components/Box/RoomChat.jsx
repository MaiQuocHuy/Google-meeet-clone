import React from "react";
import { send, turnoff } from "../../assets/icon";
import { useRef } from "react";
import { useEffect } from "react";

const RoomChat = ({
  toggleBox,
  displayBox,
  name,
  socket,
  localPeerId,
  roomId,
  currentTime,
  messages,
  chatToggle,
  setChatToggle,
  checkOwnerInRoom,
}) => {
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current != null) {
      const handleKeyUp = (e) => {
        textarea.style.height = "24px";
        let scHeight = e.target.scrollHeight;
        textarea.style.height = `${scHeight}px`;
      };

      // Add event listener when the component is mounted
      const textarea = textRef.current;
      textarea.addEventListener("keyup", handleKeyUp);

      // Remove the event listener when the component is unmounted
      return () => {
        textarea.removeEventListener("keyup", handleKeyUp);
      };
    }
  }, [textRef, textRef.current]);

  const handleClick = (e) => {
    e.preventDefault();
    toggleBox(!displayBox);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    console.log("Sending message");
    if (textRef.current.value === "") return false;
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const formatTime = `${hours}:${minutes}`;
    console.log(name + "name");
    socket.emit("message", {
      peerId: localPeerId.current,
      name: name,
      message: textRef.current.value,
      roomId,
      formatTime,
    });
    textRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="flex justify-between">
        <span className="text-lg font-semibold text-slate-500">
          In call messages
        </span>
        <img
          src={turnoff}
          alt="Turn Off"
          className="h-[18px] w-[18px]"
          onClick={handleClick}
        />
      </div>
      <div className="flex items-center justify-between bg-[#f1f3f4] p-3">
        <p className="text-sm text-gray-500">Let everyone send messages</p>
        {/* <div className="flex items-center">
          <label
            htmlFor="check"
            className="relative inline-block h-[20px] w-12 cursor-pointer rounded-full bg-slate-500"
          >
            <input type="checkbox" id="check" className="peer sr-only" />
            <span className="absolute left-1 top-[2px] h-4/5 w-2/5 rounded-full bg-green-300 transition-all duration-500 peer-checked:left-[26px] peer-checked:bg-green-800"></span>
          </label>
        </div> */}
      </div>
      <div className="flex items-center justify-between bg-[#f1f3f4] p-3">
        <p className="text-center text-sm text-gray-500">
          Messages can only be seen by people in call and are deleted when the
          call ends
        </p>
      </div>
      <div className="relative flex flex-col gap-2 p-3">
        <div className="flex h-[46vh] flex-col gap-3 overflow-auto py-2">
          {messages.length > 0 &&
            messages.map((item, index) => (
              <div className="flex flex-col" key={index}>
                <div className="flex gap-2">
                  <span>{item.name}</span>
                  <span>{item.formatTime}</span>
                </div>
                <p className="break-words text-sm text-black">{item.message}</p>
              </div>
            ))}
        </div>
        <div className="absolute -bottom-[44px] left-0 flex w-full items-center rounded-xl bg-[#f1f3f4] px-2 py-3">
          {chatToggle == true || checkOwnerInRoom.current == true ? (
            <>
              <textarea
                type="text"
                placeholder="Send a message"
                className="h-6 max-h-[330px] flex-1 resize-none bg-[#f1f3f4] px-2 text-sm outline-none"
                ref={textRef}
              ></textarea>
              <img
                src={send}
                alt="Send"
                className="h-[24px] w-[24px]"
                onClick={handleSendMessage}
              />
            </>
          ) : (
            <div className="h-6 max-h-6 flex-1 px-2">
              <span className="text-sm outline-none">
                Chat has been block by Owner
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomChat;
