import React, {useCallback, useEffect, useState} from 'react';
import './HomePage.css';
import '../../App.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import {useUser} from "../../contexts/UserContext";
import {useNavigate} from "react-router-dom";

function HomePage(props) {
    const {user} = useUser()
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [listings, setListings] = useState([]);
    const [allListings, setAllListings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState([1, 99999]);
    const [initialRange, setInitialRange] = useState([1, 99999]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(true);

    const [priceSort, setPriceSort] = useState('none');
    const [reviewSort, setReviewSort] = useState('none');
    const [ratingSort, setRatingSort] = useState('none');

    const applyFilters = () => {
        applyFiltersAndSort();
    }

    const applyFiltersAndSort = () => {
        // Apply filters to the listings
        const filteredListings = allListings
            .filter((listing) => {
                // Filter by search query
                if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                }

                // Filter by price range
                if (listing.price < priceRange[0] || listing.price > priceRange[1]) {
                    return false;
                }

                // Filter by category
                if (selectedCategory && listing.category.id !== parseInt(selectedCategory)) {
                    return false;
                }

                return true;
            })
            .sort((a, b) => {
                // Sort by price
                if (priceSort === "asc") {
                    return a.price - b.price;
                }
                if (priceSort === "desc") {
                    return b.price - a.price;
                }

                // Sort by reviews
                if (reviewSort === "most") {
                    const aReviews = a.reviews?.length || 0;
                    const bReviews = b.reviews?.length || 0;
                    return bReviews - aReviews;
                }
                if (reviewSort === "least") {
                    const aReviews = a.reviews?.length || 0;
                    const bReviews = b.reviews?.length || 0;
                    return aReviews - bReviews;
                }

                // Sort by average rating
                if (ratingSort === "highest") {
                    const aRating = a.averageRating || -1;
                    const bRating = b.averageRating || -1;
                    return bRating - aRating;
                }
                if (ratingSort === "lowest") {
                    const aRating = a.averageRating || -1;
                    const bRating = b.averageRating || -1;
                    return aRating - bRating;
                }

                return 0; // No sorting
            });

        setListings(filteredListings);
    }

    const fetchListings = useCallback(async () => {
        setLoading(true)

        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/listings?pageSize=99');
            if (!response.ok) {
                throw new Error("Failed to fetch listings");
            }

            const listingsData = (await response.json()).content;

            if (listingsData.length > 0) {
                const minPrice = Math.min(...listingsData.map(item => item.price));
                const maxPrice = Math.max(...listingsData.map(item => item.price));

                // Only set initial range once when it's still the default values
                if (initialRange[0] === 1 && initialRange[1] === 99999) {
                    const newInitialRange = [minPrice, maxPrice + 100];
                    setInitialRange(newInitialRange);
                    setPriceRange(newInitialRange);
                }
            }

            const listingsWithPhotos = await Promise.all(
                listingsData.map(async (listing) => {
                    if (listing.photos && listing.photos.length > 0) {
                        const photoId = listing.photos[0].id;
                        try {
                            const photoResponse = await fetch(process.env.REACT_APP_BASE_URL + `/api/photo/listing/${photoId}`);
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

            // Store all listings and apply initial filters
            setAllListings(listingsWithPhotos);

            // Apply filters and sorting to set the displayed listings
            const filteredListings = listingsWithPhotos
                .filter((listing) => {
                    // Filter by search query
                    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                        return false;
                    }

                    // Filter by price range
                    if (listing.price < priceRange[0] || listing.price > priceRange[1]) {
                        return false;
                    }

                    // Filter by category
                    if (selectedCategory && listing.category.id !== parseInt(selectedCategory)) {
                        return false;
                    }

                    return true;
                })
                .sort((a, b) => {
                    // Sort by price
                    if (priceSort === "asc") {
                        return a.price - b.price;
                    }
                    if (priceSort === "desc") {
                        return b.price - a.price;
                    }

                    // Sort by reviews
                    if (reviewSort === "most") {
                        const aReviews = a.reviews?.length || 0;
                        const bReviews = b.reviews?.length || 0;
                        return bReviews - aReviews;
                    }
                    if (reviewSort === "least") {
                        const aReviews = a.reviews?.length || 0;
                        const bReviews = b.reviews?.length || 0;
                        return aReviews - bReviews;
                    }

                    // Sort by average rating
                    if (ratingSort === "highest") {
                        const aRating = a.averageRating || -1;
                        const bRating = b.averageRating || -1;
                        return bRating - aRating;
                    }
                    if (ratingSort === "lowest") {
                        const aRating = a.averageRating || -1;
                        const bRating = b.averageRating || -1;
                        return aRating - bRating;
                    }

                    return 0; // No sorting
                });

            setListings(filteredListings);
        } catch (error) {
            console.error("Error fetching listings:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/categories`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            } else {
                console.error('Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchListings();
    }, []);

    // Apply sorting when sort options change (but not filtering)
    useEffect(() => {
        if (allListings.length > 0) {
            applyFiltersAndSort();
        }
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        applyFiltersAndSort();
    };

    const handlePriceInputChange = (value, index) => {
        const newRange = [...priceRange];
        const numValue = Number(value);

        if (index === 0) {
            // Min value: should not exceed max value and should not go below initial min
            newRange[0] = Math.max(initialRange[0], Math.min(numValue, priceRange[1]));
        } else {
            // Max value: should not go below min value and should not exceed initial max
            newRange[1] = Math.min(initialRange[1], Math.max(numValue, priceRange[0]));
        }

        setPriceRange(newRange);
    };

    const handlePriceSliderChange = (value, index) => {
        const newRange = [...priceRange];
        const numValue = Number(value);

        // Ensure the value stays within the initial range bounds
        if (index === 0) {
            // Min value: should not exceed max value and should not go below initial min
            newRange[0] = Math.max(initialRange[0], Math.min(numValue, priceRange[1]));
        } else {
            // Max value: should not go below min value and should not exceed initial max
            newRange[1] = Math.min(initialRange[1], Math.max(numValue, priceRange[0]));
        }

        setPriceRange(newRange);
    };

    const addToCart = async (id) => {
        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${id}/shopping-cart`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                props.setCartProductIds((prev) => [...prev, id]);
                props.showNotification('New item added to cart');
            } else {
                const errorData = await response.json();
                props.showNotification(errorData.errorMessage || 'Failed to add item to cart');
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            props.showNotification('An error occurred while adding to cart');
        }
    };

    const toggleWishlist = async (id) => {
        const isInWishlist = props.wishlistProductIds.includes(id);

        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${id}/wishlist`, {
                method: isInWishlist ? "DELETE" : "POST",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                props.setWishlistProductIds((prev) =>
                    isInWishlist ? prev.filter((itemId) => itemId !== id) : [...prev, id]
                );
                props.showNotification(
                    isInWishlist ? 'Item removed from wishlist' : 'Item added to wishlist'
                );
            } else {
                const errorData = await response.json();
                props.showNotification(errorData.errorMessage || 'Failed to update wishlist');
            }
        } catch (error) {
            console.error("Error toggling wishlist:", error);
            props.showNotification('An error occurred while updating wishlist');
        }
    };

    function handleProductClick(id) {
        navigate(`/listing/${id}`);
    }

    return (
        <div className="HomePage">
            <form className="search-bar" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={handleSearch}>
                    <i className="fas fa-search"></i>
                </button>
            </form>
            {props.notification && (
                <div className="notification-bubble">
                    {props.notification}
                </div>
            )}
            <div className="listings-container">
                <div className="sidebar">
                    <form onSubmit={handleSearch}>
                        <select
                            className="category-dropdown"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <div className="filter-container">
                            <label>Price Range:</label>
                            <label>
                                Min Price: {priceRange[0]}
                                <input
                                    type="range"
                                    min={initialRange[0]}
                                    max={initialRange[1]}
                                    step="1"
                                    value={priceRange[0]}
                                    onChange={(e) => handlePriceSliderChange(e.target.value, 0)}
                                />
                            </label>
                            <label>
                                Max Price: {priceRange[1]}
                                <input
                                    type="range"
                                    min={initialRange[0]}
                                    max={initialRange[1]}
                                    step="1"
                                    value={priceRange[1]}
                                    onChange={(e) => handlePriceSliderChange(e.target.value, 1)}
                                />
                            </label>

                            <div className="price-inputs">
                                <span> $ </span>
                                <input
                                    type="number"
                                    min={initialRange[0]}
                                    max={initialRange[1]}
                                    value={priceRange[0]}
                                    onChange={(e) => handlePriceInputChange(e.target.value, 0)}
                                />
                                <input
                                    type="number"
                                    min={initialRange[0]}
                                    max={initialRange[1]}
                                    value={priceRange[1]}
                                    onChange={(e) => handlePriceInputChange(e.target.value, 1)}
                                />

                            </div>

                            <label>Sort by Price:</label>
                            <select value={priceSort} onChange={(e) => setPriceSort(e.target.value)}>
                                <option value="none">None</option>
                                <option value="asc">Lowest Price</option>
                                <option value="desc">Highest Price</option>
                            </select>

                            <label>Sort by Reviews:</label>
                            <select value={reviewSort} onChange={(e) => setReviewSort(e.target.value)}>
                                <option value="none">None</option>
                                <option value="most">Most Reviews</option>
                                <option value="least">Least Reviews</option>
                            </select>

                            <label>Sort by Rating:</label>
                            <select value={ratingSort} onChange={(e) => setRatingSort(e.target.value)}>
                                <option value="none">None</option>
                                <option value="highest">Highest Rating</option>
                                <option value="lowest">Lowest Rating</option>
                            </select>
                        </div>
                    </form>
                    <button className="apply-filters-btn" onClick={applyFilters}>
                        Apply
                    </button>
                </div>

                <div className="vertical-separator"></div>

                {loading ? (
                    <div className="spinner-container">
                        <span className="spinner"></span>
                    </div>
                    ) : (
                <div className="product-sections">
                    <fieldset>
                        <div className="product-listings">
                            {listings.map((listing) => (
                                <div key={listing.id} className="product-card">
                                    <img
                                        src={listing.imageUrl}
                                        alt={listing.title}
                                        onClick={() => handleProductClick(listing.id)}
                                    />
                                    <h3 className="product-title">{listing.title}</h3>
                                    <p className="product-price">${listing.price}</p>
                                    <div className="product-rating">
                                        {listing.averageRating && listing.averageRating > 0 ? (
                                            <span>⭐ {listing.averageRating.toFixed(1)} ({listing.reviews?.length || 0} reviews)</span>
                                        ) : (
                                            <span>No reviews yet</span>
                                        )}
                                    </div>
                                    <div className="product-card-buttons-container">
                                        <button onClick={() => addToCart(listing.id)} title="Add to Cart">
                                            <FontAwesomeIcon icon={faCartShopping} />
                                        </button>
                                        <button onClick={() => toggleWishlist(listing.id)} title="Add to Wishlist">
                                            <FontAwesomeIcon
                                                icon={props.wishlistProductIds.includes(listing.id) ? solidHeart : regularHeart}
                                                style={{ color: props.wishlistProductIds.includes(listing.id) ? 'red' : 'black' }}
                                            />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </fieldset>
                </div>
                )}
            </div>
        </div>
    );
}

export default HomePage;
