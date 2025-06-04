import React, { useEffect, useState } from 'react';
import './Wishlist.css';
import { useUser } from "../../contexts/UserContext";

function Wishlist(props) {
    const { user } = useUser();
    const [wishlistItems, setWishlistItems] = useState([]);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_BASE_URL + '/api/wishlists', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch wishlist');
                }

                const data = await response.json();
                const listingsWithImages = await Promise.all(
                    data.listings.map(async (listing) => {
                        if (listing.photos && listing.photos.length > 0) {
                            const photoId = listing.photos[0].id;
                            try {
                                console.log('Fetching photo for listing:', listing.id);
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
                        // Fallback image if no photos are available
                        return { ...listing, imageUrl: 'https://placehold.co/400' };
                    })
                );

                setWishlistItems(listingsWithImages);
            } catch (error) {
                console.error('Error fetching wishlist:', error);
            }
        };

        if (user?.token) {
            fetchWishlist();
        }
    }, [user]);


    const handleAddToCart = async (productId) => {
        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${productId}/shopping-cart`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to add item to cart');
            }

            props.setCartProductIds((prevProducts) => [...prevProducts, productId]);
            props.setProductIds((prevProducts) => prevProducts.filter((id) => id !== productId));
            setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId));
            props.showNotification('Item added to cart');
        } catch (error) {
            console.error('Error adding item to cart:', error);
            props.showNotification('Failed to add item to cart');
        }
    };

    const handleRemoveFromWishlist = async (productId) => {
        try {
            const response = await fetch(process.env.REACT_APP_BASE_URL + `/api/listings/${productId}/wishlist`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to remove item from wishlist');
            }

            props.setProductIds((prevProducts) => prevProducts.filter((id) => id !== productId));
            setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId));
            props.showNotification('Item removed from wishlist');
        } catch (error) {
            console.error('Error removing item from wishlist:', error);
            props.showNotification('Failed to remove item from wishlist');
        }
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
        </div>
    );
}

export default Wishlist;
