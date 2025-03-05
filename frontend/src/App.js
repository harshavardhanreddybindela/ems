import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Registrations from "./components/Registrations";
import Profile from "./components/Profile";
import About from "./components/About";
import Logout from "./components/Logout";
import Signup from "./components/Signup";
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
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
}

export default App;
