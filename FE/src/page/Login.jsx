import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username && password) {
      try {
        const data = await axios.post(
          "http://localhost:3000/gomeet/api/login",
          {
            username,
            password,
          },
        );
        console.log(data);
        const token = data.data.token;
        const email = data.data.email;
        const fullName = data.data.fullName;
        const userId = data.data.userId;
        const avatar = data.data.avatar;
        if (data.status == 200) {
          Cookies.set("token", token, { expires: 3 });
          Cookies.set(
            "userInfo",
            JSON.stringify({
              email: email,
              fullName: fullName,
              userId: userId,
              avatar: avatar,
            }),
            { expires: 3 },
          );
          navigate("/");
        }
      } catch (error) {
        const { response } = error;
        setError(response.data.message);
        // if (response.data.status == 404) {
        //   setError(response.data.message);
        // } else {
        //   console.log(error);
        // }
      }
    }
  };

  return (
    <div className="container mx-auto my-5 flex flex-col rounded-lg bg-white pt-12">
      <div className="draggable my-auto flex h-full w-full justify-center md:gap-5 lg:justify-normal xl:gap-14">
        <div className="flex w-full items-center justify-center lg:p-12">
          <div className="flex items-center xl:p-10">
            <form
              className="flex h-full w-full flex-col rounded-3xl bg-white pb-6 text-center"
              onSubmit={handleLogin}
            >
              <h3 className="text-dark-grey-900 mb-3 text-4xl font-extrabold">
                Sign In
              </h3>
              <p className="text-grey-700 mb-4">
                Enter your username and password
              </p>

              <div className="mb-3 flex items-center">
                <hr className="border-grey-500 h-0 grow border-b border-solid" />
                <p className="text-grey-600 mx-4">or</p>
                <hr className="border-grey-500 h-0 grow border-b border-solid" />
              </div>
              <label
                htmlFor="username"
                className="text-grey-900 mb-2 text-start text-sm"
              >
                Username*
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setError("");
                  setUsername(e.target.value);
                }}
                placeholder="Enter a name"
                className="text-grey-900 mb-2 rounded-lg border border-gray-300 px-4 py-3 text-start text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-purple-600"
              />
              <label
                htmlFor="password"
                className="text-grey-900 mb-2 text-start text-sm"
              >
                Password*
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setError("");
                  setPassword(e.target.value);
                }}
                placeholder="Enter a password"
                className="text-grey-900 mb-2 rounded-lg border border-gray-300 px-4 py-3 text-start text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-purple-600"
              />
              {/* 
              <div className="mb-2 flex flex-row justify-between">
                <a
                  href="#"
                  className="text-purple-blue-500 mr-4 text-sm font-medium"
                >
                  Forget password?
                </a>
              </div>
           */}
              {error != "" && (
                <span className="mb-2 inline-block text-red-500">{error}</span>
              )}
              <button className="hover:bg-purple-blue-700 focus:ring-purple-blue-100 mb-5 w-full rounded-2xl bg-purple-600 px-6 py-5 text-sm font-bold leading-none text-white transition duration-300 focus:ring-4 md:w-96">
                Sign In
              </button>
              <p className="text-grey-900 text-sm leading-relaxed">
                Not registered yet?{" "}
                <Link to="/register" className="text-grey-700 font-bold">
                  Create an Account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
