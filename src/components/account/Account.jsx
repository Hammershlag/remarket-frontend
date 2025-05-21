import React, { useState, useEffect } from 'react';
import './Account.css';
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

function Account() {
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [editedProfile, setEditedProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = user?.token;
            if (!token) return;

            try {
                const res = await fetch(`http://localhost:8080/api/accounts`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error('Failed to fetch account');
                const data = await res.json();
                setProfile(data);
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };

        fetchProfile();
    }, [user]);

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    const handleEdit = () => {
        if (!profile) {
            console.warn("Profile not loaded yet");
            return;
        }

        setEditedProfile({
            username: profile.username,
            email: typeof profile.email === 'string' ? profile.email : profile.email?.value || ''
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!user?.token) {
            console.error("User token is missing. Cannot proceed!");
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/api/accounts`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    username: editedProfile.username,
                    email: editedProfile.email,
                    password: profile.password || "password",
                    role: profile.role || "ADMIN"
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Update failed:", errorData);
            } else {
                setProfile(editedProfile);
                setIsEditing(false);
            }
        } catch (err) {
            console.error('Request error:', err);
        }
    };

    const handleSellerRequest = async () => {
        const token = user?.token;
        console.log("Auth token:", token);
        if (!token) {
            console.error("No token available");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/accounts/become-seller", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                alert("You are now a seller!");
                window.location.reload();
            } else {
                const errorData = await res.json();
                console.error("Failed to become seller:", errorData);
                alert("Failed to become a seller. Reason: " + (errorData?.errorMessage || "Unknown"));
            }
        } catch (err) {
            console.error("Request failed:", err);
            alert("Something went wrong.");
        }
    };

    const displayEmail = profile?.email?.value || profile?.email || user?.email;

    return (
        <div className="Account">
            <h1>Account Information</h1>
            <div className="account-info-with-photo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p><strong>Username:</strong> {profile?.username || user?.username}</p>
                    <p><strong>Email:</strong> {displayEmail}</p>
                    <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {user?.photoFileName && (
                        <img
                            src={`http://localhost:8080/api/photo/user`}
                            alt="Profile"
                            style={{
                                width: "120px",
                                height: "120px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                marginBottom: "1rem"
                            }}
                        />
                    )}
                    {!isEditing && (
                        <button onClick={handleEdit}>Edit</button>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="edit-form">
                    <div className="form-field">
                        <label>Username:</label>
                        <input
                            type="text"
                            value={editedProfile.username}
                            onChange={(e) =>
                                setEditedProfile({ ...editedProfile, username: e.target.value })
                            }
                        />
                    </div>

                    <div className="form-field">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={editedProfile.email}
                            onChange={(e) =>
                                setEditedProfile({ ...editedProfile, email: e.target.value })
                            }
                        />
                    </div>

                    <div className="edit-buttons">
                        <button onClick={handleSave}>Save</button>
                        <button onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="button-row">
                <button onClick={handleLogoutClick}>Sign out</button>
                {user?.role === 'USER' && (
                    <button className="request-seller-button" onClick={handleSellerRequest}>
                        I want to be a seller
                    </button>
                )}
            </div>
        </div>
    );
}

export default Account;
