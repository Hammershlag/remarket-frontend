import React, {useCallback, useEffect, useState} from 'react';
import './HomePage.css';
import mockData from '../../data/mockdata.json';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';

function HomePage(props) {
    const [categories, setCategories] = useState([]);
    const [listings, setListings] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState([1, 10000]);
    const [priceSort, setPriceSort] = useState('none');
    const [reviewSort, setReviewSort] = useState('none');

    const fetchListings = useCallback(() => {
        let data = mockData;

        data = data.filter(
            (item) =>
                item.price >= priceRange[0] &&
                item.price <= priceRange[1] &&
                item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (priceSort === 'asc') {
            data.sort((a, b) => a.price - b.price);
        } else if (priceSort === 'desc') {
            data.sort((a, b) => b.price - a.price);
        }

        if (reviewSort === 'most') {
            data.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        } else if (reviewSort === 'least') {
            data.sort((a, b) => (a.reviewCount || 0) - (b.reviewCount || 0));
        }

        setListings(data);
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
    }, [fetchListings]);

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

    const addToCart = (id) => {
        props.setCartProductIds((prev) => [...new Set([...prev, id])]);
    };

    const toggleWishlist = (id) => {
        props.setWishlistProductIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };


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
                </div>

                <div className="vertical-separator"></div>

                <div className="product-sections">
                    <fieldset>
                        <div className="product-listings">
                            {listings.map((listing) => (
                                <div key={listing.id} className="product-card">
                                    <img
                                        src={listing.imageUrl}
                                        alt={listing.title}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                                        }}
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

