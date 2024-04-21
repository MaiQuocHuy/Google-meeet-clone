import React from "react";
import { turnoff } from "../../assets/icon";

const RoomDetail = ({ toggleBox, displayBox, roomId }) => {
  const handleClick = (e) => {
    e.preventDefault();
    toggleBox(!displayBox);
  };
  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="flex justify-between">
        <span className="text-lg font-semibold text-slate-500">
          Meeting Details
        </span>
        <img
          src={turnoff}
          alt="Turn Off"
          className="h-[18px] w-[18px]"
          onClick={handleClick}
        />
      </div>
      <p className="text-lg">Joining info</p>
      <div className="relative flex flex-row gap-2">
        Room: <span className="text-sm font-medium">{roomId}</span>
      </div>
    </div>
  );
};

export default RoomDetail;
