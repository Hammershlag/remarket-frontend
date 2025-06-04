import { useState, useEffect } from 'react';
import { useUser } from "../../../../contexts/UserContext";
import './FlaggingReviews.css';

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

            const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/stuff/reviews/flagged', {
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

    const handleForwardToAdmin = async (reviewId) => {
        if (!token) return;

        setProcessingReviews(prev => new Set(prev).add(reviewId));

        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/stuff/review/${reviewId}/status/flag`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to forward review to admin');
            }

            // Remove the review from the current list since it's been forwarded
            setReviews(prev => prev.filter(review => review.id !== reviewId));
        } catch (error) {
            console.error('Error forwarding review to admin:', error);
            alert('Failed to forward review to admin. Please try again.');
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
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/stuff/review/${reviewId}/status/dismiss`, {
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
            <div className="flagging-reviews-main-container">
                <h1 className="flagging-reviews-page-title">Flagged Reviews</h1>
                <p className="flagging-reviews-error-message">Please log in to view flagged reviews.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flagging-reviews-main-container">
                <h1 className="flagging-reviews-page-title">Flagged Reviews</h1>
                <p>Loading flagged reviews...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flagging-reviews-main-container">
                <h1 className="flagging-reviews-page-title">Flagged Reviews</h1>
                <p className="flagging-reviews-error-message">Error: {error}</p>
                <button onClick={fetchFlaggedReviews} className="flagging-reviews-retry-btn">Retry</button>
            </div>
        );
    }

    return (
        <div className="flagging-reviews-main-container">
            <h1 className="flagging-reviews-page-title">Flagged Reviews ({reviews.length})</h1>

            {reviews.length === 0 ? (
                <p className="flagging-reviews-empty-message">No flagged reviews found.</p>
            ) : (
                <div className="flagging-reviews-grid">
                    {reviews.map((review) => (
                        <div key={review.id} className="flagging-review-item">
                            <div className="flagging-review-layout">
                                {/* Review Details */}
                                <div className="flagging-review-info">
                                    <div className="flagging-review-header">
                                        <h3 className="flagging-review-title">{review.title}</h3>
                                        <div className="flagging-review-rating">
                                            <span className="flagging-review-stars">{renderStars(review.rating)}</span>
                                            <span className="flagging-review-rating-text">({review.rating}/5)</span>
                                        </div>
                                    </div>
                                    <div className="flagging-review-meta">
                                        <span className="flagging-review-reviewer">By: {review.reviewerUsername}</span>
                                        <span className="flagging-review-listing">Listing ID: {review.listingId}</span>
                                    </div>
                                    <p className="flagging-review-description">{review.description}</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flagging-review-actions">
                                    <button
                                        onClick={() => handleForwardToAdmin(review.id)}
                                        disabled={processingReviews.has(review.id)}
                                        className="flagging-review-action-btn flagging-review-forward-btn"
                                    >
                                        {processingReviews.has(review.id) ? 'Processing...' : 'Forward to Admin'}
                                    </button>
                                    <button
                                        onClick={() => handleDismissFlag(review.id)}
                                        disabled={processingReviews.has(review.id)}
                                        className="flagging-review-action-btn flagging-review-dismiss-btn"
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