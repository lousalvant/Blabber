import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes } from 'firebase/storage'; // Import storage functions
import Navbar from '../components/Navbar';
import firebaseApp from '../firebaseConfig';
import './Signup.css';

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null); // State for profile picture
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth(firebaseApp);
  const storage = getStorage(firebaseApp);
  const [previewImage, setPreviewImage] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Upload profile picture if selected
      if (profilePicture) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, profilePicture);
      }

      // Update user's display name with the username
      await updateProfile(user, {
        displayName: username
      });

      // Display success message
      alert(`Account successfully created! Hello, ${username}!`);

      // Log user information to the console
      console.log(`User signed in: ${user.displayName} (${user.email})`);

      // Redirect to home page
      navigate('/');

    } catch (error) {
      setError(error.message);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };  

  return (
    <div>
      <Navbar />
      <div className="signup-container">
        <div className="signup-box">
          <h2>Sign Up</h2>
          <div className="content">
            {error && <div>{error}</div>}
            <form onSubmit={handleSignUp}>
              <input
                type="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className='input-field'
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='input-field'
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className='input-field'
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className='input-field'
              />
              <h4>Choose a profile picture!</h4>
              <div className='file-input-container'>
                
                <input type="file" onChange={handleImageChange} accept="image/*" /> {/* File input for profile picture */}
                {previewImage && <img src={previewImage} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px'}} />}
              </div>
              <div className="signup-button-container">
                <button type="submit">Sign Up</button>
              </div>
            </form>
            <p>Already have an account? <Link to="/login">Log in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
