import React, { useEffect, useRef, useState } from "react";
import {
  camera,
  googlemeet,
  lockcamera,
  lockmicrophone,
  microphone,
} from "../assets/icon";
import Cookies from "js-cookie";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useOwner } from "../context/owner";
import { useAuth } from "../context/auth";
import { useJoin } from "../context/join";
import { ToastContainer, toast } from "react-toastify";
import { useSocket } from "../context/socket";
// import io from "socket.io-client";

// const socket = io.connect("http://localhost:3000");

const JoinMeeting = () => {
  const socket = useSocket();
  const [join, setJoin] = useJoin();
  const [auth, setAuth] = useAuth();
  const [owner, setOwner] = useOwner();
  const [toggleMicrophone, setToggleMicrophone] = useState(false);
  const [toggleCamera, setToggleCamera] = useState(false);
  const videoLocal = useRef();
  const shareStream = useRef();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [idOwner, setIdOwner] = useState("");
  const location = useLocation();
  const [userInParticipants, setUserInParticipants] = useState([]);
  const [toggle, setToggle] = useState(false);

  const handleToggleMicrophone = () => {
    if (shareStream.current) {
      shareStream.current.getAudioTracks()[0].enabled = !toggleMicrophone;
      setToggleMicrophone(!toggleMicrophone);
    }
  };

  const handleToggleCamera = () => {
    setToggleCamera(!toggleCamera);
    const videoTrack = shareStream.current
      .getTracks()
      .find((track) => track.kind === "video");
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
    }
  };

  useEffect(() => {
    const setLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log(stream);
        if (stream) {
          setToggleMicrophone(true);
          setToggleCamera(true);
          shareStream.current = stream;
          videoLocal.current.srcObject = shareStream.current;
        }
      } catch (error) {
        console.log(error);
      }
    };
    setLocalStream();
  }, []);

  useEffect(() => {
    const cookieToken = getCookie("token");
    const cookieInfo = getCookie("userInfo");
    if (!cookieInfo || !cookieToken) {
      navigate("/login");
    } else {
      // const userInfo = JSON.parse(cookieInfo);
      axios
        .get("http://localhost:3000/gomeet/api/room/join-room", {
          headers: {
            token: cookieToken,
          },
          params: { roomid: id },
        })
        .then((response) => {
          const isRoomOwner = response.data.isRoomOwner;
          const idOwner = response.data.owner;
          const roomParticipants = response.data.roomParticipants;
          console.log(roomParticipants);
          setUserInParticipants(roomParticipants);
          setIdOwner(idOwner);
          if (isRoomOwner) {
            // setOwner({
            //   ...owner,
            //   idOwner: idOwner,
            //   isOwner: true,
            // });
            setIsRoomOwner(true);
          } else {
            console.log("Not owner");
            // setOwner({
            //   ...owner,
            //   idOwner: idOwner,
            //   isOwner: false,
            // });
            setIsRoomOwner(false);
          }
        })
        .catch((error) => {
          console.log(error);
          alert(error.response.data.message);
          navigate("/");
        });
    }
  }, []);

  const getCookie = (cookieName) => {
    return Cookies.get(cookieName) || null;
  };

  useEffect(() => {
    const cookieInfo = JSON.parse(getCookie("userInfo"));
    if (cookieInfo) {
      console.log(cookieInfo);
      setAuth({
        ...auth,
        user: {
          fullName: cookieInfo.fullName,
          avatar: cookieInfo.avatar,
          userId: cookieInfo.userId,
        },
      });
    }
  }, []);

  const handleJoinRoom = (e) => {
    e.preventDefault();
    try {
      setOwner({
        ...owner,
        idOwner: idOwner,
        isOwner: isRoomOwner,
      });

      console.log(socket.id);
      console.log("Join Room");

      navigate(`/meeting/${id}`, {
        state: {
          pathName: `/join-meeting/${id}`,
          microphone: toggleMicrophone,
          camera: toggleCamera,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(async() => {
  //  const {data} = await
  // }, [])

  const toggleProfile = () => {
    setToggle(!toggle);
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userInfo");
    navigate("/login");
  };

  return (
    <>
      <header className="flex h-[12vh] w-full justify-between p-4">
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
        <div className="flex items-center gap-4">
          <img
            src={googlemeet}
            alt="Google meet"
            className="h-[42px] w-[42px]"
          />
          <span className="text-2xl text-slate-600">Google Meet</span>
        </div>
        <div className="flex items-center gap-4 text-slate-700">
          <div className="flex flex-col items-end gap-0">
            <span className="text-lg uppercase">{auth?.user?.fullName}</span>
            <span className="text-sm">{auth?.user?.fullName}</span>
          </div>
          <img
            src={
              auth?.user?.avatar != ""
                ? auth?.user?.avatar
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
          </div>
        </div>
      </header>
      <main className="flex h-[78vh] items-center px-24 py-2">
        <div className="relative h-full w-[70%] overflow-hidden rounded-lg">
          <video
            className="h-full w-full object-cover"
            autoPlay
            ref={videoLocal}
          ></video>
          <span className="absolute left-4 top-2 text-lg text-white">
            {auth?.user?.fullName}
          </span>
          <div className="absolute bottom-0 left-[50%] flex h-[8vh] translate-x-[-50%] items-center justify-center gap-8 p-[6px]">
            <div
              className={`h-full w-1/2 rounded-full border border-slate-400 p-2 ${
                toggleMicrophone == true ? "" : "bg-red-500"
              }`}
              onClick={handleToggleMicrophone}
            >
              <img
                src={`${
                  toggleMicrophone == true ? microphone : lockmicrophone
                }`}
                alt="Microphone"
                className="h-full w-full"
              />
            </div>
            <div
              className={`h-full w-1/2 rounded-full border border-slate-400 p-2  ${
                toggleCamera == true ? "" : "bg-red-500"
              }`}
              onClick={handleToggleCamera}
            >
              <img
                src={`${toggleCamera == true ? camera : lockcamera}`}
                alt="Camera"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
        <div className="relative flex w-[30%] flex-col items-center gap-2 rounded-lg pt-4">
          <h1 className="whitespace-nowrap text-3xl text-slate-900">
            Ready to join?
          </h1>
          <div className="flex h-fit flex-nowrap justify-center">
            {userInParticipants.length > 0 &&
              userInParticipants.map((item, index) => (
                <img
                  src={
                    item.avatar ||
                    "https://t4.ftcdn.net/jpg/03/49/49/79/360_F_349497933_Ly4im8BDmHLaLzgyKg2f2yZOvJjBtlw5.jpg"
                  }
                  alt=""
                  className="h-6 w-6 rounded-full"
                />
              ))}
            {/* <img
              src="https://th.bing.com/th/id/OIP.iAhcp6m_91O-ClK79h8EQQHaFj?rs=1&pid=ImgDetMain"
              alt=""
              className="h-6 w-6 rounded-full"
            />
            <img
              src="https://th.bing.com/th/id/OIP.iAhcp6m_91O-ClK79h8EQQHaFj?rs=1&pid=ImgDetMain"
              alt=""
              className="h-6 w-6 rounded-full"
            />
            <img
              src="https://th.bing.com/th/id/OIP.iAhcp6m_91O-ClK79h8EQQHaFj?rs=1&pid=ImgDetMain"
              alt=""
              className="h-6 w-6 rounded-full"
            /> */}
          </div>
          <span>
            {userInParticipants.length > 0 &&
              userInParticipants.map((item, index) => (
                <span className="uppercase">
                  {item?.fullName}
                  {index < userInParticipants.length - 1 && ", "}
                </span>
              ))}{" "}
            is this in room
          </span>
          <button
            className="w-fit rounded-full bg-blue-500 px-6 py-3 text-white"
            onClick={handleJoinRoom}
          >
            {isRoomOwner ? "Join now" : "Ask to join"}
          </button>
        </div>
      </main>
    </>
  );
};

export default JoinMeeting;
