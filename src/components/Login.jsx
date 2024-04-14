// Login.jsx
import React from 'react';
import Navbar from './Navbar';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import firebaseApp from '../firebaseConfig';
import './Login.css'

const provider = new GoogleAuthProvider();
const auth = getAuth(firebaseApp);

function Login() {
  const handleGoogleSignIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // Handle successful sign-in
        const user = result.user;
        console.log(user);
      })
      .catch((error) => {
        // Handle errors
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
      });
  };

  return (
    <div>
        <Navbar />
        <div className="login-container">
            <div className="login-content">
                <h1>Login/Sign Up</h1>
                <button onClick={handleGoogleSignIn}>Sign in with Google</button>
            </div>
        </div>
    </div>
  );
}

export default Login;
