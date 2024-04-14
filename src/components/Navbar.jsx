import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Import your CSS file for styling
import logoImg from './blabber.png';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, signOut } from 'firebase/auth';

function Navbar() {
    const auth = getAuth();
    const [user] = useAuthState(auth); // Get the user's authentication state
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleSignOut = () => {
        signOut(auth)
        .then(() => {
            // Sign-out successful.
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

                {user ? ( // If user is signed in
                <>
                    <div className="account-button" onClick={toggleDropdown}>
                        <span>Account</span> {/* Link to Account page */}
                        {dropdownOpen && (
                            <div className="dropdown-content">
                                <Link to="/account">Account Overview</Link>
                                <button onClick={handleSignOut}>Sign Out</button>
                            </div>
                        )}
                    </div>
                </>
                ) : ( // If user is not signed in
                <div className="login-signup-button">
                    <Link to="/login-signup">Login/Sign Up</Link> {/* Link to Login page */}
                </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
