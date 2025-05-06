import React, { useEffect, useState } from 'react';
import './AdminUser.css';
import { useUser } from '../../contexts/UserContext';

const mockUsers = [
    { id: 1, username: 'john_doe', email: 'john@example.com', role: 'buyer' },
    { id: 2, username: 'jane_admin', email: 'jane@example.com', role: 'admin' },
    { id: 3, username: 'mark_seller', email: 'mark@example.com', role: 'seller' },
];

function AdminUserList() {
    const [users, setUsers] = useState([]);
    const { user } = useUser();

    useEffect(() => {
        // TODO: Replace with real API call
        setUsers(mockUsers);
    }, []);

    // Allow both "admin" and "stuff"
    if (!user || (user.role !== 'admin' && user.role !== 'stuff')) {
        return <p>You are not authorized to view this page.</p>;
    }

    const handleView = (id) => {
        alert(`Viewing user ${id}`);
    };

    const handleSuspend = (id) => {
        alert(`User ${id} suspended`);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            alert(`User ${id} deleted`);
        }
    };

    const handleFlag = (id) => {
        alert(`User ${id} flagged for admin review.`);
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
                {users.map(u => (
                    <tr key={u.id}>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td className="action-buttons">
                            {user.role === 'admin' ? (
                                <>
                                    <button onClick={() => handleView(u.id)}>View</button>
                                    <button onClick={() => handleSuspend(u.id)}>Suspend</button>
                                    <button onClick={() => handleDelete(u.id)}>Delete</button>
                                </>
                            ) : (
                                user.role === 'stuff' && (
                                    <button onClick={() => handleFlag(u.id)}>Flag</button>
                                )
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminUserList;
