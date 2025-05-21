import React from 'react';
import { useLocation } from 'react-router-dom';
import './UserDetails.css';

function UserDetails() {
    const location = useLocation();
    const account = location.state?.user;

    if (!account) return <p>User data not available.</p>;

    return (
        <div className="UserDetails">
            <h2>User Details</h2>
            <p><strong>Username:</strong> {account.username}</p>
            <p><strong>Email:</strong> {account.email?.value || account.email || "N/A"}</p>
            <p><strong>Role:</strong> {account.role}</p>
        </div>
    );
}

export default UserDetails;
