import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function RegisteredEvents() {
    const [registrations, setRegistrations] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/registered-events/", {
                    headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
                });
                setRegistrations(response.data);
            } catch (error) {
                console.error("Error fetching registrations:", error);
                setMessage("Failed to load registered events.");
            }
        };

        fetchRegistrations();
    }, []);

    const handleUnregister = async (eventId) => {
        try {
            await axios.post(
                `http://localhost:8000/api/unregister-event/${eventId}/`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
            );

            setRegistrations(registrations.filter((reg) => reg.event.event_id !== eventId));
            setMessage("Successfully unregistered from the event.");
        } catch (error) {
            console.error("Error unregistering:", error);
            setMessage("Failed to unregister from the event.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Reusable Navbar */}
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
                                {registrations.map((registration) => (
                                    <tr key={registration.event.event_id} className="table-row">
                                        <td className="p-4">{registration.event.name}</td>
                                        <td className="p-4">{registration.event.datetime}</td>
                                        <td className="p-4">{registration.event.description}</td>
                                        <td className="p-4">{registration.event.participant_limit}</td>
                                        <td className="p-4">
                                            {registration.event.poster ? (
                                                <img
                                                    src={registration.event.poster}
                                                    alt={`${registration.event.name} poster`}
                                                    className="w-24 h-16 object-cover rounded-md"
                                                />
                                            ) : (
                                                "No Poster"
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <button
                                                className="btn-danger"
                                                onClick={() => handleUnregister(registration.event.event_id)}
                                            >
                                                Unregister
                                            </button>
                                        </td>
                                    </tr>
                                ))}
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
