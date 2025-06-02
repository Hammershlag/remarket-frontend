import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {useUser} from "../../contexts/UserContext";

function OrderDetails() {
    const [order, setOrder] = useState(null);
    const [listings, setListings] = useState([]);
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

            // Fetch listings for this order
            const listingsWithPhotos = await Promise.all(
                order.listingIds.map(async (listingId) => {
                    try {
                        // Fetch listing details
                        const listingResponse = await fetch(`http://localhost:8080/api/listings/${listingId}`, {
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

                        // Fetch photo if available
                        let imageUrl = 'https://placehold.co/400';
                        if (listing.photos && listing.photos.length > 0) {
                            const photoId = listing.photos[0].id;
                            try {
                                const photoResponse = await fetch(`http://localhost:8080/api/photo/listing/${photoId}`, {
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

                        return { ...listing, imageUrl };
                    } catch (listingError) {
                        console.error(`Error fetching listing ${listingId}:`, listingError);
                        return null;
                    }
                })
            );

            // Filter out any failed listings
            const validListings = listingsWithPhotos.filter(listing => listing !== null);
            setListings(validListings);
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
            <div className="order-details">
                <button onClick={() => navigate('/orders')} style={{ marginBottom: '20px' }}>
                    ← Back to Orders
                </button>
                <h1>Order Details</h1>
                <div className="loading">Loading order details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-details">
                <button onClick={() => navigate('/orders')} style={{ marginBottom: '20px' }}>
                    ← Back to Orders
                </button>
                <h1>Order Details</h1>
                <div className="error" style={{ color: 'red', padding: '20px' }}>
                    Error: {error}
                    {order && (
                        <button onClick={fetchListingsForOrder} style={{ marginLeft: '10px' }}>
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
                <button onClick={() => navigate('/orders')} style={{ marginBottom: '20px' }}>
                    ← Back to Orders
                </button>
                <h1>Order Not Found</h1>
            </div>
        );
    }

    return (
        <div className="order-details" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <button
                onClick={() => navigate('/orders')}
                style={{
                    marginBottom: '20px',
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                ← Back to Orders
            </button>

            <div className="order-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
            }}>
                <h1>Order #{order.id}</h1>
                <span style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    backgroundColor: getStatusColor(order.orderStatus),
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}>
          {order.orderStatus}
        </span>
            </div>

            <div className="order-info" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '30px',
                marginBottom: '40px'
            }}>
                <div className="shipping-info" style={{
                    padding: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                }}>
                    <h3>Shipping Information</h3>
                    <div style={{ marginBottom: '15px' }}>
                        <strong>Address:</strong><br/>
                        {order.address.street}<br/>
                        {order.address.city}, {order.address.state}<br/>
                        {order.address.zipCode}<br/>
                        {order.address.country}
                    </div>
                    <p><strong>Shipping Method:</strong> {order.shippingMethod}</p>
                    <p><strong>Shipped Date:</strong> {formatDate(order.shippedDate)}</p>
                </div>

                <div className="payment-info" style={{
                    padding: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                }}>
                    <h3>Payment Information</h3>
                    <p><strong>Total:</strong> {order.payment.total} {order.payment.currency}</p>
                    <p><strong>Payment Method:</strong> {order.payment.paymentMethod.replace('_', ' ')}</p>
                    <p>
                        <strong>Payment Status:</strong>
                        <span style={{
                            marginLeft: '8px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: getPaymentStatusColor(order.payment.paymentStatus),
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}>
              {order.payment.paymentStatus}
            </span>
                    </p>
                </div>
            </div>

            <div className="order-items">
                <h3 style={{ marginBottom: '20px' }}>Items in this Order ({listings.length})</h3>

                {listings.length === 0 ? (
                    <p>No items found for this order.</p>
                ) : (
                    <div className="listings-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {listings.map((listing) => (
                            <div key={listing.id} className="listing-card" style={{
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: 'white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                <img
                                    src={listing.imageUrl}
                                    alt={listing.title}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        e.target.src = 'https://placehold.co/400';
                                    }}
                                />
                                <div style={{ padding: '15px' }}>
                                    <h4 style={{
                                        margin: '0 0 10px 0',
                                        fontSize: '16px',
                                        fontWeight: 'bold'
                                    }}>
                                        {listing.title}
                                    </h4>
                                    {listing.description && (
                                        <p style={{
                                            color: '#666',
                                            fontSize: '14px',
                                            margin: '0 0 10px 0',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {listing.description}
                                        </p>
                                    )}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: '10px'
                                    }}>
                    <span style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#007bff'
                    }}>
                      {listing.price} PLN
                    </span>
                                        {listing.averageRating && (
                                            <span style={{
                                                fontSize: '14px',
                                                color: '#666'
                                            }}>
                        ⭐ {listing.averageRating.toFixed(1)}
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderDetails;