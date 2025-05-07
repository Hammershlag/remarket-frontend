import React from 'react';
import './Account.css';
import { useNavigate} from "react-router-dom";
import { useUser } from "../../contexts/UserContext";


function Account() {
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    const handleSellerRequest = () => {
        alert("The request was sent to admin");
    };

    return (
        <div className="Account">

            <h1>Account Information</h1>
            <div className="account-info">
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.username}</p>
                <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
            </div>

            <div className="button-row">
                <button onClick={handleLogoutClick}>Sign out</button>

                {user?.role === 'user' && (
                    <button className="request-seller-button" onClick={handleSellerRequest}>
                        I want to be a seller
                    </button>
                )}
            </div>
        </div>
    );
}

export default Account;
