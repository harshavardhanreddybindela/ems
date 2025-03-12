import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";

function Home() {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await axios.get("http://localhost:8000/api/events/");
        setEvents(eventsResponse.data.events);

        const token = localStorage.getItem("access_token");
        const registrationsResponse = await axios.get("http://localhost:8000/api/registrations/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMyRegistrations(registrationsResponse.data.registrations);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if an event is expired
  const isEventExpired = (eventDatetime) => {
    const eventDate = new Date(eventDatetime);
    const currentDate = new Date();
    return eventDate < currentDate; // If event date is in the past, it's expired
  };

  // Convert event time to the user's local timezone
  const formatDateTime = (eventDatetime) => {
    const eventDate = new Date(eventDatetime);
    return eventDate.toLocaleString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  // Filter out expired events
  const validEvents = events.filter(event => !isEventExpired(event.datetime));

  // Handle event registration
  const handleRegister = async (event_id) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `http://localhost:8000/api/register-event/${event_id}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message || "Successfully registered!");

      // Update event list with updated participant count
      setEvents(events.map(event => 
        event.event_id === event_id ? { ...event, participant_limit: event.participant_limit - 1 } : event
      ));

      setMyRegistrations([...myRegistrations, events.find(event => event.event_id === event_id)]);
    } catch (error) {
      setMessage(error.response?.data?.error || "Registration failed.");
    }
  };

  // Handle event unregistration
  const handleUnregister = async (event_id) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`http://localhost:8000/api/unregister/${event_id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Successfully unregistered.");

      // Update event list with increased participant count
      setEvents(events.map(event => 
        event.event_id === event_id ? { ...event, participant_limit: event.participant_limit + 1 } : event
      ));

      setMyRegistrations(myRegistrations.filter(event => event.event_id !== event_id));
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to unregister.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-semibold text-center text-gray-800">Welcome to the Event Management System</h2>

        {message && (
          <p className={`text-center mt-2 p-2 rounded-md ${message.includes("failed") ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
            {message}
          </p>
        )}

        {loading ? (
          <p className="text-center text-gray-500 mt-4">Loading events...</p>
        ) : (
          <>
            <h3 className="text-2xl font-semibold text-gray-800 mt-8">Upcoming Events</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {validEvents.length > 0 ? (
                validEvents.map((event) => (
                  <div key={event.event_id} className="bg-white shadow-lg p-6 rounded-lg">
                    {event.poster && (
                      <img
                        src={`http://localhost:8000/media/${event.poster}`}
                        alt="Event Poster"
                        className="w-full h-48 object-cover rounded mt-4"
                      />
                    )}
                    <h4 className="text-xl font-bold text-gray-800">{event.name}</h4>
                    <p className="text-gray-600">{event.description}</p>
                    <p className="text-gray-500 mt-2">📅 {formatDateTime(event.datetime)}</p>
                    <p className="text-gray-500">👥 Limit: {event.participant_limit}</p>

                    {/* Show "Filled" if event is full */}
                    {event.participant_limit === 0 ? (
                      <p className="text-red-600 mt-3 font-semibold">This event is full.</p>
                    ) : (
                      <button
                        className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                        onClick={() => handleRegister(event.event_id)}
                      >
                        Register
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No upcoming events available.</p>
              )}
            </div>

            <h3 className="text-2xl font-semibold text-gray-800 mt-8">Your Registrations</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {myRegistrations.length > 0 ? (
                myRegistrations.map((registration) => (
                  <div key={registration.event_id} className="bg-white shadow-lg p-6 rounded-lg">
                    <h4 className="text-xl font-bold text-gray-800">{registration.name}</h4>
                    <p className="text-gray-600">{registration.description}</p>
                    <p className="text-gray-500 mt-2">📅 {formatDateTime(registration.datetime)}</p>
                    <button
                      className="mt-3 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                      onClick={() => handleUnregister(registration.event_id)}
                    >
                      Unregister
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">You have no event registrations.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
