import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {useUser} from "../../contexts/UserContext";
import './OrderDetails.css';

function OrderDetails() {
    const [order, setOrder] = useState(null);
    const [listingOrders, setListingOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        if (location.state && location.state.order) {
            setOrder(location.state.order);
        } else {
            setError("No order data found. Please navigate from the orders page.");
            setLoading(false);
            return;
        }
    }, [location.state]);

    const fetchListingsForOrder = useCallback(async () => {
        if (!user || !user.token || !order) {
            if (!user || !user.token) {
                setError("User not authenticated");
            }
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const listingOrdersWithPhotos = await Promise.all(
                order.listingOrders.map(async (listingOrder) => {
                    const listingId = listingOrder.listing.id;
                    try {
                        const listingResponse = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${listingId}`, {
                            method: "GET",
                            headers: {
                                'Authorization': `Bearer ${user.token}`,
                                'Content-Type': 'application/json',
                            },
                        });

                        if (!listingResponse.ok) {
                            throw new Error(`Failed to fetch listing ${listingId}`);
                        }

                        const listing = await listingResponse.json();

                        let imageUrl = 'https://placehold.co/400';
                        if (listing.photos && listing.photos.length > 0) {
                            const photoId = listing.photos[0].id;
                            try {
                                const photoResponse = await fetch(process.env.REACT_APP_BASE_URL + `/api/photo/listing/${photoId}`, {
                                    headers: {
                                        'Authorization': `Bearer ${user.token}`,
                                    },
                                });
                                if (photoResponse.ok) {
                                    const photoBase64 = await photoResponse.json();
                                    imageUrl = `data:image/jpeg;base64,${photoBase64.data}`;
                                }
                            } catch (photoError) {
                                console.error(`Failed to fetch photo for listing ${listingId}:`, photoError);
                            }
                        }

                        // Return the listingOrder with updated listing that includes imageUrl
                        return {
                            ...listingOrder,
                            listing: { ...listing, imageUrl }
                        };
                    } catch (listingError) {
                        console.error(`Error fetching listing ${listingId}:`, listingError);
                        return null;
                    }
                })
            );

            // Filter out failed listings
            const validListingOrders = listingOrdersWithPhotos.filter(listingOrder => listingOrder !== null);
            setListingOrders(validListingOrders);
            setError(null);

        } catch (err) {
            console.error("Error fetching listings:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [order, user]);

    useEffect(() => {
        if (order) {
            fetchListingsForOrder();
        }
    }, [fetchListingsForOrder]);

    const getStatusColor = (status) => {
        const statusColors = {
            'PENDING': 'status-pending',
            'PROCESSING': 'status-processing',
            'SHIPPING': 'status-shipping',
            'DELIVERED': 'status-delivered',
            'CANCELLED': 'status-cancelled'
        };
        return statusColors[status] || 'status-pending';
    };

    const getPaymentStatusColor = (status) => {
        const statusColors = {
            'PENDING': 'payment-pending',
            'COMPLETED': 'payment-completed',
            'FAILED': 'payment-failed',
            'REFUNDED': 'payment-refunded'
        };
        return statusColors[status] || 'payment-pending';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not shipped yet';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleShipOrder = ( async (id) => {
        if (!user || !user.token) {
            setError("User not authenticated");
            return;
        }

        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/seller/orders/${id}/status`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch seller orders: ${response.status}`);
            }

            setListingOrders((prevOrders) => prevOrders.map(order => order.id === id ? {...order, listingStatus: 'SHIPPED'} : order));
            setError(null);
            alert("Order has been shipped successfully!");
        } catch (err) {
            console.error("Error fetching seller orders:", err);
            setError(err.message);
        }
    });

    if (loading) {
        return (
            <div className="order-details">
                <div className="order-header">
                    <div className="header-top">
                        <button onClick={() => navigate('/orders')} className="back-btn">
                            ← Back to Orders
                        </button>
                    </div>
                </div>
                <div className="loading">Loading order details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-details">
                <div className="order-header">
                    <div className="header-top">
                        <button onClick={() => navigate('/orders')} className="back-btn">
                            ← Back to Orders
                        </button>
                    </div>
                </div>
                <div className="error">
                    Error: {error}
                    {order && (
                        <button onClick={fetchListingsForOrder}>
                            Retry
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="order-details">
                <div className="order-header">
                    <div className="header-top">
                        <button onClick={() => navigate('/orders')} className="back-btn">
                            ← Back to Orders
                        </button>
                    </div>
                    <div className="order-title">
                        <h1>Order Not Found</h1>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="order-details">
            {/* Header Section */}
            <div className="order-header">
                <div className="header-top">
                    <button onClick={() => navigate('/orders')} className="back-btn">
                        ← Back to Orders
                    </button>
                    <span className={`order-status-badge ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                    </span>
                </div>
                <div className="order-title">
                    <h1>Order #{order.id}</h1>
                    <div className="order-meta">
                        <span>
                            📅 Order Date: {formatDate(order.shippedDate)}
                        </span>
                        <span>
                            🚚 Shipping: {order.shippingMethod}
                        </span>
                        <span>
                            📦 Items: {listingOrders.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="order-sidebar">
                {/* Order Summary */}
                <div className="summary-card">
                    <h3>💰 Order Summary</h3>
                    <div className="summary-content">
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>{order.payment.total} {order.payment.currency}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping:</span>
                            <span>Free</span>
                        </div>
                        <div className="summary-row">
                            <strong>Total:</strong>
                            <span>{order.payment.total} {order.payment.currency}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Information */}
                <div className="summary-card">
                    <h3>💳 Payment Details</h3>
                    <div className="summary-content">
                        <div className="payment-status">
                            <span>Status:</span>
                            <span className={`payment-status-badge ${getPaymentStatusColor(order.payment.paymentStatus)}`}>
                                    {order.payment.paymentStatus}
                                </span>
                        </div>
                        <div className="summary-row">
                            <span>Method:</span>
                            <span>{order.payment.paymentMethod.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>

                {/* Shipping Information */}
                <div className="summary-card">
                    <h3>🚚 Shipping Details</h3>
                    <div className="summary-content">
                        <div className="address-block">
                            <div className="address-line">{order.address.street}</div>
                            <div className="address-line">{order.address.city}, {order.address.state}</div>
                            <div className="address-line">{order.address.zipCode}</div>
                            <div className="address-line">{order.address.country}</div>
                        </div>
                        <div className="summary-row">
                            <span>Method:</span>
                            <span>{order.shippingMethod}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipped:</span>
                            <span>{formatDate(order.shippedDate)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="order-content">
                {/* Items Section */}
                <div className="order-items-section">
                    <div className="section-header">
                        <h2>Order Items</h2>
                    </div>
                    <div className="listings-grid">
                        {listingOrders.length === 0 ? (
                            <div className="no-items">No items found for this order.</div>
                        ) : (
                            listingOrders.map((listingOrder) => (
                                <div key={listingOrder.id} className="listing-item">
                                    <img
                                        src={listingOrder.listing.imageUrl}
                                        alt={listingOrder.listing.title}
                                        className="listing-image"
                                        onError={(e) => {
                                            e.target.src = 'https://placehold.co/400';
                                        }}
                                    />
                                    <div className="listing-details">
                                        <div className="listing-info">
                                            <h4 className="listing-title">
                                                {listingOrder.listing.title}
                                            </h4>
                                            {listingOrder.listing.description && (
                                                <p className="listing-description">
                                                    {listingOrder.listing.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="listing-price-section">
                                            <div className="listing-price">
                                                {listingOrder.listing.price} PLN
                                            </div>
                                            <div className="listing-status-order">
                                                <span className={`listing-status ${getStatusColor(listingOrder.listingStatus)}`}>
                                                    {listingOrder.listingStatus}
                                                </span>
                                            </div>
                                            {listingOrder.listing.averageRating && listingOrder.listing.averageRating > 0 && (
                                                <div className="listing-rating">
                                                    ⭐ {listingOrder.listing.averageRating.toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {user?.role !== 'USER' && listingOrder.listingStatus === 'SHIPPING' && (
                                        <button onClick={() => handleShipOrder(listingOrder.id)} >
                                            Ship product to the client
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDetails;