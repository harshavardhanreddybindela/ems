import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Registrations from "./components/Registrations";
import Profile from "./components/Profile";
import About from "./components/About";
import Logout from "./components/Logout";
import Signup from "./components/Signup";
import Admin from "./components/Admin";
import AddEvent from "./components/AddEvent";
import UpdateEvent from "./components/UpdateEvent";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="register" element={<Signup/>} />
        <Route path="/home" element={<Home />} />
        <Route path="/registrations" element={<Registrations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="admin/add_event" element = {<AddEvent/>}/>
        <Route path="admin/update_event/:eventId" element={<UpdateEvent />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
}

export default App;
