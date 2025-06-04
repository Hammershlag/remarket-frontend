import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import './Navbar.css';
import {useUser} from "../../contexts/UserContext";

function Navbar({ theme }) {
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const handleWishlistClick = () => {
        if (user) {
            navigate('/wishlist');
        } else {
            navigate('/login');
        }
    };

    const handleCartClick = () => {
        if (user) {
            navigate('/cart');
        } else {
            navigate('/login');
        }
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className={`Navbar ${theme}`}>
            <div className="logo">
                <Link to="/">Logo</Link>
            </div>

            <ul className="nav-links">
                <li>
                    <button className="nav-button" onClick={handleWishlistClick}>Wishlist</button>
                </li>
                <li>
                    <button className="nav-button" onClick={handleCartClick}>Cart</button>
                </li>

                {['admin', 'stuff'].includes(user?.role?.toLowerCase()) ? (
                    <li className="dropdown">
                        <button className="nav-button dropbtn">Accounts ⮟</button>
                        <div className="dropdown-content">
                            <Link to="/account">My Account</Link>
                            <Link to="/stuff/statistics/users">Statistics</Link>
                            <Link to="/stuff/flagging/listings">Flagged Listings</Link>
                            <Link to="/stuff/flagging/reviews">Flagged Reviews</Link>
                            {user?.role?.toLowerCase() === 'admin' && (
                                <Link to="/admin/users">All Accounts</Link>
                                )}

                        </div>
                    </li>
                ) : (
                    <li>
                        <button className="nav-button" onClick={() => navigate(user ? '/account' : '/login')}>
                            Account
                        </button>
                    </li>
                )}



                {user && (
                    <>
                        <li>
                            <button className="nav-button" onClick={() => navigate('/orders')}>Orders</button>
                        </li>
                        <li>
                            <button className="nav-button" onClick={handleLogoutClick}>Sign out</button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}
export default Navbar;