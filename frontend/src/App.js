import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login'; // Ensure you have a Login component
import Signup from './components/Signup';
import Home from './components/Home'; // Ensure you have a Login component
import About from './components/About';
import Registrations from './components/Registrations';

// Main App component
function App() {
  return (
    <Router>
      <Routes>
      <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/registrations" element={<Registrations />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
