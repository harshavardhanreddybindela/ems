import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function UpdateEvent() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        datetime: "",
        description: "",
        participant_limit: "",
        poster: null,
    });
    const [message, setMessage] = useState("");
    console.log("Event ID from URL:", eventId);
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/events/${eventId}/`);
                setFormData({
                    name: response.data.name,
                    datetime: response.data.datetime,
                    description: response.data.description,
                    participant_limit: response.data.participant_limit,
                    poster: null, // Poster is optional
                });
            } catch (error) {
                setMessage("Failed to fetch event details.");
            }
        };
        fetchEvent();
    }, [eventId]);

    const handleChange = (e) => {
        if (e.target.name === "poster") {
            setFormData({ ...formData, poster: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("access_token");

        if (!token) {
            setMessage("You must be logged in as a staff member.");
            return;
        }

        const form = new FormData();
        form.append("name", formData.name);
        form.append("datetime", formData.datetime);
        form.append("description", formData.description);
        if (formData.participant_limit) form.append("participant_limit", formData.participant_limit);
        if (formData.poster) form.append("poster", formData.poster);

        try {
            await axios.put(`http://localhost:8000/api/update-event/${eventId}/`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setMessage("Event updated successfully!");
            navigate("/events"); // Redirect back to event list
        } catch (error) {
            setMessage(error.response?.data?.error || "Failed to update event.");
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-semibold text-center">Update Event</h2>
            {message && <p className="text-center text-red-500 mt-2">{message}</p>}

            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
                <label className="block text-gray-700">Event Name:</label>
                <input
                    type="text"
                    name="name"
                    className="w-full p-2 border rounded-md"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <label className="block text-gray-700 mt-3">Date & Time:</label>
                <input
                    type="datetime-local"
                    name="datetime"
                    className="w-full p-2 border rounded-md"
                    value={formData.datetime}
                    onChange={handleChange}
                    required
                />

                <label className="block text-gray-700 mt-3">Description:</label>
                <textarea
                    name="description"
                    className="w-full p-2 border rounded-md"
                    value={formData.description}
                    onChange={handleChange}
                    required
                ></textarea>

                <label className="block text-gray-700 mt-3">Participant Limit:</label>
                <input
                    type="number"
                    name="participant_limit"
                    className="w-full p-2 border rounded-md"
                    value={formData.participant_limit}
                    onChange={handleChange}
                />

                <label className="block text-gray-700 mt-3">Upload New Poster (Optional):</label>
                <input
                    type="file"
                    name="poster"
                    className="w-full p-2 border rounded-md"
                    onChange={handleChange}
                />

                <button type="submit" className="mt-4 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
                    Update Event
                </button>
            </form>
        </div>
    );
}

export default UpdateEvent;
