import { useState, useEffect } from 'react';
import { useUser } from "../../../contexts/UserContext";
import './AdminFlaggingReviews.css';

function FlaggingReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingReviews, setProcessingReviews] = useState(new Set());

    const { user: currentUser } = useUser();
    const token = currentUser?.token;

    useEffect(() => {
        if (!token) {
            setError('Authentication required');
            setLoading(false);
            return;
        }

        fetchFlaggedReviews();
    }, [token]);

    const fetchFlaggedReviews = async () => {
        try {
            setLoading(true);

            const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/admin/reviews/status/flagged', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reviews');
            }

            const data = await response.json();
            const reviewsData = data.content || [];

            setReviews(reviewsData);
        } catch (error) {
            setError(error.message);
            console.error('Error fetching flagged reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockReview = async (reviewId) => {
        if (!token) return;

        setProcessingReviews(prev => new Set(prev).add(reviewId));

        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/admin/reviews/${reviewId}/block`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to block review');
            }

            // Remove the review from the current list since it's been blocked
            setReviews(prev => prev.filter(review => review.id !== reviewId));
        } catch (error) {
            console.error('Error blocking review:', error);
            alert('Failed to block review. Please try again.');
        } finally {
            setProcessingReviews(prev => {
                const newSet = new Set(prev);
                newSet.delete(reviewId);
                return newSet;
            });
        }
    };

    const handleDismissFlag = async (reviewId) => {
        if (!token) return;

        setProcessingReviews(prev => new Set(prev).add(reviewId));

        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/admin/reviews/${reviewId}/dismiss`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to dismiss review flag');
            }

            // Remove the review from the current list since it's been dismissed
            setReviews(prev => prev.filter(review => review.id !== reviewId));
        } catch (error) {
            console.error('Error dismissing review flag:', error);
            alert('Failed to dismiss review flag. Please try again.');
        } finally {
            setProcessingReviews(prev => {
                const newSet = new Set(prev);
                newSet.delete(reviewId);
                return newSet;
            });
        }
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    if (!token) {
        return (
            <div className="admin-flagged-reviews-main-container">
                <h1 className="admin-flagged-reviews-page-title">Flagged Reviews</h1>
                <p className="admin-flagged-reviews-error-message">Please log in to view flagged reviews.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="admin-flagged-reviews-main-container">
                <h1 className="admin-flagged-reviews-page-title">Flagged Reviews</h1>
                <p>Loading flagged reviews...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-flagged-reviews-main-container">
                <h1 className="admin-flagged-reviews-page-title">Flagged Reviews</h1>
                <p className="admin-flagged-reviews-error-message">Error: {error}</p>
                <button onClick={fetchFlaggedReviews} className="admin-flagged-reviews-retry-btn">Retry</button>
            </div>
        );
    }

    return (
        <div className="admin-flagged-reviews-main-container">
            <h1 className="admin-flagged-reviews-page-title">Flagged Reviews ({reviews.length})</h1>

            {reviews.length === 0 ? (
                <p className="admin-flagged-reviews-empty-message">No flagged reviews found.</p>
            ) : (
                <div className="admin-flagged-reviews-grid">
                    {reviews.map((review) => (
                        <div key={review.id} className="admin-flagged-review-item">
                            <div className="admin-flagged-review-layout">
                                {/* Review Details */}
                                <div className="admin-flagged-review-info">
                                    <div className="admin-flagged-review-header">
                                        <h3 className="admin-flagged-review-title">{review.title}</h3>
                                        <div className="admin-flagged-review-rating">
                                            <span className="admin-flagged-review-stars">{renderStars(review.rating)}</span>
                                            <span className="admin-flagged-review-rating-text">({review.rating}/5)</span>
                                        </div>
                                    </div>
                                    <div className="admin-flagged-review-meta">
                                        <span className="admin-flagged-review-reviewer">By: {review.reviewerUsername}</span>
                                        <span className="admin-flagged-review-listing">Listing ID: {review.listingId}</span>
                                    </div>
                                    <p className="admin-flagged-review-description">{review.description}</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="admin-flagged-review-actions">
                                    <button
                                        onClick={() => handleBlockReview(review.id)}
                                        disabled={processingReviews.has(review.id)}
                                        className="admin-flagged-review-action-btn admin-flagged-review-block-btn"
                                    >
                                        {processingReviews.has(review.id) ? 'Processing...' : 'Block Review'}
                                    </button>
                                    <button
                                        onClick={() => handleDismissFlag(review.id)}
                                        disabled={processingReviews.has(review.id)}
                                        className="admin-flagged-review-action-btn admin-flagged-review-dismiss-btn"
                                    >
                                        {processingReviews.has(review.id) ? 'Processing...' : 'Dismiss Flag'}
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

export default FlaggingReviews;