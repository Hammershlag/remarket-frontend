import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { useUser } from "../../contexts/UserContext";
import "./ListingPage.css";

function ListingPage(props) {
    const { id } = useParams();
    const { user } = useUser();
    const [listing, setListing] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        console.log(id);
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
        </div>
    );
}

export default ListingPage;

