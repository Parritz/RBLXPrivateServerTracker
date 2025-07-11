import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function App() {
    const navigate = useNavigate();

    // Check if the user is authenticated with a token and redirect accordingly
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    }, [useNavigate]);

    return (
        <div className="flex flex-1 bg-gray-900 text-white items-center justify-center">
            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col items-center">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Roblox Private Server Tracker</h1>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded flex items-center gap-2 transition-colors duration-200">
                    <a href={`${import.meta.env.VITE_SERVER_URL}/oauth`}>Login with Discord</a>
                </button>
            </div>
        </div>
    )
}

export default App
