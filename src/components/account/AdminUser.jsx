
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import "./AdminUser.css";

function AdminUserList() {
    const { user } = useUser();
    const token = user?.token;
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (!token) return;

        const fetchUsers = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8080/api/admin/accounts?page=0&size=100`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!res.ok) {
                    console.error("Failed to fetch user list:", res.status);
                    return;
                }
                const data = await res.json();
                console.log("DEBUG: raw data from /api/admin/accounts:", data);
                setUsers(data.content || []);
            } catch (err) {
                console.error("Error loading user list:", err);
            }
        };

        fetchUsers();
    }, [token]);

    const role = user?.role?.toLowerCase();
    if (role === "user" || role === "seller") {
        return <p>You are not authorized to view this page.</p>;
    }

    const handleView = (userObj) => {
        navigate("/admin/users/view", { state: { user: userObj } });
    };

    const handleSuspend = async (userId) => {
        if (!window.confirm("Are you sure you want to suspend this user?")) return;

        try {
            const res = await fetch(
                `http://localhost:8080/api/admin/accounts/${userId}/block`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!res.ok) {
                console.error("Failed to suspend user, status:", res.status);
                alert("Failed to suspend user.");
                return;
            }

            alert("User suspended successfully.");

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, status: "BLOCKED" } : u
                )
            );
        } catch (err) {
            console.error("Error suspending user:", err);
            alert("An unexpected error occurred.");
        }
    };

    return (
        <div className="AdminUserList">
            <h1>All Users</h1>
            <table>
                <thead>
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map((u) => {
                    const email =
                        typeof u.email === "string" ? u.email : u.email?.value || "";

                    return (
                        <tr key={u.id}>
                            <td>{u.username}</td>
                            <td>{email}</td>
                            <td>{u.role}</td>
                            <td>{u.status}</td>
                            <td className="action-buttons">
                                {(role === "admin" || role === "stuff") && (
                                    <>
                                        <button onClick={() => handleView(u)}>View</button>
                                        {role === "admin" && (
                                            <>
                                                <button onClick={() => handleSuspend(u.id)}>
                                                    Suspend
                                                </button>
                                            </>
                                        )}
                                    </>
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}

export default AdminUserList;
