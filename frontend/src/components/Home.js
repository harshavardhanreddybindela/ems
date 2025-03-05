import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";

function Home() {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [message, setMessage] = useState("");
  // const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await axios.get("http://localhost:8000/api/events/");
        setEvents(eventsResponse.data.events);
        if (eventsResponse.data.events.length === 0) {
          setMessage("No upcoming events at the moment.");
        }

        const registrationsResponse = await axios.get("http://localhost:8000/api/registrations/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setMyRegistrations(registrationsResponse.data.registrations);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Failed to load events. Please try again later.");
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-semibold text-center text-gray-800">Welcome to the Event Management System</h2>
        {message && <p className="text-center text-red-500 mt-2">{message}</p>}

        {/* Upcoming Events Section */}
        <h3 className="text-2xl font-semibold text-gray-800 mt-8">Upcoming Events</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.event_id} className="bg-white shadow-lg p-6 rounded-lg">
                <h4 className="text-xl font-bold text-gray-800">{event.name}</h4>
                <p className="text-gray-600">{event.description}</p>
                <p className="text-gray-500 mt-2">📅 {event.datetime}</p>
                <p className="text-gray-500">👥 Limit: {event.participant_limit}</p>
                <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                  Register
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No upcoming events available.</p>
          )}
        </div>

        {/* My Registrations Section */}
        <h3 className="text-2xl font-semibold text-gray-800 mt-8">Your Registrations</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {myRegistrations.length > 0 ? (
            myRegistrations.map((registration) => (
              <div key={registration.event_id} className="bg-white shadow-lg p-6 rounded-lg">
                <h4 className="text-xl font-bold text-gray-800">{registration.name}</h4>
                <p className="text-gray-600">{registration.description}</p>
                <p className="text-gray-500 mt-2">📅 {registration.datetime}</p>
                <button className="mt-3 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                  Unregister
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">You have no event registrations.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
