import React, { useState, useEffect } from 'react';
import './Cart.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../../contexts/UserContext'; // Assuming you have this

const Cart = ({ productIds, setProductIds }) => {
    const { user } = useUser();

    // Save full listing objects here
    const [listings, setListings] = useState([]);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/shopping-carts', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to load cart');

                const data = await response.json();

                // Fetch first photo for each listing, convert to base64 url
                const listingsWithImages = await Promise.all(
                    data.listings.map(async (listing) => {
                        if (listing.photos && listing.photos.length > 0) {
                            const photoId = listing.photos[0].id;
                            try {
                                const photoResponse = await fetch(`http://localhost:8080/api/photo/listing/${photoId}`, {
                                    headers: {
                                        'Authorization': `Bearer ${user.token}`,
                                    },
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
                        // fallback image if no photos
                        return { ...listing, imageUrl: 'https://placehold.co/400' };
                    })
                );

                setListings(listingsWithImages);
                setProductIds(listingsWithImages.map(item => item.id));
            } catch (error) {
                console.error('Error loading cart:', error);
            }
        };

        fetchCart();
    }, [user.token, setProductIds]);


    // Compute total price from listings, not mockData
    const total = listings.reduce((sum, item) => sum + item.price, 0).toFixed(2);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const totalPages = Math.ceil(listings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = listings.slice(startIndex, startIndex + itemsPerPage);

    const handleRemoveFromCart = async (id) => {
        try {
            const response = await fetch(`http://localhost:8080/api/listings/${id}/shopping-cart`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to remove item from cart');

            // Remove from listings and productIds locally
            setListings((prev) => prev.filter(item => item.id !== id));
            setProductIds((prev) => prev.filter(itemId => itemId !== id));
        } catch (error) {
            console.error(`Error removing item ${id} from cart:`, error);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="cart-container">
            <h2>Your Cart ({listings.length} items)</h2>
            <div className="cart-content">
                <div className="cart-items">
                    {currentItems.map((item) => (
                        <div key={item.id} className="cart-item">
                            <img src={item.imageUrl} alt={item.title} className="item-image" />
                            <div className="item-details">
                                <h3>{item.title}</h3>
                                {item.description && <p className="item-desc">{item.description}</p>}
                                <div className="item-meta">
                                    <span>${item.price.toFixed(2)}</span>
                                </div>
                            </div>
                            <button
                                className="remove-btn"
                                onClick={() => handleRemoveFromCart(item.id)}
                                title="Remove from Cart">
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <h2>Summary</h2>
                    <p>Total Items: {listings.length}</p>
                    <p>Total Price: ${total}</p>
                    <button className="checkout-button">Checkout</button>
                </div>
            </div>

            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                        onClick={() => handlePageChange(index + 1)}>
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Cart;
