import { useState, useEffect } from 'react';
import { useUser } from "../../../contexts/UserContext";
import './AdminFlaggingListings.css';

function FlaggingListings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingListings, setProcessingListings] = useState(new Set());

    const { user: currentUser } = useUser();
    const token = currentUser?.token;

    useEffect(() => {
        if (!token) {
            setError('Authentication required');
            setLoading(false);
            return;
        }

        fetchFlaggedListings();
    }, [token]);

    const fetchFlaggedListings = async () => {
        try {
            setLoading(true);

            const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/admin/listings/status/flagged', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch listings');
            }

            const data = await response.json();
            const listingsData = data.content || [];

            const listingsWithPhotos = await Promise.all(
                listingsData.map(async (listing) => {
                    if (listing.photos && listing.photos.length > 0) {
                        const photoId = listing.photos[0].id;
                        try {
                            const photoResponse = await fetch(process.env.REACT_APP_BASE_URL + `/api/photo/listing/${photoId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            if (photoResponse.ok) {
                                const photoBase64 = await photoResponse.json();
                                const photoUrl = `data:image/jpeg;base64,${photoBase64.data}`;
                                return { ...listing, imageUrl: photoUrl };
                            }
                        } catch (error) {
                            console.error(`Failed to fetch photo for listing ${listing.id}:`, error);
                        }
                    }
                    return { ...listing, imageUrl: 'https://placehold.co/400' };
                })
            );

            setListings(listingsWithPhotos);
        } catch (error) {
            setError(error.message);
            console.error('Error fetching flagged listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockListing = async (listingId) => {
        if (!token) return;

        setProcessingListings(prev => new Set(prev).add(listingId));

        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/admin/listings/${listingId}/block`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to block listing');
            }

            // Remove the listing from the current list since it's been blocked
            setListings(prev => prev.filter(listing => listing.id !== listingId));
        } catch (error) {
            console.error('Error blocking listing:', error);
            alert('Failed to block listing. Please try again.');
        } finally {
            setProcessingListings(prev => {
                const newSet = new Set(prev);
                newSet.delete(listingId);
                return newSet;
            });
        }
    };

    const handleDismissFlag = async (listingId) => {
        if (!token) return;

        setProcessingListings(prev => new Set(prev).add(listingId));

        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/admin/listings/${listingId}/dismiss`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to dismiss listing flag');
            }

            // Remove the listing from the current list since it's been dismissed
            setListings(prev => prev.filter(listing => listing.id !== listingId));
        } catch (error) {
            console.error('Error dismissing listing flag:', error);
            alert('Failed to dismiss listing flag. Please try again.');
        } finally {
            setProcessingListings(prev => {
                const newSet = new Set(prev);
                newSet.delete(listingId);
                return newSet;
            });
        }
    };

    if (!token) {
        return (
            <div className="admin-flagged-main-container">
                <h1 className="admin-flagged-page-title">Flagged Listings</h1>
                <p className="admin-flagged-error-message">Please log in to view flagged listings.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="admin-flagged-main-container">
                <h1 className="admin-flagged-page-title">Flagged Listings</h1>
                <p>Loading flagged listings...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-flagged-main-container">
                <h1 className="admin-flagged-page-title">Flagged Listings</h1>
                <p className="admin-flagged-error-message">Error: {error}</p>
                <button onClick={fetchFlaggedListings} className="admin-flagged-retry-btn">Retry</button>
            </div>
        );
    }

    return (
        <div className="admin-flagged-main-container">
            <h1 className="admin-flagged-page-title">Flagged Listings ({listings.length})</h1>

            {listings.length === 0 ? (
                <p className="admin-flagged-empty-message">No flagged listings found.</p>
            ) : (
                <div className="admin-flagged-listings-grid">
                    {listings.map((listing) => (
                        <div key={listing.id} className="admin-flagged-listing-item">
                            <div className="admin-flagged-item-layout">
                                {/* Image */}
                                <div className="admin-flagged-image-wrapper">
                                    <img
                                        src={listing.imageUrl}
                                        alt={listing.title}
                                        className="admin-flagged-listing-img"
                                    />
                                </div>

                                {/* Listing Details */}
                                <div className="admin-flagged-listing-info">
                                    <div className="admin-flagged-info-row">
                                        <h3 className="admin-flagged-item-title">{listing.title}</h3>
                                        <span className="admin-flagged-item-price">${listing.price.toFixed(2)}</span>
                                        <span className="admin-flagged-item-status">{listing.status}</span>
                                    </div>
                                    <div className="admin-flagged-info-row">
                                        <span className="admin-flagged-seller-info">Seller: {listing.sellerUsername}</span>
                                        <span className="admin-flagged-category-info">Category: {listing.category.name}</span>
                                    </div>
                                    <p className="admin-flagged-item-description">{listing.description}</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="admin-flagged-action-controls">
                                    <button
                                        onClick={() => handleBlockListing(listing.id)}
                                        disabled={processingListings.has(listing.id)}
                                        className="admin-flagged-action-btn admin-flagged-block-btn"
                                    >
                                        {processingListings.has(listing.id) ? 'Processing...' : 'Block Listing'}
                                    </button>
                                    <button
                                        onClick={() => handleDismissFlag(listing.id)}
                                        disabled={processingListings.has(listing.id)}
                                        className="admin-flagged-action-btn admin-flagged-dismiss-btn"
                                    >
                                        {processingListings.has(listing.id) ? 'Processing...' : 'Dismiss Flag'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FlaggingListings;