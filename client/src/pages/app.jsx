import {useState} from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'
import '../css/App.css'

function App() {
    console.log(import.meta.env.VITE_SERVER_URL);
    return (
        <>
            <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
                <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-white mb-6 text-center">Roblox Private Server Tracker</h1>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded flex items-center gap-2 transition-colors duration-200">
                        <a href={`${import.meta.env.VITE_SERVER_URL}/oauth`}>Login with Discord</a>
                    </button>
                </div>
            </div>
        </>
    )
}

export default App
