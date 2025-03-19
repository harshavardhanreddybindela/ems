import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

function Profile() {
    const [name, setName] = useState(""); // To store the name
    const [email, setEmail] = useState(""); // To store the email
    const [password, setPassword] = useState(""); // To store the password
    const [newPassword, setNewPassword] = useState(""); // To store new password
    const [confirmPassword, setConfirmPassword] = useState(""); // To store confirm password
    const [isEditing, setIsEditing] = useState(false); // To handle edit mode
    const [editField, setEditField] = useState(null); // To track which field is being edited
    const [passwordError, setPasswordError] = useState(""); // To store password mismatch error
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // To handle error state
    const navigate = useNavigate();

    // Fetch user details when the component is mounted
    useEffect(() => {
        const fetchUserDetails = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                console.error("No token found, please log in.");
                navigate("/login"); // Redirect to login if no token
                return;
            }

            try {
                const response = await fetch("http://localhost:8000/api/profile/", {  // Update with correct API endpoint
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setName(data.name);
                    setEmail(data.email);
                    setPassword("********"); // Hide the password for security reasons
                    setIsLoading(false); // Set loading to false after data is fetched
                } else {
                    console.error("Failed to fetch user details");
                    if (response.status === 401) {
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("refresh_token");
                        navigate("/login"); // Token expired or invalid, redirect to login
                    }
                }
            } catch (error) {
                setError("Error fetching user details");
                setIsLoading(false); // Stop loading on error
                console.error("Error fetching user details:", error);
            }
        };

        fetchUserDetails();
    }, [navigate]);

    // Handle form submit to update user profile
    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("access_token");
        if (!token) {
            console.error("No token found, please log in.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match!");
            return;
        }

        const data = {
            name,
            email,
            password: newPassword ? newPassword : password, // Send the new password if provided
        };

        const response = await fetch("http://localhost:8000/api/profile/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            console.log("User details updated:", result);
            setName(result.name); // Set the updated name from response
            setEmail(result.email); // Set the updated email from response
            setPassword("********"); // Hide the password after update for security
            setIsEditing(false); // Exit edit mode
            setEditField(null); // Reset field being edited
            setNewPassword(""); // Clear the new password
            setConfirmPassword(""); // Clear the confirm password
            setPasswordError(""); // Reset password error message
        } else {
            console.error("Failed to update user details:", result);
            setError("Failed to update user details");
        }
    };

    // If loading, show loading message
    if (isLoading) {
        return (
            <div>
                <Navbar />
                <div className="container mx-auto p-6 text-center">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // If there's an error, show error message
    if (error) {
        return (
            <div>
                <Navbar />
                <div className="container mx-auto p-6 text-center text-red-500">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            {/* Profile Content */}
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-semibold text-gray-800 text-center">Profile</h1>
                <p className="text-center text-red-500 mt-2">Your Profile Settings.</p>

                {/* Profile Details */}
                <div className="mt-6 max-w-lg mx-auto">
                    {/* Name Field */}
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-600">Name</label>
                        {!isEditing || editField !== 'name' ? (
                            <div className="flex justify-between">
                                <p>{name}</p>
                                <button onClick={() => { setEditField('name'); setIsEditing(true); }} className="text-blue-500">Edit</button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Enter your name"
                                />
                                <button onClick={() => setEditField(null)} className="text-gray-500 mt-2">Cancel</button>
                            </div>
                        )}
                    </div>

                    {/* Email Field */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-600">Email</label>
                        {!isEditing || editField !== 'email' ? (
                            <div className="flex justify-between">
                                <p>{email}</p>
                                <button onClick={() => { setEditField('email'); setIsEditing(true); }} className="text-blue-500">Edit</button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Enter your email"
                                />
                                <button onClick={() => setEditField(null)} className="text-gray-500 mt-2">Cancel</button>
                            </div>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-600">Password</label>
                        {isEditing && editField === 'password' ? (
                            <div>
                                <input
                                    type="password"
                                    id="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Enter your new password"
                                />
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Confirm your new password"
                                />
                                {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                                <button onClick={() => setEditField(null)} className="text-gray-500 mt-2">Cancel</button>
                            </div>
                        ) : (
                            <div className="flex justify-between">
                                <p>********</p>
                                <button onClick={() => { setEditField('password'); setIsEditing(true); }} className="text-blue-500">Change Password</button>
                            </div>
                        )}
                    </div>

                    {/* Save Changes Button */}
                    {isEditing && (
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-green-600 text-white p-2 rounded-md"
                        >
                            Save Changes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
