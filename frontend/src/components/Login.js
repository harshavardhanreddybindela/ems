import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await axios.post("http://localhost:8000/api/login/", {
                email,
                password,
            });

            setMessage("Login Successful!");
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);

            setTimeout(() => navigate("/home"), 1500); // Redirect to home after 1.5 seconds
        } catch (error) {
            setMessage("Login Failed: " + (error.response?.data?.error || "Server Error"));
        }
    };

    return (
        <div>
            <Navbar/>
        
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Login</h2>
                
                {message && (
                    <div
                        className={`text-center py-2 px-4 rounded-md mb-4 ${
                            message.includes("Failed") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}
                    >
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

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white font-medium py-3 rounded-md hover:bg-blue-600 transition duration-300"
                    >
                        Login
                    </button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-4">
                    Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Register</a>
                </p>
            </div>
        </div>
        </div>
    );
}

export default Login;
