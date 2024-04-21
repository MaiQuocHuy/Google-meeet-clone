import React, { useEffect, useState } from "react";
import {
  accept,
  arrowtop,
  blueadduser,
  bluelockmicrophone,
  close,
  graymicrophone,
  hand,
  lockmicrophone,
  microphone,
  search,
  turnoff,
} from "../../assets/icon";

import axios from "axios";
import { toast } from "react-toastify";

const RoomPeople = ({
  peopleWaiting,
  setPeopleWaiting,
  socket,
  roomId,
  join,
  setJoin,
  toggleBox,
  displayBox,
  participantsDetail,
  setParticipantsDetail,
  toasts,
}) => {
  const [searchPeople, setSearchPeople] = useState([]);

  useEffect(() => {
    setSearchPeople(participantsDetail);
  }, [participantsDetail]);

  const handleAcceptBottom = (e, item) => {
    e.preventDefault();
    setJoin([
      ...join,
      {
        isMeeting: true,
        idMeeting: roomId,
      },
    ]);
    socket.emit("accept_join", {
      socketId: item.peerId,
    });

    const updatedPeopleWaiting = peopleWaiting.filter(
      (item) => item.peerId !== item.peerId,
    );

    setPeopleWaiting(updatedPeopleWaiting);
    console.log("Accepting");
  };

  const handleRejectBottom = (e, item) => {
    e.preventDefault();
    console.log(item);
    socket.emit("reject_join", {
      socketId: item.peerId,
    });
    const updatedPeopleWaiting = peopleWaiting.filter(
      (item) => item.peerId !== item.peerId,
    );
    setPeopleWaiting(updatedPeopleWaiting);
    console.log("Rejecting");
  };

  const handleClick = (e) => {
    e.preventDefault();
    toggleBox(!displayBox);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target.value;
    if (searchValue == "") {
      setSearchPeople(participantsDetail);
    } else {
      // searchPeople.filter((item) => {
      //   if (item.fullName.toLowerCase().includes(searchValue.toLowerCase())) {
      //     setSearchPeople([item]);
      //   }
      // });
      const filteredPeople = searchPeople.filter((item) => {
        return item.fullName
          .toLowerCase()
          .trim()
          .includes(searchValue.toLowerCase().trim());
      });

      setSearchPeople(filteredPeople);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="flex justify-between px-4">
        <span className="text-lg font-semibold text-slate-500">People</span>
        <img
          src={turnoff}
          alt="Turn Off"
          className="h-[18px] w-[18px]"
          onClick={handleClick}
        />
      </div>
      <div className="relative px-4">
        <img
          src={search}
          alt="Search"
          className="translate absolute left-6 top-[50%] h-[24px] w-[24px] -translate-y-[50%]"
        />
        <input
          type="text"
          placeholder="Search for people"
          className="w-full rounded-lg border border-solid py-3 pl-10 pr-4 outline-[#1967d2]"
          onChange={handleSearch}
        />
      </div>
      <div className="flex flex-col gap-2 px-4">
        <span className="text-sm text-gray-600">In meeting</span>
        {peopleWaiting.length != 0 && (
          <div className="rounded-lg border border-solid py-2">
            <div className="flex justify-between px-4">
              <span>Waiting</span>
              <div className="flex items-center gap-4">
                <span>{peopleWaiting.length}</span>
                <img
                  src={arrowtop}
                  alt="ArrowTop"
                  className="h-[18px] w-[18px]"
                />
              </div>
            </div>
            <div className="mt-2 border-b border-b-[#ccc]"></div>
            <div className="flex max-h-[46vh] flex-col gap-4 overflow-auto px-4 py-2 pt-2">
              {peopleWaiting.length != 0 &&
                peopleWaiting.map((item, index) => (
                  <div className="flex items-center gap-2" id={index}>
                    <img
                      src={
                        item.avatar != ""
                          ? item.avatar
                          : "https://th.bing.com/th/id/OIP.wyfA5DGLCMP57ZxNxX997AHaEK?pid=ImgDet&rs=1"
                      }
                      alt="Avatar"
                      className="h-[38px] w-[38px] rounded-full"
                    />
                    <div className="flex flex-1 flex-col">
                      <span className="text-md font-normal">
                        {item.fullName}
                      </span>
                    </div>
                    <img
                      src={accept}
                      alt="Accept"
                      onClick={(e) => handleAcceptBottom(e, item)}
                      className="h-[24px] w-[24px] cursor-pointer p-1 hover:rounded-full hover:bg-gray-500"
                    />
                    <img
                      src={close}
                      alt="Close"
                      onClick={(e) => handleRejectBottom(e, item)}
                      className="h-[24px] w-[24px] cursor-pointer p-1 hover:rounded-full hover:bg-gray-500"
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
        <div className="rounded-lg border border-solid py-2">
          <div className="flex justify-between px-4">
            <span>Contributors</span>
            <div className="flex items-center gap-4">
              <span>{participantsDetail.length || 0}</span>
              <img
                src={arrowtop}
                alt="ArrowTop"
                className="h-[18px] w-[18px]"
              />
            </div>
          </div>
          <div className="mt-2 border-b border-b-[#ccc]"></div>
          <div className="flex max-h-[46vh] flex-col gap-4 overflow-auto px-4 py-2 pt-2">
            {console.log(participantsDetail)}
            {searchPeople.length != 0 &&
              searchPeople.map((item, index) => (
                <div className="flex items-center gap-2" key={index}>
                  <img
                    src={`${
                      item.avatar != ""
                        ? item.avatar
                        : "https://th.bing.com/th/id/OIP.wyfA5DGLCMP57ZxNxX997AHaEK?pid=ImgDet&rs=1"
                    }`}
                    alt="Avatar"
                    className="h-[38px] w-[38px] rounded-full"
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="text-md font-normal">{item.fullName}</span>
                    <span className="text-sm text-gray-600">Meeting host</span>
                  </div>
                  <div className="flex gap-2">
                    {toasts.length > 0 &&
                      toasts.map((toast, index) => {
                        {
                          console.log(toast, item, "Item");
                        }
                        if (toast == item.socketId) {
                          return (
                            <img
                              src={hand}
                              alt="Hand"
                              className="h-[24px] w-[24px] cursor-pointer rounded-full bg-gray-500 p-1"
                            />
                          );
                        }
                        return <></>;
                      })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPeople;
