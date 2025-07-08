import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function Login() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            localStorage.setItem("token", token);
            navigate("/dashboard");
        }
    }, [searchParams, navigate]);

    return null; // or a loading spinner, message, etc.
}

export default Login;
