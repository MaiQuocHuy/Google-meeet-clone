import { Routes, Route } from "react-router-dom";
import Home from "./page/Home";
import Meeting from "./page/Meeting";
import JoinMeeting from "./page/JoinMeeting";
import Login from "./page/Login";
import Register from "./page/Register";
import EditProfile from "./page/EditProfile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/meeting/:id" element={<Meeting />} />
      <Route path="/meeting/instant/:id" element={<Meeting />} />
      <Route path="/join-meeting/:id" element={<JoinMeeting />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/edit-profile" element={<EditProfile />} />
    </Routes>
  );
}

export default App;
