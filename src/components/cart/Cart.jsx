import React, { useState, useEffect } from 'react';
import './Cart.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../../contexts/UserContext';
import { loadStripe } from '@stripe/stripe-js';


const Cart = ({ productIds, setProductIds }) => {
    const { user } = useUser();
    const [listings, setListings] = useState([]);
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        paymentMethod: '',
        currency: '',
        shippingMethod: ''
    });
    const [formValid, setFormValid] = useState(false);
    const stripePromise = loadStripe('pk_test_51RM7EJPMnb62woSnMZkQNAKWxsxfP76hgvFQP4BmpgxJPZ2RYIYWh4aYetfifWwtE94JTWmG7lXsM1jWHln2IHyj00MSVlgg4x'); // Your public key

    const handleCheckout = async () => {
        try {
            const stripe = await stripePromise;

            const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/shopping-carts/checkout', {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Checkout failed: ${error}`);
            }

            const result = await response.json();
            const sessionId = result.id;

            await stripe.redirectToCheckout({ sessionId });

        } catch (error) {
            console.error('Checkout error:', error);
        }
    };



    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/shopping-carts', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to load cart');

                const data = await response.json();

                const listingsWithImages = await Promise.all(
                    data.listings.map(async (listing) => {
                        if (listing.photos && listing.photos.length > 0) {
                            const photoId = listing.photos[0].id;
                            try {
                                const photoResponse = await fetch(process.env.REACT_APP_BASE_URL + `/api/photo/listing/${photoId}`, {
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

        const isValid = Object.values(formData).every(val => val.trim() !== '');
        setFormValid(isValid);
    }, [user.token, setProductIds, formData]);


    const total = listings.reduce((sum, item) => sum + item.price, 0).toFixed(2);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const totalPages = Math.ceil(listings.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = listings.slice(startIndex, startIndex + itemsPerPage);

    const handleRemoveFromCart = async (id) => {
        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${id}/shopping-cart`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to remove item from cart');

            setListings((prev) => prev.filter(item => item.id !== id));
            setProductIds((prev) => prev.filter(itemId => itemId !== id));
        } catch (error) {
            console.error(`Error removing item ${id} from cart:`, error);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleFormInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                    <form className="shipping-form">
                        <h3>Shipping & Payment Details</h3>
                        <input type="text" placeholder="Street (e.g., 123 Main St)" name="street" value={formData.street} onChange={handleFormInputChange} required />
                        <input type="text" placeholder="City (e.g., New York)" name="city" value={formData.city} onChange={handleFormInputChange} required />
                        <input type="text" placeholder="State (e.g., NY)" name="state" value={formData.state} onChange={handleFormInputChange} required />
                        <input type="text" placeholder="Zip Code (e.g., 10001)" name="zipCode" value={formData.zipCode} onChange={handleFormInputChange} required />
                        <input type="text" placeholder="Country (e.g., USA)" name="country" value={formData.country} onChange={handleFormInputChange} required />

                        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleFormInputChange} required>
                            <option value="">Select Payment Method</option>
                            <option value="CREDIT_CARD">Credit Card</option>
                            <option value="BLIK">PayPal</option>
                        </select>

                        <select name="currency" value={formData.currency} onChange={handleFormInputChange} required>
                            <option value="">Select Payment Currency</option>
                            <option value="PLN">PLN</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                        </select>

                        <select name="shippingMethod" value={formData.shippingMethod} onChange={handleFormInputChange} required>
                            <option value="">Select Shipping Method</option>
                            <option value="STANDARD">Standard</option>
                            <option value="EXPRESS">Express</option>
                            <option value="OVERNIGHT">Overnight</option>
                        </select>
                    </form>
                    <button
                        className="checkout-button"
                        onClick={handleCheckout}
                        disabled={!formValid}
                        title={!formValid ? 'Please fill in all fields' : 'Ready to checkout'}>Checkout
                    </button>
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
