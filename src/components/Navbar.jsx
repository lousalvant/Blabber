import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Import your CSS file for styling
import logoImg from '../assets/blabber.png';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, signOut } from 'firebase/auth';

function Navbar() {
    const auth = getAuth();
    const [user] = useAuthState(auth); // Get the user's authentication state
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    // Log authentication status
    useEffect(() => {
        console.log(user ? 'User is signed in' : 'User is signed out');
    }, [user]);

    const handleSignOut = () => {
        signOut(auth)
        .then(() => {
            // Sign-out successful.
            navigate('/login');
        })
        .catch((error) => {
            // An error happened.
        });
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <img src={logoImg} alt="Your App Logo" />
            </div>
            <div className="search-bar">
                <input type="text" placeholder="Search..." />
                <button>🔍</button> {/* Search button with the magnifying glass emoji */}
            </div>
            <div className="auth-buttons">
                <div className='home-button'>
                    <Link to="/">Home</Link>
                </div>

                <div className="account-button" onClick={toggleDropdown}>
                    <span>{user ? 'Account' : 'Account'}</span> {/* Link to Account page */}
                    {dropdownOpen && (
                        <div className="dropdown-content">
                            {user ? (
                                <>
                                    <Link to="/account">Account Overview</Link>
                                    <button onClick={handleSignOut}>Sign Out</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login">Login</Link>
                                    <Link to="/signup">Sign up</Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
