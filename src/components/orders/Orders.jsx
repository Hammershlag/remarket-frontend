import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {useUser} from "../../contexts/UserContext";

function ProductsOrders() {
    const [sellerOrders, setSellerOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useUser();
    const navigate = useNavigate();

    const fetchSellerOrders = useCallback(async () => {
        if (!user || !user.token) {
            setError("User not authenticated");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/seller/orders', {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch seller orders: ${response.status}`);
            }

            const data = await response.json();
            setSellerOrders(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching seller orders:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchSellerOrders();
    }, [fetchSellerOrders]);

    const getStatusColor = (status) => {
        const statusColors = {
            'PENDING': 'orange',
            'PROCESSING': 'blue',
            'SHIPPING': 'purple',
            'DELIVERED': 'green',
            'CANCELLED': 'red'
        };
        return statusColors[status] || 'gray';
    };

    const getPaymentStatusColor = (status) => {
        const statusColors = {
            'PENDING': 'orange',
            'COMPLETED': 'green',
            'FAILED': 'red',
            'REFUNDED': 'blue'
        };
        return statusColors[status] || 'gray';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not shipped yet';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return <div>Loading your product orders...</div>;
    }

    if (error) {
        return (
            <div style={{ color: 'red' }}>
                Error: {error}
                <button onClick={fetchSellerOrders} style={{ marginLeft: '10px' }}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="my-products-orders">
            <h2>My Products' Orders</h2>
            {sellerOrders.length === 0 ? (
                <p>No orders found for your products.</p>
            ) : (
                <div className="orders-list">
                    {sellerOrders.map((order) => (
                        <div key={order.id} className="order-card" style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            margin: '16px 0',
                            padding: '20px',
                            backgroundColor: '#f9f9f9'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px'
                            }}>
                                <h3>Order #{order.id}</h3>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: getStatusColor(order.orderStatus),
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {order.orderStatus}
                                </span>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '20px',
                                marginBottom: '16px'
                            }}>
                                <div>
                                    <h4>Shipping Address</h4>
                                    <p>
                                        {order.address.street}<br />
                                        {order.address.city}, {order.address.state}<br />
                                        {order.address.zipCode}<br />
                                        {order.address.country}
                                    </p>
                                    <p><strong>Shipping Method:</strong> {order.shippingMethod}</p>
                                    <p><strong>Shipped:</strong> {formatDate(order.shippedDate)}</p>
                                </div>

                                <div>
                                    <h4>Payment</h4>
                                    <p><strong>Total:</strong> {order.payment.total} {order.payment.currency}</p>
                                    <p><strong>Method:</strong> {order.payment.paymentMethod.replace('_', ' ')}</p>
                                    <p>
                                        <strong>Status:</strong>
                                        <span style={{
                                            marginLeft: '8px',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            backgroundColor: getPaymentStatusColor(order.payment.paymentStatus),
                                            color: 'white',
                                            fontSize: '11px'
                                        }}>
                                            {order.payment.paymentStatus}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p><strong>Items:</strong> {order.listingOrders.length} item{order.listingOrders.length !== 1 ? 's' : ''}</p>
                                <button
                                    onClick={() => navigate('/order-details', { state: { order } })}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        marginTop: '8px'
                                    }}
                                >
                                    View Order Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("myOrders");
    const { user } = useUser();
    const navigate = useNavigate();

    const fetchOrders = useCallback(async () => {
        if (!user || !user.token) {
            setError("User not authenticated");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/orders', {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.status}`);
            }

            const ordersData = await response.json();
            setOrders(ordersData);
            setError(null);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const getStatusColor = (status) => {
        const statusColors = {
            'PENDING': 'orange',
            'PROCESSING': 'blue',
            'SHIPPING': 'purple',
            'DELIVERED': 'green',
            'CANCELLED': 'red'
        };
        return statusColors[status] || 'gray';
    };

    const getPaymentStatusColor = (status) => {
        const statusColors = {
            'PENDING': 'orange',
            'COMPLETED': 'green',
            'FAILED': 'red',
            'REFUNDED': 'blue'
        };
        return statusColors[status] || 'gray';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not shipped yet';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="orders">
                <h1>My Orders</h1>
                <div className="loading">Loading your orders...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders">
                <h1>My Orders</h1>
                <div className="error" style={{ color: 'red', padding: '20px' }}>
                    Error: {error}
                    <button onClick={fetchOrders} style={{ marginLeft: '10px' }}>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-layout">
            {user?.role !== "USER" && (
                <div className="orders-sidebar">
                    <button
                        className={`sidebar-tab ${activeTab === "myOrders" ? "active" : ""}`}
                        onClick={() => setActiveTab("myOrders")}
                    >
                        My Orders
                    </button>
                    <button
                        className={`sidebar-tab ${activeTab === "myProductsOrders" ? "active" : ""}`}
                        onClick={() => setActiveTab("myProductsOrders")}
                    >
                        My Products' Orders
                    </button>
                </div>
            )}
            <div className="orders-content">
                {activeTab === "myOrders" && (
                    <div className="orders">
                        <h1>My Orders</h1>
                        {orders.length === 0 ? (
                            <p>You haven't placed any orders yet.</p>
                        ) : (
                            <div className="orders-list">
                                {orders.map((order) => (
                                    <div key={order.id} className="order-card" style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        margin: '16px 0',
                                        padding: '20px',
                                        backgroundColor: '#f9f9f9'
                                    }}>
                                        <div className="order-header" style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '16px'
                                        }}>
                                            <h3>Order #{order.id}</h3>
                                            <div className="order-status">
                                          <span style={{
                                              padding: '4px 8px',
                                              borderRadius: '4px',
                                              backgroundColor: getStatusColor(order.orderStatus),
                                              color: 'white',
                                              fontSize: '12px',
                                              fontWeight: 'bold'
                                          }}>
                                            {order.orderStatus}
                                          </span>
                                                        </div>
                                                    </div>

                                        <div className="order-details" style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '20px',
                                            marginBottom: '16px',
                                            minHeight: '0'
                                        }}>
                                            <div className="shipping-info">
                                                <h4>Shipping Address</h4>
                                                <p>
                                                    {order.address.street}<br/>
                                                    {order.address.city}, {order.address.state}<br/>
                                                    {order.address.zipCode}<br/>
                                                    {order.address.country}
                                                </p>
                                                <p><strong>Shipping Method:</strong> {order.shippingMethod}</p>
                                                <p><strong>Shipped:</strong> {formatDate(order.shippedDate)}</p>
                                            </div>

                                            <div className="payment-info">
                                                <h4>Payment Details</h4>
                                                <p><strong>Total:</strong> {order.payment.total} {order.payment.currency}</p>
                                                <p><strong>Method:</strong> {order.payment.paymentMethod.replace('_', ' ')}</p>
                                                <p>
                                                    <strong>Status:</strong>
                                                    <span style={{
                                                        marginLeft: '8px',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        backgroundColor: getPaymentStatusColor(order.payment.paymentStatus),
                                                        color: 'white',
                                                        fontSize: '11px'
                                                    }}>
                                  {order.payment.paymentStatus}
                                </span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="order-items">
                                            <p><strong>Items:</strong> {order.listingOrders.length} item{order.listingOrders.length !== 1 ? 's' : ''}</p>
                                            <button
                                                onClick={() => navigate('/order-details', { state: { order } })}
                                                style={{
                                                    padding: '8px 16px',
                                                    backgroundColor: '#007bff',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    marginTop: '8px'
                                                }}
                                            >
                                                View Order Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === "myProductsOrders" && <ProductsOrders />}
            </div>
        </div>
    );
}

export default Orders;