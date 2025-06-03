import React, { useEffect, useState } from 'react';
import './AdminUser.css';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

function AdminUserList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const { user } = useUser();
    const token = user.token;
    const role = user?.role;

    useEffect(() => {
        if (!user || !token) {
            console.warn("User or token not available yet.");
            return;
        }

        const fetchUsers = async () => {

            try {
                const res = await fetch('http://localhost:8080/api/admin/accounts?page=0&size=1000', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    console.error('Failed to fetch users: ', res.status);
                    return;
                }

                const data = await res.json();
                setUsers(data.content || []);
            } catch (err) {
                console.error("Error loading user list:", err);
            }
        };

        fetchUsers();
    }, [token, user]);

    if (role === 'USER' || role === 'SELLER') {
        return <p>You are not authorized to view this page.</p>;
    }

    const handleView = (userObj) => {
        navigate('/admin/users/view', { state: { user: userObj } });
    };

    const handleSuspend = async (id) => {
        if (!window.confirm("Are you sure you want to suspend this user?")) return;

        try {
            const token = user.token;
            const res = await fetch(`http://localhost:8080/api/admin/accounts/${id}/block`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                setUsers(prev =>
                    prev.map(u =>
                        u.id === id
                            ? { ...u, status: u.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED' }
                            : u
                    )
                );
                alert(`User ${users.find(u => u.id === id).status === 'DISABLED' ? 'unsuspended' : 'suspended'} successfully.`);
            } else {
                alert("Failed to update user status.");
            }
        } catch (err) {
            console.error("Error suspending user:", err);
            alert("An error occurred.");
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
                {users.map(u => {
                    return (
                        <tr key={u.email}>
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>{u.status}</td>
                            <td className="action-buttons">
                                {(role === 'ADMIN' || role === 'STUFF') && (
                                    <>
                                        <button onClick={() => handleView(u)}>View</button>
                                        {role === 'ADMIN' && (
                                            <>
                                                {u.status === 'DISABLED' ? (
                                                    <button style={{ backgroundColor: "#a71e2a", color: "white" }} onClick={() => handleSuspend(u.id)}>
                                                        Unsuspend
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleSuspend(u.id)}>Suspend</button>
                                                )}
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
