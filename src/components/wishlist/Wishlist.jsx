import React from 'react';
import './Wishlist.css';
import mockData from '../../data/mockdata.json';

function Wishlist(props) {
    const wishlistItems = mockData.filter((item) => props.productIds.includes(item.id));

    const handleAddToCart = (productId) => {
        if (!props.cartProductIds.includes(productId)) {
            props.setCartProductIds((prevProducts) => [...prevProducts, productId]);
            props.setProductIds((prevProducts) => prevProducts.filter((id) => id !== productId));
            props.showNotification('Item added to cart');
        } else {
            props.showNotification('Item already in cart!');
        }
    };

    const handleRemoveFromWishlist = (productId) => {
        props.setProductIds((prevProducts) => prevProducts.filter((id) => id !== productId));
        console.log(`Product ${productId} removed from wishlist`);
    };

    return (
        <div className="wishlist-container">
            <div className="wishlist-header">
                <div className="heart-icon">♡</div>
                <h1>My Wishlist</h1>
            </div>
            <table className="wishlist-table">
                <thead>
                <tr>
                    <th>Product Name</th>
                    <th>Unit Price</th>
                    <th>Date Added</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {wishlistItems.map((product) => (
                    <tr key={product.id}>
                        <td>
                            <div className="product-info">
                                <img
                                    src={product.imageUrl}
                                    alt={product.title}
                                    className="product-photo"
                                />
                                <span>{product.title}</span>
                            </div>
                        </td>
                        <td>${product.price.toFixed(2)}</td>
                        {/*<td>{product.status === 'ACTIVE' ? 'In stock' : 'Unavailable'}</td> */}
                        <td>
                            <div className="action-buttons">
                                <button
                                    className="add-to-cart-btn"
                                    onClick={() => handleAddToCart(product.id)}
                                >
                                    Add to Cart
                                </button>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveFromWishlist(product.id)}
                                >
                                    Remove from Wishlist
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            {props.notification && (
                <div className="notification-bubble">
                    {props.notification}
                </div>
            )}
        </div>
    );
}

export default Wishlist;