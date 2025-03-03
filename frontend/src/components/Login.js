import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLoginPage = async () => {
            try {
                await axios.get("http://localhost:8000/api/login/");
            } catch (error) {
                console.error("GET request failed:", error.response?.data || error.message);
            }
        };

        fetchLoginPage();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await axios.post("http://localhost:8000/api/login/", {
                email,
                password,
            });

            setMessage("Login Successful");
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);

            setTimeout(() => navigate("/home"), 1500); // Redirect to home after 1.5 seconds
        } catch (error) {
            setMessage("Login Failed: " + (error.response?.data?.error || "Server Error"));
        }
    };

    return (
        <div className="container">
            <h2>Login</h2>
            {message && <div className={`alert ${message.includes("Failed") ? "alert-danger" : "alert-success"}`}>{message}</div>}
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
                <button type="submit" className="btn btn-primary">
                    Login
                </button>
            </form>
        </div>
    );
}

export default Login;
