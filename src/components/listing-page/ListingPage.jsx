import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { useUser } from "../../contexts/UserContext";
import "./ListingPage.css";

function ListingPage(props) {
    const { id } = useParams();
    const { user } = useUser();
    const [listing, setListing] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState(null);

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

    const addToCart = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/listings/${id}/shopping-cart`, {
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
            const response = await fetch(`http://localhost:8080/api/listings/${id}/wishlist`, {
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
            const response = await fetch(`http://localhost:8080/api/listings/${id}/review`, {
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
            const response = await fetch(`http://localhost:8080/api/listings/${id}/review/${reviewId}`, {
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
            const response = await fetch(`http://localhost:8080/api/listings/${id}/review/${reviewId}`, {
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
            const response = await fetch(`http://localhost:8080/api/listings/${id}`);
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
            const response = await fetch(`http://localhost:8080/api/listings/${id}/flag`, {
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
            const response = await fetch(`http://localhost:8080/api/listings/${id}/review/${reviewId}/flag`, {
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

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/listings/${id}`);
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
                const response = await fetch(`http://localhost:8080/api/photo/listing/listing/${id}`);
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
        return <div>Error: {error}</div>;
    }

    if (!listing) {
        return <div>Loading...</div>;
    }

    return (
        <div className="listing-container">
            <h1 className="listing-title">{listing.title}</h1>
            <div className="listing-info">
                <p>{listing.description}</p>
                <p><span className="label">Price:</span> ${listing.price.toFixed(2)}</p>
                <p><span className="label">Category:</span> {listing.category.name}</p>
                <p><span className="label">Seller:</span> {listing.sellerUsername}</p>
                <p><span className="label">Status:</span> {listing.status}</p>
                <p><span className="label">Average Rating:</span> {listing.averageRating === -1 ? "No reviews yet" : listing.averageRating.toFixed(1)}</p>
                {user && (
                    <div className="flag-listing">
                        <button onClick={flagListing} className="flag-button" title="Flag this listing">
                            🚩 Flag Listing
                        </button>
                    </div>
                )}
            </div>
            <div className="photos-section">
                <h2>Photos</h2>
                <div className="photo-gallery">
                    {photos.length > 0 ? (
                        photos.map((photo) => (
                            <img
                                key={photo.id}
                                src={photo.imageUrl}
                                alt={`Photo ${photo.id}`}
                            />
                        ))
                    ) : (
                        <p>No photos available</p>
                    )}
                </div>
            </div>
            <div className="listing-actions">
                <button onClick={addToCart} title="Add to Cart">
                    <FontAwesomeIcon icon={faCartShopping} /> Add to Cart
                </button>
                <button onClick={toggleWishlist} title="Add to Wishlist">
                    <FontAwesomeIcon icon={regularHeart} /> Add to Wishlist
                </button>
            </div>

            <div className="review-section">
                {!hasUserReview() && (
                    <>
                        <h2>Add a Review</h2>
                        {reviewError && <p className="error-message">{reviewError}</p>}
                        {reviewSuccess && <p className="success-message">{reviewSuccess}</p>}
                        <form onSubmit={submitReview}>
                            <label>
                                Rating (1-5):{" "}
                                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                                    {[1,2,3,4,5].map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </label>
                            <br />
                            <label>
                                Title: <br />
                                <input
                                    type="text"
                                    value={reviewTitle}
                                    onChange={(e) => setReviewTitle(e.target.value)}
                                    required
                                />
                            </label>
                            <br />
                            <label>
                                Description: <br />
                                <textarea
                                    value={reviewDescription}
                                    onChange={(e) => setReviewDescription(e.target.value)}
                                    rows="4"
                                />
                            </label>
                            <br />
                            <button type="submit">Submit Review</button>
                        </form>
                    </>
                )}

                <h2>Reviews</h2>
                {listing.reviews && listing.reviews.length > 0 ? (
                    <ul className="reviews-list">
                        {listing.reviews.map(review => (
                            <li key={review.id} className="review-item">
                                {editingReview === review.id ? (
                                    // Edit form
                                    <form onSubmit={(e) => submitEditReview(e, review.id)}>
                                        <label>
                                            Rating (1-5):{" "}
                                            <select value={editRating} onChange={(e) => setEditRating(Number(e.target.value))}>
                                                {[1,2,3,4,5].map(num => (
                                                    <option key={num} value={num}>{num}</option>
                                                ))}
                                            </select>
                                        </label>
                                        <br />
                                        <label>
                                            Title: <br />
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                required
                                            />
                                        </label>
                                        <br />
                                        <label>
                                            Description: <br />
                                            <textarea
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                rows="4"
                                            />
                                        </label>
                                        <br />
                                        <button type="submit">Update Review</button>
                                        <button type="button" onClick={cancelEditReview}>Cancel</button>
                                    </form>
                                ) : (
                                    // Display review
                                    <>
                                        <p><strong>Rating:</strong> {review.rating} / 5</p>
                                        <p><strong>Title:</strong> {review.title}</p>
                                        <p><strong>Description:</strong> {review.description}</p>
                                        <p><em>By: {review.reviewerUsername}</em></p>
                                        <div className="review-controls">
                                            {isUserReview(review) && (
                                                <div className="review-actions">
                                                    <button onClick={() => startEditReview(review)}>Edit</button>
                                                    <button onClick={() => deleteReview(review.id)}>Delete</button>
                                                </div>
                                            )}
                                            {user && !isUserReview(review) && (
                                                <div className="flag-review">
                                                    <button onClick={() => flagReview(review.id)} className="flag-button" title="Flag this review">
                                                        🚩 Flag Review
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No reviews yet.</p>
                )}
            </div>
        </div>
    );
}

export default ListingPage;