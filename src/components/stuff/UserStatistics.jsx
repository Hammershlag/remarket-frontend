import React, { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { Navigate } from "react-router-dom";
import "./UserStatistics.css";

export default function UserStatistics() {
    const { user } = useUser();
    const token = user?.token;
    const role = user?.role?.toUpperCase();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (role !== "STUFF" || !token) return;

        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await fetch(process.env.REACT_APP_BASE_URL + '/api/stuff/statistics/users', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    setError(`Error ${res.status}: Unable to load statistics`);
                    return;
                }
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error("Error fetching user statistics:", err);
                setError("An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [role, token]);



    if (role !== "STUFF") return <Navigate to="/not-authorized" replace />;
    if (loading) return <div className="us-loading">Loading statistics…</div>;
    if (error) return <div className="us-error">{error}</div>;
    if (!stats) return <div className="us-empty">No statistics to display.</div>;

    const { activeUsers, blockedUsers, deletedUsers, newUsers, loggedInLast24h } = stats;

    return (
        <div className="UserStatistics">
            <h1>User Statistics</h1>
            <ul className="us-list">
                <li>
                    <span className="us-label">Active Users:</span>{" "}
                    <span className="us-value">{activeUsers}</span>
                </li>
                <li>
                    <span className="us-label">Blocked Users:</span>{" "}
                    <span className="us-value">{blockedUsers}</span>
                </li>
                <li>
                    <span className="us-label">Deleted Users:</span>{" "}
                    <span className="us-value">{deletedUsers}</span>
                </li>
                <li>
                    <span className="us-label">New Users (last 24h):</span>{" "}
                    <span className="us-value">{newUsers}</span>
                </li>
                <li>
                    <span className="us-label">Logged In (last 24h):</span>{" "}
                    <span className="us-value">{loggedInLast24h}</span>
                </li>
            </ul>
        </div>
    );
}