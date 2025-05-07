import React, { useState } from "react";
import './Register.css';
import {useNavigate} from "react-router-dom";



function Register() {
    const [email, setEmail] = useState("");    
    const [username, setUsername] = useState("");    
    const [password, setPassword] = useState("");    
    const [confirmPassword, setConfirmPassword] = useState("");    
    const [errors, setErrors] = useState([]);        
    const navigate = useNavigate();        
    
    const validateEmail = (email) => {        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;        
        return emailRegex.test(email);    
    };       
    const validatePassword = (password) => {       
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;        
        return passwordRegex.test(password);
    };    
    
    const handleSubmit = async (e) => {       
        e.preventDefault();        
        const newErrors = {};        
        
        if (!username) newErrors.username = 'Username is required';       
        if (!validateEmail(email)) newErrors.email = 'Invalid email address';        
        if (!validatePassword(password)) newErrors.password = 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number';        
        if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'; 
        
        setErrors(newErrors);
        
        try {            
            const response = await fetch(`http://localhost:8080/api/auth/register`, {
                method: 'POST',                
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({                    
                    username: username,
                    password: password,
                    email: email,
                    role: "user"
                }),           
            });            
            if (response.status === 200) {
                navigate('/login');
            } else {
                const errorData = await response.json();                
                setErrors({ server: errorData.message });                
                console.error('Registration failed:', errorData);            
            }
        } catch (error) {            
            console.error('Error:', error);        
        }    
    };    
    
    return (        
        <form className="Register" onSubmit={handleSubmit}>            
            <h1>Fill out the form to create an account:</h1>           
            <div>                
                <label>Username:</label>                
                <input                    
                    type="text"                    
                    value={username}                    
                    onChange={(e) => setUsername(e.target.value)}                
                />                
                {errors.username && <p className="error">{errors.username}</p>}            
            </div>           
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
            <div>                
                <label>Confirm Password:</label>                
                <input                  
                    type="password"                
                    value={confirmPassword}               
                    onChange={(e) => setConfirmPassword(e.target.value)}     
                />           
                {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}   
            </div>          
            {errors.server && <p className="error">{errors.server}</p>}     
            <button type="submit">Register</button>        
            <br/>     
            Already have an account? <a href="/login">Sign in</a>      
        </form>  
    );
}
export default Register;
