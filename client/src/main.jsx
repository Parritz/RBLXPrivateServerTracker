import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import App from './pages/app.jsx'
import Login from "./pages/login.jsx";
import Dashboard from "./pages/dashboard.jsx";
import Footer from './components/footer.jsx'
import './css/index.css'

const root = document.getElementById('root');
createRoot(root).render(
    <StrictMode>
        <div className="flex flex-col min-h-screen bg-gray-900">
            <BrowserRouter>
                <div className="flex-grow flex flex-col">
                    <Routes>
                        <Route path="/" element={<App />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                    </Routes>
                </div>
            </BrowserRouter>
            <footer className="mt-auto py-4">
                <Footer />
            </footer>
        </div>
    </StrictMode>
)
