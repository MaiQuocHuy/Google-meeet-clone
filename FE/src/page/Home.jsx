import React, { useEffect, useRef, useState } from "react";
import { gif, googlemeet, homeimage, plus } from "../assets/icon";
import {
  AiOutlineQuestionCircle,
  AiOutlineMessage,
  AiOutlineSetting,
  AiOutlineVideoCamera,
} from "react-icons/ai";

import { v4 as uuidv4 } from "uuid";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import moment from "moment";
import { useOwner } from "../context/owner";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const [select, setSelect] = useState(false);
  // const [selectedValue, setSelectedValue] = useState("");
  const [display, setDisplay] = useState(false);
  const [toggle, setToggle] = useState(false);
  const componentRef = useRef(null);
  const [formattedTime, setFormattedTime] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Kiểm tra xem có phải click bên ngoài phần tử không
      if (
        componentRef.current &&
        !componentRef.current.contains(event.target)
      ) {
        console.log("Click outside");
        setDisplay(false);
      }
    };

    // Thêm sự kiện lắng nghe khi mount component
    document.addEventListener("click", handleClickOutside);

    // Cleanup sự kiện khi component unmount
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // const handleSelectChange = async (event) => {
  //   console.log(event.target.value);
  //   setSelectedValue(event.target.value);
  //   if (event.target.value === "instant") {
  //     // navigate(`/meeting/${id}`);
  //     const cookieToken = getCookie("token");
  //     if (!cookieToken) {
  //       navigate("/login");
  //     }
  //     axios
  //       .get("http://localhost:3000/gomeet/api/room/start-room", {
  //         headers: {
  //           token: cookieToken,
  //         },
  //       })
  //       .then((response) => {
  //         const { data } = response;
  //         console.log(data.msg);
  //         const id = uuidv4();
  //         navigate(`/meeting/instant/${id}/`);
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });
  //   } else {
  //     const cookieToken = getCookie("token");
  //     if (!cookieToken) {
  //       navigate("/login");
  //     }
  //     const id = uuidv4();
  //     axios
  //       .get("http://localhost:3000/gomeet/api/room/create-room", {
  //         headers: {
  //           token: cookieToken,
  //         },
  //         params: { roomId: id },
  //       })
  //       .then((response) => {
  //         const { data } = response;
  //         const roomId = data.roomId;
  //         navigate(`/meeting/${roomId}`);
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });
  //   }
  // };
  const createMeeting = () => {
    console.log(display);
    setDisplay(true);
  };

  const toggleProfile = () => {
    setToggle(!toggle);
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userInfo");
    navigate("/login");
  };

  const getCookie = (cookieName) => {
    return Cookies.get(cookieName) || null;
  };

  const handleClickMeetingLater = (event) => {
    event.preventDefault();
    const cookieToken = getCookie("token");
    if (!cookieToken) {
      navigate("/login");
    }
    const id = uuidv4();
    axios
      .get("http://localhost:3000/gomeet/api/room/create-room", {
        headers: {
          token: cookieToken,
        },
        params: { roomId: id },
      })
      .then((response) => {
        const { data } = response;
        const roomId = data.roomId;
        const smallModel = document.getElementById("small-modal");
        smallModel.classList.remove("hidden");
        smallModel.classList.add("flex");
        smallModel.querySelector(
          ".link-room",
        ).textContent = `http://localhost:5173/meeting/${roomId}`;
        // navigate(`/meeting/${roomId}/`);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    // Lấy thời gian hiện tại
    const currentTime = moment();

    // Format thời gian theo định dạng "h:mma ddd, MMM D"
    const formattedTimeString = currentTime.format("h:mma ddd, MMM D");

    setFormattedTime(formattedTimeString);
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (code != "") {
      navigate(`/join-meeting/${code}`);
    }
  };

  const handleClickRightNow = (event) => {
    event.preventDefault();
    const cookieToken = getCookie("token");
    if (!cookieToken) {
      navigate("/login");
    }
    axios
      .get("http://localhost:3000/gomeet/api/room/start-room", {
        headers: {
          token: cookieToken,
        },
      })
      .then((response) => {
        const { data } = response;
        console.log(data.msg);
        const id = uuidv4();
        // const pathName = location.pathname;
        // console.log(pathName);
        console.log("Davao");
        navigate(`/meeting/${id}`, {
          state: {
            pathName: "/",
            owner: "owner",
          },
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <header className="mt-2 flex justify-between px-4">
        <div className="flex items-center gap-4">
          <img
            src={googlemeet}
            alt="Google meet"
            className="h-[42px] w-[42px]"
          />
          <span className="text-lg text-gray-500">Google Meet</span>
        </div>
        <div className="relative flex items-center text-slate-500">
          <span className="mr-2">{formattedTime}</span>
          <img
            src={
              JSON.parse(getCookie("userInfo")) != null
                ? JSON.parse(getCookie("userInfo")).avatar
                : "https://images3.alphacoders.com/165/thumb-1920-165265.jpg"
            }
            alt="Avatar"
            className="h-[42px] w-[42px] rounded-full"
            onClick={() => toggleProfile()}
          />
          <div
            className={`absolute right-0 top-14 z-10 flex flex-col rounded-lg border-[2px] border-gray-300 bg-white py-2 ${
              toggle ? "" : "hidden"
            }`}
          >
            {JSON.parse(getCookie("userInfo")) != null ? (
              <>
                <div
                  data-value={1}
                  className="flex items-center gap-2 p-3 hover:bg-slate-300"
                >
                  <span className="text-lg">
                    <Link to="/edit-profile">Edit Profile</Link>
                  </span>
                </div>
                <div
                  data-value={2}
                  className="flex items-center gap-2 p-3 hover:bg-slate-300"
                >
                  <span onClick={() => handleLogout()}>Logout</span>
                </div>
              </>
            ) : (
              <>
                <div
                  data-value={1}
                  className="flex items-center gap-2 p-3 hover:bg-slate-300"
                >
                  <span className="text-lg">
                    <Link to="/login">Login</Link>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="px-14 pt-24">
        <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
          <div>
            <h1 className="text-4xl">Secure video conference</h1>
            <h1 className="text-4xl">For every one</h1>
            <p className="my-10 text-lg text-slate-400">
              Connect, collaborate, and celebrate from any where with <br />
              google meet
            </p>
            <div className="relative flex flex-col gap-10 sm:flex-row">
              <button
                className="inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-lg bg-blue-500 p-3 text-lg"
                ref={componentRef}
              >
                <AiOutlineVideoCamera className="text-white" />
                <span className="text-white" onClick={() => createMeeting()}>
                  New meeting
                </span>
                <div
                  className={`absolute left-0 top-0 z-10 flex flex-col rounded-lg border-[2px] border-gray-300 bg-white py-2 ${
                    display ? "" : "hidden"
                  }`}
                >
                  <div
                    data-value={1}
                    className="flex items-center gap-2 p-3 hover:bg-slate-300"
                    onClick={handleClickMeetingLater}
                  >
                    <img src={gif} alt="Gif" className="h-4 w-4" />
                    <span className="text-lg">Create a Meeting Later</span>
                  </div>
                  <div
                    data-value={2}
                    className="flex items-center gap-2 p-3 hover:bg-slate-300"
                    onClick={handleClickRightNow}
                  >
                    <img src={plus} alt="Plus" className="h-4 w-4" />
                    <span>Start a meeting</span>
                  </div>
                </div>
                {/* {select && (
                    <select
                      id="countries"
                      className="absolute -bottom-12 left-0 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                      value={selectedValue}
                      onChange={handleSelectChange}
                    >
                      <option value="later">Create A Meeting Later</option>
                      <option value="instant">Start a Meeting</option>
                    </select>
                  )} */}
              </button>
              <input
                className="border-[rgba(0, 0, 0, 0.87)] flex flex-1 rounded-md border border-black p-3 outline-none"
                type="text"
                placeholder="Enter code or name"
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                className="text-lg text-slate-400"
                type="button"
                onClick={handleJoin}
              >
                Join
              </button>
            </div>
            <div className="my-10 h-[1px] w-full bg-slate-200"></div>
          </div>
          <div className="flex flex-col items-center px-16">
            <img src={homeimage} alt="Home Image" />
            <h1 className="mt-4 text-center text-lg">Get a link can share</h1>
            <div className="text-md text-center text-slate-600">
              Click <span className="font-bold">new meeting</span> to get a link
              you can send to people <br /> you want to meet with
            </div>
          </div>
        </div>
      </main>
      <div
        id="small-modal"
        className="fixed left-0 right-0 top-0 z-50 hidden h-[calc(100%-1rem)] max-h-full w-full items-center justify-center overflow-y-auto overflow-x-hidden bg-[rgba(0,0,0,0.2)] p-4 md:inset-0"
      >
        <div className="relative max-h-full w-full max-w-md">
          <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
            <div className="flex items-center justify-between rounded-t border-b p-4 dark:border-gray-600 md:p-5">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Link Room
              </h3>
              <button
                type="button"
                className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="small-modal"
                onClick={() => {
                  const smallModel = document.getElementById("small-modal");
                  smallModel.classList.remove("flex");
                  smallModel.classList.add("hidden");
                }}
              >
                <svg
                  className="h-3 w-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="space-y-4 p-4 md:p-5">
              <p className="link-room text-center text-base leading-relaxed text-gray-500 dark:text-gray-400"></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
