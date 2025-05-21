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
import AdminUserList from './components/account/AdminUser';
import { useUser } from './contexts/UserContext';
import Seller from "./components/seller/Seller";
import UserDetails from './components/account/UserDetails';


function App() {
    const [theme, setTheme] = useState('light');
    const { user } = useUser();
    const [cartProductIds, setCartProductIds] = useState([]);
    const [wishlistProductIds, setWishlistProductIds] = useState([]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    /*CHANGE THIS SHIT BECASE ITS ONLY FOR MOCKING ROLES*/
    const effectiveRole = user?.role || 'ADMIN';
    return (
        <Router>
            <div className={`App ${theme}`}>
                <Navbar theme={theme} />
                <button hidden onClick={toggleTheme}>
                    Toggle to {theme === 'light' ? 'Dark' : 'Light'} Mode
                </button>

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/cart" element={<Cart productIds={cartProductIds} setProductIds={setCartProductIds} />} />
                    <Route path="/seller" element={<Seller/>} />

                    <Route path="/admin/users/view" element={<UserDetails />} />


                    <Route
                        path="/wishlist"
                        element={
                            <PrivateRoute>
                                <Wishlist
                                    productIds={wishlistProductIds}
                                    setProductIds={setWishlistProductIds}
                                    setCartProductIds={setCartProductIds}
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
                    <Route
                        path="/admin/users"
                        element={
                        /*user && (user.role === 'admin' || user.role === 'stuff') ? (*/
                            user && (effectiveRole === 'ADMIN' || effectiveRole === 'STUFF') ? (
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