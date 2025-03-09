import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
function Navbar() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isStaff, setIsStaff] = useState(false);

    useEffect(() => {
        // Check if the user has an access token
        const token = localStorage.getItem("access_token");
        setIsLoggedIn(!!token); // Convert token existence to boolean (true/false)

        if (token) {
            navigate("/home"); // Redirect to home if logged in
        }
        if (token) {
            // Fetch staff status if user is logged in
            axios.get("http://localhost:8000/api/check-staff/", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(response => {
                setIsStaff(response.data.is_staff);
            })
            .catch(error => {
                console.error("Error fetching staff status:", error);
            });
        }
    }, [navigate]);

    return (
        <nav className="bg-blue-600 p-4 shadow-md text-white">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/home" className="text-2xl font-bold">Event Management</Link>
                <ul className="flex space-x-6">
                    <li><Link to="/home" className="hover:text-gray-300">Home</Link></li>
                    {isLoggedIn && <li><Link to="/registrations" className="hover:text-gray-300">My Registrations</Link></li>}
                    {isLoggedIn && <li><Link to="/profile" className="hover:text-gray-300">Profile</Link></li>}
                    <li><Link to="/about" className="hover:text-gray-300">About Us</Link></li>
                    {isStaff && (
                        <li><Link to="/admin" className="hover:text-gray-300 font-bold">Admin Dashboard</Link></li>
                    )}
                    {/* Show Logout button only if user is logged in */}
                    {isLoggedIn ? (
                        <li>
                            <button
                                onClick={() => navigate("/logout")}
                                className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600"
                            >
                                Logout
                            </button>
                        </li>
                    ) : (
                        <li>
                            <Link
                                to="/"
                                className="bg-green-600 px-4 py-2 rounded-md hover:bg-green-600"
                            >
                                Login
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
