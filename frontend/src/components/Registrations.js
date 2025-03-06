import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function RegisteredEvents() {
    const [registrations, setRegistrations] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) {
                    setMessage("You must be logged in to view registered events.");
                    return;
                }

                const response = await axios.get("http://localhost:8000/api/registrations/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log("API Response:", response.data); // Debugging log
                setRegistrations(response.data.registrations || response.data);
            } catch (error) {
                console.error("Error fetching registrations:", error);
                setMessage("Failed to load registered events.");
            }
        };

        fetchRegistrations();
    }, []);

    const handleUnregister = async (event_id) => {
        try {
            const token = localStorage.getItem("access_token");
            await axios.delete(`http://localhost:8000/api/unregister/${event_id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setRegistrations((prevRegistrations) =>
                prevRegistrations.filter((reg) => (reg.event ? reg.event.event_id !== event_id : reg.event_id !== event_id))
            );
            setMessage("Successfully unregistered from the event.");
        } catch (error) {
            console.error("Error unregistering:", error);
            setMessage("Failed to unregister from the event.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-semibold text-gray-800 text-center">Your Registered Events</h1>
                {message && <p className="text-center text-red-500 mt-2">{message}</p>}

                {registrations.length > 0 ? (
                    <div className="table-container mt-6">
                        <table className="table-style w-full">
                            <thead>
                                <tr className="table-header">
                                    <th className="p-4">Event Name</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Participants Limit</th>
                                    <th className="p-4">Poster</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.map((registration) => {
                                    const event = registration.event || registration;
                                    return (
                                        <tr key={event.event_id} className="table-row">
                                            <td className="p-4">{event.name}</td>
                                            <td className="p-4">{event.datetime}</td>
                                            <td className="p-4">{event.description}</td>
                                            <td className="p-4">{event.participant_limit}</td>
                                            <td className="p-4">
                                                {event.poster ? (
                                                    <img
                                                        src={event.poster}
                                                        alt={`${event.name} poster`}
                                                        className="w-24 h-16 object-cover rounded-md"
                                                    />
                                                ) : (
                                                    "No Poster"
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                                                    onClick={() => handleUnregister(event.event_id)}
                                                >
                                                    Unregister
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 text-center mt-4">You have not registered for any events yet.</p>
                )}
            </div>
        </div>
    );
}

export default RegisteredEvents;
