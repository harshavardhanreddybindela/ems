import React from "react";
import Navbar from "./Navbar";

function Profile() {
    return (
        <div>
            <Navbar />
            {/* Profile Content */}
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-semibold text-gray-800 text-center">Profile</h1>
                <p className="text-center text-red-500 mt-2">Your Profile Settings.</p>
                {/* Add more details if needed */}
            </div>
        </div>
    );
}

export default Profile;
