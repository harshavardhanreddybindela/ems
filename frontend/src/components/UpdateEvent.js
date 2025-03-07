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
    const [existingPoster, setExistingPoster] = useState(""); // Store existing poster URL
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchEvent = async () => {
            const token = localStorage.getItem("access_token");

            if (!token) {
                setMessage("You must be logged in as a staff member.");
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8000/api/admin/update/${eventId}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setFormData({
                    name: response.data.name,
                    datetime: response.data.datetime ? response.data.datetime.slice(0, 16) : "",
                    description: response.data.description,
                    participant_limit: response.data.participant_limit,
                    poster: null,
                });

                if (response.data.poster) {
                    setExistingPoster(response.data.poster);
                }
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
            await axios.put(`http://localhost:8000/api/admin/update/${eventId}/`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setMessage("Event updated successfully!");
            setTimeout(() => navigate("/admin"), 1500); // Redirect to events page after success
        } catch (error) {
            setMessage(error.response?.data?.error || "Failed to update event.");
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-3xl font-semibold text-center">Update Event</h2>
            {message && <p className="text-center text-red-500 mt-2">{message}</p>}
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
                <div className="mb-4">
                    <label className="block text-gray-700">Event Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Date & Time</label>
                    <input
                        type="datetime-local"
                        name="datetime"
                        value={formData.datetime}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Participant Limit</label>
                    <input
                        type="number"
                        name="participant_limit"
                        value={formData.participant_limit}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                {existingPoster && (
                    <div className="mb-4">
                        <label className="block text-gray-700">Current Poster</label>
                        <img src={existingPoster} alt="Event Poster" className="w-32 h-32 object-cover rounded" />
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-gray-700">Upload New Poster</label>
                    <input type="file" name="poster" onChange={handleChange} className="w-full p-2 border rounded" />
                </div>

                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
                    Update Event
                </button>
            </form>
        </div>
    );
}

export default UpdateEvent;
