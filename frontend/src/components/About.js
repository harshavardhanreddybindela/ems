import React from "react";
import { Link } from "react-router-dom";

function About() {
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
                                <Link className="nav-link" to="/profile">Profile</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link active" to="/about">About Us</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* About Us Content */}
            <div className="container mt-4">
                <h2>About Us</h2>
                <p>Information about the Event Management System goes here.</p>
                {/* Add more details if needed */}
            </div>
        </div>
    );
}

export default About;
