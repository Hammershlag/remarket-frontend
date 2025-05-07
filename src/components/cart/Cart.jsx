import React from 'react';
import './Cart.css';

const Cart = ({ productIds, setProductIds }) => {
    const cartItems = null; //mockData.filter((item) => productIds.includes(item.id));
    const total = cartItems.reduce((sum, item) => sum + item.price, 0).toFixed(2);

    return (
        <div className="cart-container">
            <h2>Your Cart ({cartItems.length} items)</h2>
            <div className="cart-items">
                {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                        <img src={item.imageUrl} alt={item.title} className="item-image" />
                        <div className="item-details">
                            <h3>{item.title}</h3>
                            {item.description && <p className="item-desc">{item.description}</p>}
                            <div className="item-meta">
                                <span>${item.price.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="cart-footer">
                <div className="total-price">Total: ${total}</div>
                <button className="checkout-button">Check out</button>
            </div>
        </div>
    );
};

export default Cart;