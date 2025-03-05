import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // Hook for redirection

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            await axios.post("http://localhost:8000/api/signup/", {
                email,
                password,
                confirm_password: confirmPassword,
            });

            setMessage("Registration successful. Redirecting to login...");
            setTimeout(() => navigate("/"), 2000); // Redirect after 2 seconds
        } catch (error) {
            setMessage("Registration failed: " + (error.response?.data?.error || "Server error"));
        }
    };

    return (
        <div>
            <Navbar/>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Sign Up</h2>

                {message && (
                    <div className={`text-center py-2 px-4 rounded-md mb-4 ${message.includes("failed") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-gray-600 font-medium">Email:</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-gray-600 font-medium">Password:</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-600 font-medium">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white font-medium py-3 rounded-md hover:bg-blue-600 transition duration-300"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-4">
                    Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a>
                </p>
            </div>
        </div>
        </div>
    );
}

export default Signup;
