import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

function Dashboard() {
    const serverURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    const navigate = useNavigate();
    const [userData, setUserData] = useState({});
    const [activeTab, setActiveTab] = useState('games');
    const [games, setGames] = useState([]);
    const [cookies, setCookies] = useState([]);

    // Check if the user is authenticated by verifying the token in cookies
    useEffect(() => {
        async function verifyToken() {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate('/');
                return;
            }

            try {
                // Make a request to the server to verify the token
                const response = await fetch(`${serverURL}/api/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                // If the response is not 200, redirect to home since the token is invalid
                if (response.status !== 200) {
                    navigate('/');
                    return;
                }

                const data = await response.json();
                console.log(data);
                setUserData(data.user);
            } catch (err) {
                console.error("Verification failed:", err);
                navigate('/');
            }
        }

        verifyToken();
    }, [navigate, setUserData]);

    // Function to add a game to the tracked games list
    async function addGame() {
        const id = prompt('Enter game id:');
        if (!id) return;

        await fetch(`${serverURL}/api/game`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
            credentials: 'include'
        });

        // if (name) setGames([...games, { name }]);
    }

    function addCookie() {
        const value = prompt('Enter Roblox cookie:');
        // if (value) setCookies([...cookies, { value }]);
    }

    return (
        <div className="flex flex-col flex-grow bg-gray-900 text-white items-center justify-center">
            <div className="w-full max-w-3xl h-[600px] bg-gray-800 rounded-lg shadow-2xl p-10 flex flex-col items-center justify-start">
                <h1 className="text-3xl font-bold text-white mb-2 text-center">Roblox Private Server Tracker</h1>
                <p className="text-white mb-6">Welcome, {userData.global_name || 'User'}!</p>

                {/* Tabs */}
                <div className="w-full flex mb-6 border-b border-gray-700">
                    <button
                        className={`flex-1 py-2 text-lg font-semibold transition-colors duration-200 ${activeTab === 'games' ? 'border-b-4 border-indigo-500 text-indigo-400' : 'text-gray-400 hover:text-indigo-300'}`}
                        onClick={() => setActiveTab('games')}
                    >
                        Games
                    </button>

                    <button
                        className={`flex-1 py-2 text-lg font-semibold transition-colors duration-200 ${activeTab === 'cookies' ? 'border-b-4 border-indigo-500 text-indigo-400' : 'text-gray-400 hover:text-indigo-300'}`}
                        onClick={() => setActiveTab('cookies')}
                    >
                        Roblox Cookies
                    </button>

                </div>

                {/* Games Tab */}
                <div className="w-full flex-1 overflow-y-auto">
                    {activeTab === 'games' && (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Tracked Games</h2>
                                <button
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded transition-colors duration-200"
                                    onClick={addGame}
                                >
                                    + Add Game
                                </button>
                            </div>

                            <ul className="flex-1 overflow-y-auto space-y-2">
                                {games.length === 0 ? (
                                    <li className="text-gray-400">No games tracked yet.</li>
                                ) : (
                                    games.map((game, index) => (
                                        <li key={index} className="bg-gray-700 rounded px-4 py-2">{game.name}</li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}

                    {/* Cookies Tab */}
                    {activeTab === 'cookies' && (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Roblox Cookies</h2>
                                <button
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded transition-colors duration-200"
                                    onClick={addCookie}
                                >
                                    + Add Cookie
                                </button>
                            </div>

                            <ul className="flex-1 overflow-y-auto space-y-2">
                                {cookies.length === 0 ? (
                                    <li className="text-gray-400">No cookies added yet.</li>
                                ) : (
                                    cookies.map((cookie, index) => (
                                        <li key={index} className="bg-gray-700 rounded px-4 py-2 break-all">{cookie.value}</li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                {activeTab === "cookies" && (
                    <p className="text-gray-400 text-center">Roblox cookies entered are encrypted and securely stored. Do not share them with untrusted parties.</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard
