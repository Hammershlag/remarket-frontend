import React, { useState } from "react";
import './Login.css';
import { useUser } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.API_URL;

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const { setUser } = useUser();
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!validateEmail(email)) newErrors.email = 'Invalid email address';
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
                        usernameOrEmail: email,
                        password: password }),
                });

                if (response.ok) {
                    const data = await response.json();

                    const base64Url = data.accessToken.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const decodedPayload = JSON.parse(atob(base64));

                    console.log('Decoded JWT payload:', decodedPayload);

                    const newUser = {
                        token: data.accessToken,
                        role: data.userRole?.toLowerCase(),
                        username: decodedPayload.sub,
                        email: decodedPayload.email || decodedPayload.sub
                    };

                    setUser(newUser);
                    console.log('Login successful:', newUser);

                    navigate('/account');
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
        <form className="Login" onSubmit={handleSubmit}>
            <h1>Sign in to your account:</h1>
            <div>
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="error">{errors.email}</p>}
            </div>
            <div>
                <label>Password:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <p className="error">{errors.password}</p>}
            </div>
            {errors.server && <p className="error">{errors.server}</p>}
            <button type="submit">Login</button>
            <br />
            Don't have an account yet? <a href="/register">Register</a>
        </form>
    );
}

export default Login;

