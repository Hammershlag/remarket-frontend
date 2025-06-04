import React, {useEffect, useState} from 'react';
import { useLocation } from 'react-router-dom';
import './UserDetails.css';
import {useUser} from "../../contexts/UserContext";

function UserDetails() {
    const location = useLocation();
    const account = location.state?.user;

    const { user: currentUser } = useUser();
    const token = currentUser?.token;

    const [photoUrl, setPhotoUrl] = useState(null);

    useEffect(() => {
        const fetchPhoto = async () => {
            try {
                const res = await fetch(
                    process.env.REACT_APP_BASE_URL + '/api/photo/user',
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (res.status === 400 || res.status === 404) {
                    return;
                }
                if (!res.ok) {
                    console.error("Failed to fetch photo, status =", res.status);
                    return;
                }

                const payload = await res.json();
                const dataUrl = `data:image/jpeg;base64,${payload.data}`;
                setPhotoUrl(dataUrl);
            } catch (err) {
                console.error("Error loading photo:", err);
            }
        };

        fetchPhoto();
    }, [token, account]);

    if (!account) return <p>User data not available.</p>;

    return (
        <div className="UserDetails">
            <h2>User Details</h2>
            <div className="account-photo-upload">
                {photoUrl && (
                    <img
                        className="account-photo"
                        src={photoUrl}
                        alt={`${account.username}’s profile`}
                        style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            marginBottom: "1rem",
                        }}
                    />
                )}
            </div>
            <p><strong>Username:</strong> {account.username}</p>
            <p><strong>Email:</strong> {account.email || "N/A"}</p>
            <p><strong>Role:</strong> {account.role}</p>
            {account.status && (
                <p><strong>Status:</strong> {account.status}</p>
            )}
        </div>
    );
}

export default UserDetails;
