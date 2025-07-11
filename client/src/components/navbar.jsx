import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const serverURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        navigate('/');
    };

    const handleLogin = () => {
        window.location.href = `${serverURL}/oauth`;
    };

    return (
        <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex justify-between items-center">
                {/* Site Title */}
                <div className="text-xl font-bold text-white">
                    Roblox Private Server Tracker
                </div>

                {/* Authentication Button */}
                <div>
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                        >
                            Logout
                        </button>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                        >
                            Login with Discord
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;