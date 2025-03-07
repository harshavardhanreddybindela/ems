import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddEvent from "./AddEvent";
import Navbar from "./Navbar";
import UpdateEvent from "./UpdateEvent";

function Admin() {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [message, setMessage] = useState("");
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [showEventList, setShowEventList] = useState(true);
    const navigate = useNavigate();

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
                setEvents(response.data);
            } else if (response.data.events && Array.isArray(response.data.events)) {
                setEvents(response.data.events);
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
            setMessage("Invalid event ID.");
            return;
        }

        const token = localStorage.getItem("access_token");
        if (!token) {
            setMessage("You must be logged in as a staff member.");
            return;
        }

        try {
            await axios.delete(`http://localhost:8000/api/admin/delete/${eventId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setMessage("Event deleted successfully!");
            setEvents((prevEvents) => prevEvents.filter(event => event.event_id !== eventId));
        } catch (error) {
            console.error("Delete Error:", error.response?.data || error.message);
            setMessage("Failed to delete event.");
        }
    };

    const handleShowAddEvent = () => {
        setShowAddEvent(true);
        setShowEventList(false);
        setSelectedEventId(null);
    };

    const handleShowEventList = () => {
        setShowAddEvent(false);
        setShowEventList(true);
        setSelectedEventId(null);
    };

    const handleUpdateClick = (eventId) => {
      console.log("Entered function"+eventId);
        if (!eventId) {
            setMessage("Invalid event ID.");
            return;
        }
        setSelectedEventId(eventId);
        setShowAddEvent(false);
        setShowEventList(false);
        navigate(`/admin/update_event/${eventId}`);
    };

    return (
        <div className="container mx-auto p-6">
            <Navbar />

            <div className="bg-gray-200 p-3 mt-4 rounded-lg flex justify-center gap-6">
                <button className="bg-green-500 text-white px-4 py-2 rounded-md" onClick={handleShowAddEvent}>
                    Add Event
                </button>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleShowEventList}>
                    List Events
                </button>
            </div>

            <h2 className="text-3xl font-semibold text-center mt-4">Admin Dashboard</h2>
            {message && <p className="text-center text-red-500 mt-2">{message}</p>}

            {showAddEvent && <AddEvent fetchEvents={fetchEvents} />}

            {showEventList && (
                <>
                    <h3 className="text-2xl font-semibold mt-6">Event List</h3>
                    <div className="mt-4">
                        {events.length > 0 ? (
                            events.map((event) => (
                                <div key={event.event_id} className="bg-white shadow-md p-4 rounded-lg mb-4">
                                    {event.poster && (
                            <img 
                            src={`http://localhost:8000/media/${event.poster}`} 
                            alt="Event Poster" 
                            className="w-full h-48 object-cover rounded mt-4"
                        />
                        )}
                                    <h4 className="text-lg font-semibold">{event.name}</h4>
                                    <p><strong>Date:</strong> {event.datetime}</p>
                                    <p><strong>Description:</strong> {event.description}</p>
                                    <p><strong>Participant Limit:</strong> {event.participant_limit}</p>
                                    <div className="flex gap-4 mt-2">
                                        <button
                                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                            onClick={() => handleUpdateClick(event.event_id)}
                                        >
                                            Update
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                            onClick={() => handleDelete(event.event_id)}
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

            {selectedEventId && <UpdateEvent />}
        </div>
    );
}

export default Admin;
