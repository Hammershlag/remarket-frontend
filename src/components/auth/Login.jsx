import React, { useState } from "react";
import './Auth.css'
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";

function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const { setUser } = useUser();
    const navigate = useNavigate();

    const validateIdentifier = (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || value.trim().length > 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!validateIdentifier(identifier)) newErrors.identifier = 'Invalid username/email format';
        if (!password) newErrors.password = 'Password is required';
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                const response = await fetch(`http://localhost:8080/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        usernameOrEmail: identifier,
                        password: password }),
                });

                if (response.ok) {
                    const data = await response.json();

                    // Fetch user data using the access token
                    const userResponse = await fetch(`http://localhost:8080/api/accounts`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${data.accessToken}`,
                        },
                    });

                    if (userResponse.ok) {
                        const userData = await userResponse.json();

                        const newUser = {
                            token: data.accessToken,
                            username: userData.username,
                            email: userData.email,
                            role: userData.role,
                            password: "********",
                        };

                        setUser(newUser);
                        console.log('Login successful:', newUser);
                        navigate('/');
                    } else {
                        const userErrorData = await userResponse.json();
                        setErrors({ server: userErrorData.message });
                        console.error('Failed to fetch user data:', userErrorData);
                    }
                } else {
                    const errorData = await response.json();
                    setErrors({ server: errorData.message });
                    console.error('Login failed:', errorData);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    return (
        <div className="AuthPage">
            <div className="SideImage left"></div>
            <form className="AuthForm" onSubmit={handleSubmit}>
                <h1>Sign in to your account</h1>
                <div>
                    <label>Email/Username:</label>
                    <input className="LoginInput"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="E.g. Johny123 or johny@mail.com"
                    />
                </div>
                {errors.identifier && <p className="error">{errors.identifier}</p>}
                <div>
                    <label>Password:</label>
                    <input className="LoginInput"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {errors.password && <p className="error">{errors.password}</p>}
                {errors.server && <p className="error">{errors.server}</p>}
                <button type="submit">Login</button>
                <br />
                Don't have an account yet? <a href="/register">Register</a>
            </form>
            <div className="SideImage right"></div>
        </div>
    );
}

export default Login;

