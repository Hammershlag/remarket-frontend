import React, {useCallback, useEffect, useState} from 'react';
import './HomePage.css';
import '../../App.css';
import mockData from '../../data/mockdata.json';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState([1, 10000]);
    const [priceSort, setPriceSort] = useState('none');
    const [reviewSort, setReviewSort] = useState('none');

    const applyFilters = () => {
        fetchListings();
    }

    const fetchListings = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8080/api/listings");
            if (!response.ok) {
                throw new Error("Failed to fetch listings");
            }

            // Pobierz dane z pola `content`
            const listingsData = (await response.json()).content;
            console.log('Fetched listings:', listingsData);

            // Fetch the first photo for each listing
            const listingsWithPhotos = await Promise.all(
                listingsData.map(async (listing) => {
                    if (listing.photos && listing.photos.length > 0) {
                        const photoId = listing.photos[0].id;
                        try {
                            console.log('Fetching photo for listing:', listing.id);
                            const photoResponse = await fetch(`http://localhost:8080/api/photo/listing/${photoId}`);
                            if (photoResponse.ok) {
                                const photoBase64 = await photoResponse.json();
                                const photoUrl = `data:image/jpeg;base64,${photoBase64.data}`;
                                return { ...listing, imageUrl: photoUrl };
                            }
                        } catch (error) {
                            console.error(`Failed to fetch photo for listing ${listing.id}:`, error);
                        }
                    }
                    // Fallback to a placeholder image if no photo is available
                    return { ...listing, imageUrl: 'https://via.placeholder.com/400x400' };
                })
            );

            setListings(listingsWithPhotos);
        } catch (error) {
            console.error("Error fetching listings:", error);
        }
    }, [priceRange, priceSort, reviewSort, searchQuery]);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/categories`);
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
        fetchListings();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchListings();
    };

    const handlePriceInputChange = (e) => {
        const [min, max] = e.target.value.split(',').map(Number);
        setPriceRange([min, max]);
    };

    const handlePriceSliderChange = (value, index) => {
        const newRange = [...priceRange];
        newRange[index] = Math.max(1, Math.min(10000, Number(value)));
        setPriceRange(newRange);
    };

    const addToCart = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/listings/${id}/shopping-cart`, {
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
            const response = await fetch(`http://localhost:8080/api/listings/${id}/wishlist`, {
                method: isInWishlist ? "DELETE" : "POST",
                headers: {
                    'Authorization': `Bearer ${user.token}`, // Użyj tokena użytkownika
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
                        <select className="category-dropdown">
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        <div className="filter-container">
                            <label>Price Range:</label>
                            <input
                                type="range"
                                min="1"
                                max="10000"
                                step="1"
                                value={priceRange[0]}
                                onChange={(e) => handlePriceSliderChange(e.target.value, 0)}
                            />
                            <input
                                type="range"
                                min="1"
                                max="10000"
                                step="1"
                                value={priceRange[1]}
                                onChange={(e) => handlePriceSliderChange(e.target.value, 1)}
                            />
                            <div className="price-inputs">
                                <span> $ </span>
                                <input
                                    type="number"
                                    min="1"
                                    max="10000"
                                    value={priceRange[0]}
                                    onChange={(e) => handlePriceInputChange(e.target.value)}
                                />
                                <span> - </span>
                                <input
                                    type="number"
                                    min="1"
                                    max="10000"
                                    value={priceRange[1]}
                                    onChange={(e) => handlePriceInputChange(e.target.value)}
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
                        </div>
                    </form>
                    <button className="apply-filters-btn" onClick={applyFilters}>
                        Apply
                    </button>
                </div>

                <div className="vertical-separator"></div>

                <div className="product-sections">
                    <fieldset>
                        <div className="product-listings">
                            {listings.map((listing) => (
                                <div key={listing.id} className="product-card" onClick={() => handleProductClick(listing.id)}>
                                    <img
                                        src={listing.imageUrl}
                                        alt={listing.title}
                                    />
                                    <h3 className="product-title">{listing.title}</h3>
                                    <p className="product-price">${listing.price}</p>
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
            </div>
        </div>
    );
}

export default HomePage;

