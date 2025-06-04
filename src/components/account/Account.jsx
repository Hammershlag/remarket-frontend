import React, {useState, useEffect, useCallback} from 'react';
import './Account.css';
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

function Account() {
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [editedProfile, setEditedProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [photoUrl, setPhotoUrl] = useState(null);

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch(process.env.REACT_APP_BASE_URL + '/api/accounts', {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (!res.ok) {
                console.error("Failed to fetch account, status =", res.status);
                return;
            }

            const data = await res.json();
            setProfile(data);
            console.log("Profile data:", data);
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    }, [user?.token]);

    const fetchPhoto = useCallback(async () => {
        try {
            const res = await fetch( process.env.REACT_APP_BASE_URL + '/api/photo/user', {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (res.status === 400) {
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
    }, [user?.token]);

    useEffect(() => {
        if (!user?.token) {
            return;
        }

        fetchProfile();
        fetchPhoto();
    }, [fetchProfile, fetchPhoto, user?.token]);

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    const handleEdit = () => {
        if (!user) {
            console.warn("Profile not loaded yet");
            return;
        }

        setEditedProfile({
            username: profile.username,
            email: profile.email
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!user?.token) {
            console.error("User token is missing. Cannot proceed!");
            return;
        }
        if(!editedProfile) return;

        try {
            const res = await fetch(process.env.REACT_APP_BASE_URL + '/api/accounts', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    ...(editedProfile.username?.trim() && { username: editedProfile.username }),
                    ...(editedProfile.email?.trim() && { email: editedProfile.email }),
                    ...(editedProfile.password?.trim() && { password: editedProfile.password }),
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Update failed:", errorData);
            } else {
                const data = await res.json();
                setProfile(data);
                setIsEditing(false);
            }
        } catch (err) {
            console.error('Request error:', err);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!user?.token) {
            alert("You are not authenticated. Please log in again.");
            return;
        }

        const formData = new FormData();
        formData.append("photo", file);

        const method = photoUrl ? "PUT" : "POST";

        try {
            const uploadRes = await fetch(process.env.REACT_APP_BASE_URL + '/api/photo/user', {
                method,
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                body: formData,
            });

            console.log(
                `${method} /api/photo/user returned status ${uploadRes.status} ${
                    uploadRes.ok ? "(OK)" : "(Not OK)"
                }`
            );

            if (!uploadRes.ok) {
                const errJson = await uploadRes.json().catch(() => null);
                console.error("Upload failed:", uploadRes.status, errJson);
                if (uploadRes.status === 401) {
                    alert("Upload failed: Unauthorized. Please log in again.");
                } else {
                    alert("Upload failed: " + (errJson?.message || uploadRes.statusText));
                }
                return;
            }

            const payload = await uploadRes.json();
            console.log("Upload succeeded; server returned payload:", payload);

            const newDataUrl = `data:image/jpeg;base64,${payload.data}`;
            setPhotoUrl(newDataUrl);
        } catch (err) {
            console.error("Error when calling", method, "/api/photo/user:", err);
            alert("Upload error. Check console for details.");
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
            const res = await fetch(process.env.REACT_APP_BASE_URL + '/api/accounts/become-seller', {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                alert("You are now a seller!");
                const updatedProfile = { ...profile, role: "seller" };
                setProfile(updatedProfile);
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


    const handleSeller = () => {
        navigate('/seller');
    }

    return (
        <div className="Account">
            <h1>Account Information</h1>
            <div className="account-info">
                <div className="account-info-with-photo">
                    <div className="account-text-info">
                        <p><strong>Username:</strong>{profile?.username}</p>
                        <p><strong>Email:</strong>{profile?.email}</p>
                        <p><strong>Password:</strong> {profile?.password || 'N/A'}</p>
                        <p><strong>Role:</strong> {profile?.role || "N/A"}</p>
                    </div>

                    <div className="account-photo-upload">
                        {photoUrl && (
                            <img
                                className="account-photo"
                                src={photoUrl}
                                alt="Profile"
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
                </div>
                {!isEditing && (
                    <button onClick={handleEdit}>Edit</button>
                )}
            </div>

            {isEditing ? (
                <div className="edit-form">
                    <div className="form-field">
                        <label>Username:</label>
                        <input
                            type="text"
                            value={editedProfile?.username || ""}
                            onChange={(e) =>
                                setEditedProfile({
                                    ...editedProfile,
                                    username: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="form-field">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={editedProfile?.email || ""}
                            onChange={(e) =>
                                setEditedProfile({
                                    ...editedProfile,
                                    email: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className="form-field">
                        <label>New Password:</label>
                        <input
                            type="password"
                            value={editedProfile?.password || ""}
                            onChange={(e) =>
                                setEditedProfile({
                                    ...editedProfile,
                                    password: e.target.value,
                                })
                            }
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="form-field form-field--horizontal">
                        <label className="photo-label">Profile Photo:</label>
                        <label className="upload-button">
                            Upload file
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden-file-input"
                            />
                        </label>
                    </div>

                    <div className="edit-buttons">
                        <button onClick={handleSave}>Save</button>
                        <button onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </div>
            ) : (
                <></>
            )}
            <div className="button-row">
                <button onClick={handleLogoutClick}>Sign out</button>
                {profile?.role === "USER" ? (
                    <button
                        className="request-seller-button"
                        onClick={handleSellerRequest}>
                        I want to be a seller
                    </button>
                ) : (
                    <button onClick={handleSeller}>
                        Seller
                    </button>
                )}
            </div>
        </div>
    );
}

export default Account;

