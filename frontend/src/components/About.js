import React from "react";
import Navbar from "./Navbar";

function About() {
    return (
        <div>
            <Navbar />
            {/* About Us Content */}
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-semibold text-gray-800 text-center">About Us</h1>
                <p className="text-center text-red-500 mt-2">Information about the Event Management System goes here.</p>
                {/* Add more details if needed */}
            </div>
        </div>
    );
}

export default About;
