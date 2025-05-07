import React, {useCallback, useEffect} from 'react';
import './HomePage.css';

function HomePage({ cartProductIds, setCartProductIds, wishlistProductIds, setWishlistProductIds }) {
    const [categories, setCategories] = React.useState([]);
    const [listings, setListings] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [priceRange, setPriceRange] = React.useState([0, 9999]);
    const [priceSort, setPriceSort] = React.useState('none'); // 'asc', 'desc' or 'none'
    const [reviewSort, setReviewSort] = React.useState('none'); // 'most', 'least' or 'none'

    const fetchListings = useCallback(() => {
        let data = null;

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
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Search query:', searchQuery);
        fetchListings();
    };

    const handlePriceChange = (e, index) => {
        const newRange = [...priceRange];
        newRange[index] = parseFloat(e.target.value);
        setPriceRange(newRange);
    };

    const addToCart = (id) => {
        setCartProductIds((prev) => [...new Set([...prev, id])]);
    };

    const addToWishlist = (id) => {
        setWishlistProductIds((prev) => [...new Set([...prev, id])]);
    };

    const toggleSortOrder = (type) => {
        if (type === 'price') {
            setPriceSort((prevOrder) => {
                if (prevOrder === 'none') return 'asc';
                if (prevOrder === 'asc') return 'desc';
                return 'none';
            });
        } else if (type === 'review') {
            setReviewSort((prevOrder) => {
                if (prevOrder === 'none') return 'most';
                if (prevOrder === 'most') return 'least';
                return 'none';
            });
        }
    };

    return (
        <div className="HomePage">
            <form className="search-bar" onSubmit={handleSearch}>
                <select className="category-dropdown">
                    <option value=""> All </option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
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

            {/* Price Range and Sort Controls */}
            <div className="filter-container">
                <div className="price-range">
                    <label>Price Range: </label>
                    <input
                        type="number"
                        value={priceRange[0]}
                        min="0"
                        onChange={(e) => handlePriceChange(e, 0)}
                    />
                    <span> - </span>
                    <input
                        type="number"
                        value={priceRange[1]}
                        min="0"
                        onChange={(e) => handlePriceChange(e, 1)}
                    />
                </div>
                <div className="sort-by">
                    <span>Sort by:</span>
                    <button type="button" onClick={() => toggleSortOrder('price')}>
                        {priceSort === 'asc' ? 'Lowest Price' : priceSort === 'desc' ? 'Highest Price' : 'No Price Sorting'}
                    </button>
                    <button type="button" onClick={() => toggleSortOrder('review')}>
                        {reviewSort === 'most' ? 'Most Reviews' : reviewSort === 'least' ? 'Least Reviews' : 'No Review Sorting'}
                    </button>
                </div>
            </div>

            <div className="product-sections">
                <fieldset>
                    <legend>Listings</legend>
                    <div className="product-listings">
                        {listings.map((listing) => (
                            <div key={listing.id} className="product-card">
                                <img
                                    src={listing.imageUrl}
                                    alt={listing.title}
                                    className="product-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/200x200?text=Image+Not+Found';
                                    }}
                                />
                                <h3 className="product-title">{listing.title}</h3>
                                <p className="product-price">${listing.price}</p>
                                <button onClick={() => addToCart(listing.id)}>Add to Cart</button>
                                <button onClick={() => addToWishlist(listing.id)}>Add to Wishlist</button>
                            </div>
                        ))}
                    </div>
                </fieldset>
            </div>
        </div>
    );
}

export default HomePage;

