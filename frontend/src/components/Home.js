import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Home() {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch events and user's registrations
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events
        const eventsResponse = await axios.get("http://localhost:8000/api/events/");
        setEvents(eventsResponse.data.events);

        // Fetch my registrations
        const registrationsResponse = await axios.get("http://localhost:8000/api/event-registrations/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setMyRegistrations(registrationsResponse.data.registrations);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Logout functionality
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8000/api/logout/", {}, {
        withCredentials: true,
      });
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="/">Event Management</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item active">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/registrations" className="nav-link">My Registrations</Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link">About Us</Link>
            </li>
            <li className="nav-item">
              <Link to="/profile" className="nav-link">Profile</Link>
            </li>
            <li className="nav-item">
              <button onClick={handleLogout} className="btn btn-link nav-link">Logout</button>
            </li>
          </ul>
        </div>
      </nav>

      <h2>Welcome to the Event Management System</h2>
      <p>{message}</p>

      <h3>Upcoming Events</h3>
      <div className="event-list">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.event_id} className="event">
              <h4>{event.name}</h4>
              <p>{event.description}</p>
              <p>Date: {event.datetime}</p>
              <p>Limit: {event.participant_limit}</p>
              <button className="btn btn-primary">Register</button>
            </div>
          ))
        ) : (
          <p>No upcoming events available.</p>
        )}
      </div>

      <h3>Your Registrations</h3>
      <div className="my-registrations">
        {myRegistrations.length > 0 ? (
          myRegistrations.map((registration) => (
            <div key={registration.event_id} className="registration">
              <h4>{registration.name}</h4>
              <p>{registration.description}</p>
              <p>Date: {registration.datetime}</p>
              <button className="btn btn-danger">Unregister</button>
            </div>
          ))
        ) : (
          <p>You have no event registrations.</p>
        )}
      </div>
    </div>
  );
}

export default Home;
