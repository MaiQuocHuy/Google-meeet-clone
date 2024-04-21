import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [userName, setUserName] = useState("");
  const [avatarOld, setAvatarOld] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const userInfo = JSON.parse(getCookie("userInfo"));
    if (userInfo) {
      const { fullName, userId, email, avatar } = userInfo;
      console.log(userInfo);
      setUserName(fullName);
      setAvatarOld(
        avatar == " "
          ? "https://www.sim.edu.vn/en/wp-content/uploads/2019/07/blank-avatar.jpg"
          : avatar,
      );
      setEmail(email);
      setUserId(userId);
    }
  }, []);

  const getCookie = (cookieName) => {
    return Cookies.get(cookieName) || null;
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    if (userName == "") {
      alert("Please fill all the fields");
      return;
    }

    try {
      const data = await axios.post(
        "http://localhost:3000/gomeet/api/user/update-infor",
        {
          fullName: userName,
          userID: userId,
          email: email,
          image: avatarOld,
        },
        {
          headers: {
            token: getCookie("token"),
          },
        },
      );
      // console.log(data);
      if (data.status == 200) {
        Cookies.set(
          "userInfo",
          JSON.stringify({
            email: email,
            fullName: userName,
            userId: userId,
            avatar: avatarOld,
          }),
          { expires: 3 },
        );
        alert(data.data.message);
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const formData = new FormData();
      formData.append("image", selectedFile);
      const { data } = await axios.post(
        "http://localhost:3000/gomeet/api/user/upload-img",
        formData, // Move formData to be the second argument
        {
          headers: {
            token: getCookie("token"),
            "Content-Type": "multipart/form-data", // Don't forget to set the Content-Type
          },
        },
      );
      setAvatarOld(data.data.url);
    }
  };

  return (
    <div className="container mx-auto my-5 flex flex-col rounded-lg bg-white pt-12">
      <div className="draggable my-auto flex h-full w-full justify-center md:gap-5 lg:justify-normal xl:gap-14">
        <div className="flex w-full items-center justify-center lg:p-12">
          <div className="flex items-center xl:p-10">
            <form
              className="flex h-full w-full flex-col gap-2 rounded-3xl bg-white pb-6 text-center"
              onSubmit={handleEditProfile}
            >
              <h3 className="text-dark-grey-900 mb-3 text-4xl font-extrabold">
                Edit Profile
              </h3>
              {/* <p className="text-grey-700 mb-4">
                Enter your email and password
              </p> */}

              <div className="mb-3 flex items-center">
                <hr className="border-grey-500 h-0 grow border-b border-solid" />
                <p className="text-grey-600 mx-4">or</p>
                <hr className="border-grey-500 h-0 grow border-b border-solid" />
              </div>
              <label
                htmlFor="username"
                className="text-grey-900 mb-2 text-start text-sm"
              >
                UserName*
              </label>
              <input
                id="UserName"
                type="text"
                placeholder="UserName"
                className="text-grey-900 mb-2 rounded-lg border border-gray-300 px-4 py-3 text-start text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-purple-600"
                onChange={(e) => setUserName(e.target.value)}
                value={userName}
              />

              <label
                class="text-grey-900 mb-2 block text-start text-sm dark:text-white"
                for="file_input"
              >
                Upload file
              </label>
              <input
                class="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
                aria-describedby="file_input_help"
                id="file_input"
                type="file"
                onChange={handleFileChange}
              />
              {avatarOld != "" ? (
                <img
                  src={avatarOld}
                  alt="Image"
                  className="max-h-[300px] max-w-[382px] object-fill"
                />
              ) : (
                <></>
              )}
              <p
                class="mt-1 text-sm text-gray-500 dark:text-gray-300"
                id="file_input_help"
              >
                SVG, PNG, JPG or GIF (MAX. 800x400px).
              </p>

              <button className="hover:bg-purple-blue-700 focus:ring-purple-blue-100 mb-5 mt-[20px] w-full rounded-2xl bg-purple-600 px-6 py-5 text-sm font-bold leading-none text-white transition duration-300 focus:ring-4 md:w-96">
                Update Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
