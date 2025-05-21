import React, { useEffect, useState } from 'react';
import './AdminUser.css';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

function AdminUserList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [suspendedEmails] = useState([]);
    const { user } = useUser();
    const role = user?.role?.toLowerCase();

    useEffect(() => {
        if (!user || !user.token) {
            console.warn("User or token not available yet.");
            return;
        }
        console.log("Sending token:", user?.token);
        const fetchUsers = async () => {
            const token = user.token;

            try {
                const res = await fetch('http://localhost:8080/api/admin/accounts?page=0&size=10', {
                    headers: {
                        //'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error('Failed to fetch users');

                const data = await res.json();
                setUsers(data.content || []);
            } catch (err) {
                console.error("Error loading user list:", err);
            }
        };

        fetchUsers();
    }, [user]);

    if (role === 'user' || role === 'seller') {
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
                    prev.map(u => u.id === id ? { ...u, status: 'BLOCKED' } : u)
                );
                alert('User suspended successfully.');
            } else {
                alert("Failed to suspend user.");
            }
        } catch (err) {
            console.error("Error suspending user:", err);
            alert("An error occurred.");
        }
    };


    const handleDelete = async (email) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const token = user.token;
            const res = await fetch(`http://localhost:8080/api/accounts`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.status === 204) {
                setUsers(prev => prev.filter(u => u.email !== email));
                alert('User deleted.');
            } else {
                alert('Failed to delete user.');
            }
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('An error occurred.');
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
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {users.map(u => {
                    const email = typeof u.email === 'string' ? u.email : u.email?.value || '';
                    return (
                        <tr key={email}>
                            <td>{u.username}</td>
                            <td>{email}</td>
                            <td>{u.role}</td>
                            <td className="action-buttons">
                                {(role === 'admin' || role === 'stuff') && (
                                    <>
                                        <button onClick={() => handleView(u)}>View</button>
                                        {role === 'admin' && (
                                            <>
                                                {suspendedEmails.includes(email) ? (
                                                    <button style={{ backgroundColor: "red", color: "white" }} disabled>
                                                        Suspended
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleSuspend(u.id)}>Suspend</button>
                                                )}
                                                <button onClick={() => handleDelete(email)}>Delete</button>
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
