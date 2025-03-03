import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate(); // Hook for redirection

    useEffect(() => {
        const fetchSignupPage = async () => {
            try {
                await axios.get("http://localhost:8000/api/signup/");
            } catch (error) {
                console.error("GET request failed:", error.response?.data || error.message);
            }
        };

        fetchSignupPage();
    }, []);

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
            setTimeout(() => navigate("/login"), 2000); // Redirect after 2 seconds
        } catch (error) {
            setMessage("Registration failed: " + (error.response?.data?.error || "Server error"));
        }
    };

    return (
        <div className="container">
            <h2>Sign Up</h2>
            {message && <div className="alert alert-info">{message}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="confirm_password">Confirm Password:</label>
                    <input
                        type="password"
                        className="form-control"
                        id="confirm_password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Sign Up
                </button>
            </form>
        </div>
    );
}

export default Signup;
