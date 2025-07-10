import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import Warning from "../components/warning.jsx";
import InputModal from "../components/InputModal.jsx";
import placeholder_avatar from '../assets/placeholder_avatar.png';

function Dashboard() {
    const serverURL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';
    const navigate = useNavigate();
    const [userData, setUserData] = useState({});
    const [activeTab, setActiveTab] = useState('games');
    const [games, setGames] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [showAddGameModal, setShowAddGameModal] = useState(false);
    const [showTrackerBotWarning, setShowTrackerBotWarning] = useState(false);
    const token = localStorage.getItem("token");

    // Retrieves games and Roblox accounts for this user from the server.
    async function getAccountInfo() {
        const response = await fetch(`${serverURL}/api/account`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'authentication': token
            }
        });

        switch (response.status) {
            case 200: {
                const data = await response.json();
                setAccounts(data.accounts || {});
                setGames(data.games || {});
                setShowTrackerBotWarning(data.accountsNotTracked.length !== 0);
                break;
            }
            case 401: {
                // This shouldn't happen
                localStorage.removeItem("token");
                navigate('/')
                break;
            }
        }
    }

    useEffect(() => {
        // Check if the user is authenticated by verifying the token in cookies.
        async function verifyToken() {
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
                    localStorage.removeItem("token");
                    navigate('/');
                    return;
                }

                const data = await response.json();
                setUserData(data.user);
            } catch (err) {
                console.error("Verification failed:", err);
                navigate('/');
            }
        }

        verifyToken();
        getAccountInfo();
    }, [navigate]);

    // Function to add a game to the tracked games list
    async function addGame(id) {
        if (!id) return;
        const response = await fetch(`${serverURL}/api/game`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authentication': localStorage.getItem('token')
            },
            body: JSON.stringify({ id })
        });

        if (response.status === 200) {
            await getAccountInfo() // Update the games list after adding a new game
        }

        setShowAddGameModal(false);
    }

    async function addAccount(id) {
        if (!id) return;

        const response = await fetch(`${serverURL}/api/account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authentication': localStorage.getItem('token')
            },
            body: JSON.stringify({ name: id })
        });

        switch (response.status) {
            case 200:
                await getAccountInfo(); // Update the accounts list after adding a new account
                break;
            default:
                break;
        }
        if (response.status === 200) {
        }
        setShowAddAccountModal(false);
    }

    async function deleteAccount(accountName) {
        const response = await fetch(`${serverURL}/api/account`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'authentication': localStorage.getItem('token')
            },
            body: JSON.stringify({ name: accountName })
        });

        if (response.status === 200) {
            await getAccountInfo(); // Refresh accounts list
        }
    }

    async function deleteGame(gameId) {
        const response = await fetch(`${serverURL}/api/game`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'authentication': localStorage.getItem('token')
            },
            body: JSON.stringify({ id: gameId })
        });

        if (response.status === 200) {
            await getAccountInfo(); // Refresh games list
        }
    }

    return (
        <div className="flex flex-col flex-grow bg-gray-900 text-white items-center justify-center">
            { showTrackerBotWarning && <Warning message="⚠️ One or more of your accounts have not added the tracker bot. These accounts will not be tracked." /> }
            { showAddAccountModal && <InputModal title="Add Account" placeholder="Enter an account username" onSubmit={addAccount} /> }
            { showAddGameModal && <InputModal title="Add Game" placeholder="Enter a game ID" onSubmit={addGame}/> }

            <div className="flex flex-row">
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
                            className={`flex-1 py-2 text-lg font-semibold transition-colors duration-200 ${activeTab === 'accounts' ? 'border-b-4 border-indigo-500 text-indigo-400' : 'text-gray-400 hover:text-indigo-300'}`}
                            onClick={() => setActiveTab('accounts')}
                        >
                            Roblox Accounts
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
                                        onClick={() => setShowAddGameModal(true)}
                                    >
                                        + Add Game
                                    </button>
                                </div>

                                <ul className="flex-1 overflow-y-auto space-y-2">
                                    {Object.keys(games).length === 0 ? (
                                        <li className="text-gray-400">No games tracked yet.</li>
                                    ) : (
                                        Object.keys(games).map((game, index) => {
                                            const gameData = games[game];
                                            return (
                                                <li key={index} className="flex items-center bg-gray-700 rounded px-4 py-2 break-all">
                                                    <span>{gameData.name}</span>
                                                    <button
                                                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-200 ml-auto"
                                                        onClick={() => deleteGame(gameData.id)}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </li>
                                            );
                                        })
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Accounts Tab */}
                        {activeTab === 'accounts' && (
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">Roblox Accounts</h2>
                                    <button
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded transition-colors duration-200"
                                        onClick={() => setShowAddAccountModal(true)}
                                    >
                                        + Add Account
                                    </button>
                                </div>

                                <ul className="flex-1 overflow-y-auto space-y-2">
                                    {Object.keys(accounts).length === 0 ? (
                                        <li className="text-gray-400">No accounts added yet.</li>
                                    ) : (
                                        Object.keys(accounts).map((account, index) => {
                                            const accountData = accounts[account];
                                            return (
                                                <li key={index} className="flex items-center bg-gray-700 rounded px-4 py-2 break-all">
                                                    <p className="inline">
                                                        {accountData.name}
                                                    </p>
                                                    <button
                                                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-200 ml-auto"
                                                        onClick={() => deleteAccount(accountData.name)}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </li>
                                            );
                                        })
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Tracker Bot */}
                <div className="w-[425px] h-[600px] bg-gray-800 rounded-lg shadow-2xl p-10 ml-6 flex flex-col items-center justify-start">
                    <h1 className="text-2xl font-bold text-white mb-2 text-center">
                        Add Tracker Account
                    </h1>

                    <img src={placeholder_avatar} alt={"Tracker account avatar"} className={"m-10 scale-150"}/>

                    <p className="text-center text-md text-gray-300">
                        You will need to add the tracker account and grant it access to your private servers in order to track them.
                    </p>

                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 rounded transition-colors duration-200 mt-4">
                        <a href="https://www.roblox.com/users/8874191615/profile" target="_blank">View Profile</a>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard
