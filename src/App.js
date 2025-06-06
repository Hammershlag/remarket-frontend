import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/navbar/Navbar';
import Cart from './components/cart/Cart';
import Wishlist from './components/wishlist/Wishlist';
import Account from './components/account/Account';
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import HomePage from "./components/home/HomePage";
import PrivateRoute from "./components/PrivateRoute";
import AdminUserList from './components/admin/user/AdminUser';
import { useUser } from './contexts/UserContext';
import Seller from "./components/seller/Seller";
import UserDetails from './components/account/UserDetails';
import ListingPage from "./components/listing-page/ListingPage";
import Orders from "./components/orders/Orders";
import OrderDetails from "./components/orders/OrderDetails";
import UserStatistics from "./components/stuff/userStatistics/UserStatistics";
import FlaggingListings from "./components/stuff/flagging/listings/FlaggingListings";
import FlaggingReviews from "./components/stuff/flagging/reviews/FlaggingReviews";
import AdminFlaggingListings from "./components/admin/listings/AdminFlaggingListings";
import AdminFlaggingReviews from "./components/admin/reviews/AdminFlaggingReviews";

function App() {
    const [theme, setTheme] = useState('light');
    const { user } = useUser();
    const [cartProductIds, setCartProductIds] = useState([]);
    const [wishlistProductIds, setWishlistProductIds] = useState([]);
    const [notification, setNotification] = useState(null);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000); // Fades away after 3 seconds
    };

    return (
        <Router>
            <div className={`App ${theme}`}>
                <Navbar theme={theme} />
                <button hidden onClick={toggleTheme}>
                    Toggle to {theme === 'light' ? 'Dark' : 'Light'} Mode
                </button>

                <Routes>
                    <Route path="/" element={<HomePage wishlistProductIds={wishlistProductIds}
                                                       setWishlistProductIds={setWishlistProductIds}
                                                       cartProductIds={cartProductIds}
                                                       setCartProductIds={setCartProductIds}
                                                       showNotification={showNotification}
                                                       notification={notification}/>} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/cart" element={<Cart productIds={cartProductIds} setProductIds={setCartProductIds} />} />
                    <Route path="/seller" element={<Seller/>} />

                    <Route path="/admin/users/view" element={<UserDetails />} />

                    <Route path="/stuff/statistics/users" element={<UserStatistics/>} />
                    <Route path="/stuff/flagging/listings" element={<FlaggingListings/>} />
                    <Route path="/stuff/flagging/reviews" element={<FlaggingReviews/>} />

                    <Route path="/admin/flagging/listings" element={<AdminFlaggingListings/>} />
                    <Route path="/admin/flagging/reviews" element={<AdminFlaggingReviews/>} />

                    <Route
                        path="/wishlist"
                        element={
                            <PrivateRoute>
                                <Wishlist
                                    productIds={wishlistProductIds}
                                    setProductIds={setWishlistProductIds}
                                    cartProductIds={cartProductIds}
                                    setCartProductIds={setCartProductIds}
                                    showNotification={showNotification}
                                    notification={notification}
                                />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/account"
                        element={
                            <PrivateRoute>
                                <Account />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/order-details" element={<OrderDetails />} />
                    <Route
                        path="/listing/:id"
                        element={
                            <ListingPage></ListingPage>
                        }/>
                    <Route path="/orders" element={
                        <Orders/>
                    }/>
                    <Route
                        path="/admin/users"
                        element={
                            user && (user.role === 'ADMIN' || user.role === 'STUFF') ? (
                                <PrivateRoute>
                                    <AdminUserList />
                                </PrivateRoute>
                            ) : (
                                <Navigate to="/not-authorized" />
                            )
                        }
                    />

                    <Route path="/not-authorized" element={<h2>Access Denied</h2>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;