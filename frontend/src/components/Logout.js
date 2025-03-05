import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        // 1️⃣ Immediately clear tokens to log out locally
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        // 2️⃣ Redirect to login immediately
        navigate("/");

        // 3️⃣ Attempt to logout from the backend (non-blocking)
        const logoutUser = async () => {
            try {
                await axios.post("http://localhost:8000/api/logout/", {}, { withCredentials: true });
                console.log("User logged out from server.");
            } catch (error) {
                console.error("Logout API call failed:", error);
            }
        };

        logoutUser();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800">Logging out...</h2>
        </div>
    );
}

export default Logout;
