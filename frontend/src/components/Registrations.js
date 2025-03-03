import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
        <div>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <Link className="navbar-brand" to="/">Event Management</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link" to="/">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/registrations">My Registrations</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link active" to="/profile">Profile</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/about">About Us</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Registered Events Content */}
            <div className="container mt-4">
                <h1>Welcome, User!</h1>
                <p>Below is your event registration information.</p>

                <h2>Your Registered Events</h2>
                {message && <div className="alert alert-info">{message}</div>}
                {registrations.length > 0 ? (
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Participants Limit</th>
                                <th>Poster</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {registrations.map((registration) => (
                                <tr key={registration.event.event_id}>
                                    <td>{registration.event.name}</td>
                                    <td>{registration.event.datetime}</td>
                                    <td>{registration.event.description}</td>
                                    <td>{registration.event.participant_limit}</td>
                                    <td>
                                        {registration.event.poster ? (
                                            <img
                                                src={registration.event.poster}
                                                alt={`${registration.event.name} poster`}
                                                width="100"
                                            />
                                        ) : (
                                            "No Poster"
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleUnregister(registration.event.event_id)}
                                        >
                                            Unregister
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>You have not registered for any events yet.</p>
                )}
            </div>
        </div>
    );
}

export default RegisteredEvents;
