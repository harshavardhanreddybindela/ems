import React, { useState, useEffect } from "react";
import axios from "axios";
import AddEvent from "./AddEvent";
import Navbar from "./Navbar";
import UpdateEvent from "./UpdateEvent";

function Admin() {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [message, setMessage] = useState("");
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [showEventList, setShowEventList] = useState(true); // To toggle between event list and add event form

    useEffect(() => {
        if (showEventList) {
            fetchEvents();
        }
    }, [showEventList]);

    const fetchEvents = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/events/");
            console.log("Fetched Events:", response.data);
            
            if (Array.isArray(response.data)) {
                setEvents(response.data);  // Set event list properly
            } else if (response.data.events && Array.isArray(response.data.events)) {
                setEvents(response.data.events);  // If events are nested inside an object
            } else {
                setMessage("Invalid event data format received.");
            }
        } catch (error) {
            console.error("Fetch Error:", error.response?.data || error.message);
            setMessage("Failed to fetch events.");
        }
    };

    const handleDelete = async (eventId) => {
      if (!eventId) {
          console.log("Invalid event ID.");
          setMessage("Invalid event ID.");
          return;
      }
   
      const token = localStorage.getItem("access_token");
      if (!token) {
          console.log("No token found, user is not logged in.");
          setMessage("You must be logged in as a staff member.");
          return;
      }
   
      try {
          console.log(`Attempting to delete event with ID: ${eventId}`);
   
          const response = await axios.delete(`http://localhost:8000/api/admin/delete/${eventId}/`, {
              headers: { Authorization: `Bearer ${token}` },
          });
   
          console.log("Delete Response:", response.data);  // Log the response from the delete request.
   
          setMessage("Event deleted successfully!");
          setEvents((prevEvents) => prevEvents.filter(event => event.event_id !== eventId));
   
      } catch (error) {
          console.error("Delete Error:", error.response?.data || error.message);  // Log any errors that occur during the delete request.
          setMessage("Failed to delete event.");
      }
   };

   const handleShowAddEvent = () => {
      setShowAddEvent(true);
      setShowEventList(false); // Hide event list when adding a new event
   };

   const handleShowEventList = () => {
      setShowAddEvent(false);
      setShowEventList(true); // Show event list when user wants to view events
   };

    return (
        <div className="container mx-auto p-6">
            {/* Main Navigation Bar */}
            <Navbar />

            {/* Secondary Navigation Bar for Event Actions */}
            <div className="bg-gray-200 p-3 mt-4 rounded-lg flex justify-center gap-6">
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                    onClick={handleShowAddEvent}
                >
                    Add Event
                </button>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    onClick={handleShowEventList}
                >
                    List Events
                </button>
            </div>

            <h2 className="text-3xl font-semibold text-center mt-4">Admin Dashboard</h2>
            {message && <p className="text-center text-red-500 mt-2">{message}</p>}

            {/* Show Add Event Form */}
            {showAddEvent && <AddEvent fetchEvents={fetchEvents} />}

            {/* Show Event List */}
            {showEventList && (
                <>
                    <h3 className="text-2xl font-semibold mt-6">Event List</h3>
                    <div className="mt-4">
                        {events.length > 0 ? (
                            events.map((event) => (
                                <div key={event.event_id} className="bg-white shadow-md p-4 rounded-lg mb-4">
                                    <h4 className="text-lg font-semibold">{event.name}</h4>
                                    <p><strong>Date:</strong> {event.datetime}</p>
                                    <p><strong>Description:</strong> {event.description}</p>
                                    <p><strong>Participant Limit:</strong> {event.participant_limit}</p>
                                    <div className="flex gap-4 mt-2">
                                        <button
                                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                            onClick={() => setSelectedEvent(event)}
                                        >
                                            Update
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                            onClick={() => {
                                                console.log("Deleting Event:", event);
                                                handleDelete(event.event_id); // Pass the event_id here
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No events found.</p>
                        )}
                    </div>
                </>
            )}

            {/* Show Update Event Form */}
            {selectedEvent && <UpdateEvent eventId={selectedEvent.event_id} fetchEvents={fetchEvents} />}
        </div>
    );
}

export default Admin;
