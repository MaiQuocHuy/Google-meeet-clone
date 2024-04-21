import axios from "axios";
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password == confirmpassword) {
      try {
        const data = await axios.post(
          "http://localhost:3000/gomeet/api/register",
          {
            fullName: fullname,
            username,
            password,
            email,
          },
        );
        console.log(data);
        if (data) {
          navigate("/login");
        }
      } catch (error) {
        console.log(error);
        setError(error.response.data.message);
        // if (error.response.status) {
        //   // alert(error.response.data.message);
        // } else {
        //   console.log(error);
        // }
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center overflow-hidden bg-indigo-100">
      <div className="w-2/3 md:w-1/2 lg:w-2/5">
        <div
          className="min-w-full rounded-lg bg-white p-10 shadow-lg"
          // onSubmit={handleSubmit}
        >
          <h1 className="mb-6 text-center font-sans text-2xl font-bold text-gray-600">
            Form Register
          </h1>
          <div>
            <label
              className="text-md my-3 block font-semibold text-gray-800"
              htmlFor="Fullname"
            >
              FullName
            </label>
            <input
              className="text-grey-900 mb-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-start text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-purple-600"
              type="text"
              name="fullname"
              id="fullname"
              value={fullname}
              onChange={(e) => {
                setError("");
                setFullname(e.target.value);
              }}
              placeholder="fullname"
            />
          </div>
          <div>
            <label
              className="text-md my-3 block font-semibold text-gray-800"
              htmlFor="username"
            >
              Username
            </label>
            <input
              className="text-grey-900 mb-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-start text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-purple-600"
              type="text"
              name="username"
              id="username"
              value={username}
              onChange={(e) => {
                setError("");
                setUsername(e.target.value);
              }}
              placeholder="username"
            />
          </div>
          <div>
            <label
              className="text-md my-3 block font-semibold text-gray-800"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="text-grey-900 mb-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-start text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-purple-600"
              type="text"
              name="email"
              id="email"
              value={email}
              onChange={(e) => {
                setError("");
                setEmail(e.target.value);
              }}
              placeholder="@email"
            />
          </div>
          <div>
            <label
              className="text-md my-3 block font-semibold text-gray-800"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="text-grey-900 mb-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-start text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-purple-600"
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => {
                setError("");
                setPassword(e.target.value);
              }}
              placeholder="password"
            />
          </div>
          <div>
            <label
              className="text-md my-3 block font-semibold text-gray-800"
              htmlFor="confirm"
            >
              Confirm password
            </label>
            <input
              className="text-grey-900 mb-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-start text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-purple-600"
              type="password"
              name="confirm"
              id="confirm"
              value={confirmpassword}
              onChange={(e) => {
                setError("");
                setConfirmpassword(e.target.value);
              }}
              placeholder="confirm password"
            />
          </div>
          {error != "" && (
            <span className="mb-2 inline-block text-red-500">{error}</span>
          )}
          <button
            type="button"
            className="mt-6 w-full rounded-lg bg-purple-600 px-4 py-2 font-sans text-lg font-semibold tracking-wide text-slate-200"
            onClick={handleSubmit}
          >
            Register
          </button>
          <button
            type="button"
            className="mb-3 mt-6 w-full rounded-lg bg-indigo-100 px-4 py-2 font-sans text-lg font-semibold tracking-wide text-gray-800"
            onClick={() => {
              navigate("/login");
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
