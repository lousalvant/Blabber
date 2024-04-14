import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Import your CSS file for styling
import logoImg from './blabber.png';

function Navbar() {
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
                <div className='login-signup-button'>
                    <Link to="/login-signup">Login/Sign Up</Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
