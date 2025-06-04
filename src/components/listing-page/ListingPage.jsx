import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { useUser } from "../../contexts/UserContext";
import "./ListingPage.css";

function ListingPage(props) {
    const { id } = useParams();
    const { user } = useUser();
    const [listing, setListing] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState(null);

    // Photo modal state
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

    // Review form state
    const [rating, setRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState("");
    const [reviewDescription, setReviewDescription] = useState("");
    const [reviewError, setReviewError] = useState(null);
    const [reviewSuccess, setReviewSuccess] = useState(null);

    // Edit review state
    const [editingReview, setEditingReview] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    const openPhotoModal = (index) => {
        setSelectedPhotoIndex(index);
    };

    const closePhotoModal = () => {
        setSelectedPhotoIndex(null);
    };

    const nextPhoto = () => {
        setSelectedPhotoIndex((prev) =>
            prev === photos.length - 1 ? 0 : prev + 1
        );
    };

    const prevPhoto = () => {
        setSelectedPhotoIndex((prev) =>
            prev === 0 ? photos.length - 1 : prev - 1
        );
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleKeyPress = (e) => {
        if (selectedPhotoIndex !== null) {
            if (e.key === 'Escape') closePhotoModal();
            if (e.key === 'ArrowRight') nextPhoto();
            if (e.key === 'ArrowLeft') prevPhoto();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    const addToCart = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${id}/shopping-cart`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert('Item added to cart');
            } else {
                const errorData = await response.json();
                alert(errorData.errorMessage || 'Failed to add item to cart');
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert('An error occurred while adding to cart');
        }
    };

    const toggleWishlist = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${id}/wishlist`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert('Item added to wishlist');
            } else {
                const errorData = await response.json();
                alert(errorData.errorMessage || 'Failed to update wishlist');
            }
        } catch (error) {
            console.error("Error toggling wishlist:", error);
            alert('An error occurred while updating wishlist');
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        setReviewError(null);
        setReviewSuccess(null);

        if (rating < 1 || rating > 5) {
            setReviewError("Rating must be between 1 and 5");
            return;
        }
        if (!reviewTitle.trim()) {
            setReviewError("Review title is required");
            return;
        }

        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${id}/review`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rating,
                    title: reviewTitle,
                    description: reviewDescription,
                }),
            });

            if (response.ok) {
                setReviewSuccess("Review submitted successfully!");
                setReviewTitle("");
                setReviewDescription("");
                setRating(5);

                // Refresh listing to show new review
                await refreshListing();
            } else {
                const errorData = await response.json();
                setReviewError(errorData.errorMessage || "Failed to submit review");
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            setReviewError("An error occurred while submitting your review");
        }
    };

    const deleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) {
            return;
        }

        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${id}/review/${reviewId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setReviewSuccess("Review deleted successfully!");
                await refreshListing();
            } else {
                const errorData = await response.json();
                setReviewError(errorData.errorMessage || "Failed to delete review");
            }
        } catch (error) {
            console.error("Error deleting review:", error);
            setReviewError("An error occurred while deleting your review");
        }
    };

    const startEditReview = (review) => {
        setEditingReview(review.id);
        setEditRating(review.rating);
        setEditTitle(review.title);
        setEditDescription(review.description);
        setReviewError(null);
        setReviewSuccess(null);
    };

    const cancelEditReview = () => {
        setEditingReview(null);
        setEditRating(5);
        setEditTitle("");
        setEditDescription("");
    };

    const submitEditReview = async (e, reviewId) => {
        e.preventDefault();
        setReviewError(null);
        setReviewSuccess(null);

        if (editRating < 1 || editRating > 5) {
            setReviewError("Rating must be between 1 and 5");
            return;
        }
        if (!editTitle.trim()) {
            setReviewError("Review title is required");
            return;
        }

        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${id}/review/${reviewId}`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rating: editRating,
                    title: editTitle,
                    description: editDescription,
                }),
            });

            if (response.ok) {
                setReviewSuccess("Review updated successfully!");
                setEditingReview(null);
                await refreshListing();
            } else {
                const errorData = await response.json();
                setReviewError(errorData.errorMessage || "Failed to update review");
            }
        } catch (error) {
            console.error("Error updating review:", error);
            setReviewError("An error occurred while updating your review");
        }
    };

    const refreshListing = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${id}`);
            if (response.ok) {
                const listingData = await response.json();
                setListing(listingData);
            }
        } catch (error) {
            console.error("Error refreshing listing:", error);
        }
    };

    const flagListing = async () => {
        if (!window.confirm("Are you sure you want to flag this listing?")) {
            return;
        }

        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${id}/flag`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert('Listing flagged successfully');
            } else {
                const errorData = await response.json();
                alert(errorData.errorMessage || 'Failed to flag listing');
            }
        } catch (error) {
            console.error("Error flagging listing:", error);
            alert('An error occurred while flagging the listing');
        }
    };

    const flagReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to flag this review?")) {
            return;
        }

        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${id}/review/${reviewId}/flag`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert('Review flagged successfully');
            } else {
                const errorData = await response.json();
                alert(errorData.errorMessage || 'Failed to flag review');
            }
        } catch (error) {
            console.error("Error flagging review:", error);
            alert('An error occurred while flagging the review');
        }
    };

    const isUserReview = (review) => {
        return user && user.username === review.reviewerUsername;
    };

    const hasUserReview = () => {
        return user && listing.reviews && listing.reviews.some(review =>
            review.reviewerUsername === user.username
        );
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
        ));
    };

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch listing details");
                }
                const listingData = await response.json();
                setListing(listingData);
            } catch (err) {
                console.error(err);
                setError("Error fetching listing details");
            }
        };

        const fetchPhotos = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/photo/listing/listing/${id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch listing photos");
                }
                const photosData = await response.json();
                setPhotos(photosData.map(photo => ({
                    ...photo,
                    imageUrl: `data:image/jpeg;base64,${photo.data}`
                })));
            } catch (err) {
                console.error(err);
                setError("Error fetching listing photos");
            }
        };

        fetchListing();
        fetchPhotos();
    }, [id]);

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    if (!listing) {
        return <div className="loading-message">Loading...</div>;
    }

    return (
        <div className="listing-container">
            <div className="listing-header">
                <h1 className="listing-title">{listing.title}</h1>
                <div className="listing-price">${listing.price.toFixed(2)}</div>
            </div>

            <div className="listing-content">
                <div className="listing-main">
                    <div className="photos-section">
                        <div className="photo-gallery">
                            {photos.length > 0 ? (
                                photos.map((photo, index) => (
                                    <div key={photo.id} className="photo-item" onClick={() => openPhotoModal(index)}>
                                        {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                                        <img
                                            src={photo.imageUrl}
                                            alt={`Photo ${index + 1}`}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="no-photos">
                                    <p>No photos available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="listing-description">
                        <h2>Description</h2>
                        <p>{listing.description}</p>
                    </div>
                </div>

                <div className="listing-sidebar">
                    <div className="listing-info-card">
                        <div className="info-item">
                            <span className="label">Category:</span>
                            <span className="value">{listing.category.name}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Seller:</span>
                            <span className="value">{listing.sellerUsername}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Status:</span>
                            <span className="value status">{listing.status}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Rating:</span>
                            <span className="value rating">
                                {listing.averageRating === -1 ? (
                                    "No reviews yet"
                                ) : (
                                    <>
                                        {renderStars(Math.round(listing.averageRating))}
                                        <span className="rating-number">({listing.averageRating.toFixed(1)})</span>
                                    </>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="listing-actions">
                        <button onClick={addToCart} className="btn btn-primary">
                            <FontAwesomeIcon icon={faCartShopping} />
                            Add to Cart
                        </button>
                        <button onClick={toggleWishlist} className="btn btn-secondary">
                            <FontAwesomeIcon icon={regularHeart} />
                            Add to Wishlist
                        </button>
                    </div>

                    {user && (
                        <div className="flag-listing">
                            <button onClick={flagListing} className="btn btn-flag">
                                🚩 Flag Listing
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="review-section">
                {!hasUserReview() && user && (
                    <div className="add-review-section">
                        <h2>Add a Review</h2>
                        {reviewError && <div className="error-message">{reviewError}</div>}
                        {reviewSuccess && <div className="success-message">{reviewSuccess}</div>}
                        <form onSubmit={submitReview} className="review-form">
                            <div className="form-group">
                                <label>Rating:</label>
                                <div className="star-rating">
                                    {[1,2,3,4,5].map(num => (
                                        <span
                                            key={num}
                                            className={`star-input ${rating >= num ? 'selected' : ''}`}
                                            onClick={() => setRating(num)}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Title:</label>
                                <input
                                    type="text"
                                    value={reviewTitle}
                                    onChange={(e) => setReviewTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description:</label>
                                <textarea
                                    value={reviewDescription}
                                    onChange={(e) => setReviewDescription(e.target.value)}
                                    rows="4"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Submit Review</button>
                        </form>
                    </div>
                )}

                <div className="reviews-section">
                    <h2>Reviews</h2>
                    {listing.reviews && listing.reviews.length > 0 ? (
                        <div className="reviews-list">
                            {listing.reviews.map(review => (
                                <div key={review.id} className="review-item">
                                    {editingReview === review.id ? (
                                        <form onSubmit={(e) => submitEditReview(e, review.id)} className="review-form">
                                            <div className="form-group">
                                                <label>Rating:</label>
                                                <div className="star-rating">
                                                    {[1,2,3,4,5].map(num => (
                                                        <span
                                                            key={num}
                                                            className={`star-input ${editRating >= num ? 'selected' : ''}`}
                                                            onClick={() => setEditRating(num)}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Title:</label>
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Description:</label>
                                                <textarea
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    rows="4"
                                                />
                                            </div>
                                            <div className="form-actions">
                                                <button type="submit" className="btn btn-primary">Update Review</button>
                                                <button type="button" onClick={cancelEditReview} className="btn btn-secondary">Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="review-header">
                                                <div className="review-rating">
                                                    {renderStars(review.rating)}
                                                </div>
                                                <div className="review-author">By: {review.reviewerUsername}</div>
                                            </div>
                                            <h3 className="review-title">{review.title}</h3>
                                            <p className="review-description">{review.description}</p>
                                            <div className="review-controls">
                                                {isUserReview(review) && (
                                                    <div className="review-actions">
                                                        <button onClick={() => startEditReview(review)} className="btn btn-small">Edit</button>
                                                        <button onClick={() => deleteReview(review.id)} className="btn btn-small btn-danger">Delete</button>
                                                    </div>
                                                )}
                                                {user && !isUserReview(review) && (
                                                    <button onClick={() => flagReview(review.id)} className="btn btn-small btn-flag">
                                                        🚩 Flag Review
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-reviews">No reviews yet.</p>
                    )}
                </div>
            </div>

            {/* Photo Modal */}
            {selectedPhotoIndex !== null && (
                <div className="photo-modal" onClick={closePhotoModal}>
                    <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closePhotoModal}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>

                        {photos.length > 1 && (
                            <>
                                <button className="modal-nav modal-prev" onClick={prevPhoto}>
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <button className="modal-nav modal-next" onClick={nextPhoto}>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </>
                        )}

                        <img
                            src={photos[selectedPhotoIndex]?.imageUrl}
                            alt={`Photo ${selectedPhotoIndex + 1}`}
                        />

                        {photos.length > 1 && (
                            <div className="photo-counter">
                                {selectedPhotoIndex + 1} of {photos.length}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListingPage;
