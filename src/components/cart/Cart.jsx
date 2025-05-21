import React, { useState } from 'react';
import './Cart.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import mockData from '../../data/mockdata.json';

const Cart = ({ productIds, setProductIds }) => {
    const cartItems = mockData.filter((item) => productIds.includes(item.id));
    const total = cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const totalPages = Math.ceil(cartItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = cartItems.slice(startIndex, startIndex + itemsPerPage);

    const handleRemoveFromCart = (id) => {
        setProductIds((prev) => prev.filter((itemId) => itemId !== id));
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="cart-container">
            <h2>Your Cart ({cartItems.length} items)</h2>
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
                    <p>Total Items: {cartItems.length}</p>
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