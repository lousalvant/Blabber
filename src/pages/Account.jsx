import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import firebaseApp from '../firebaseConfig'; // Import your firebaseConfig file
import './Account.css';

function Account() {
  const [user, setUser] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const auth = getAuth(firebaseApp); // Pass firebaseApp to getAuth
  const storage = getStorage(firebaseApp); // Pass firebaseApp to getStorage

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Get profile image URL
        const profileImageRef = ref(storage, `profilePictures/${currentUser.uid}`);
        getDownloadURL(profileImageRef)
          .then((url) => {
            setProfileImageUrl(url);
          })
          .catch((error) => {
            // Handle error
            console.error('Error getting profile image URL:', error);
          });
      } else {
        setUser(null);
        setProfileImageUrl(null);
      }
    });

    return () => unsubscribe();
  }, [auth, storage]);

  return (
    <div className="container">
      <h1>Account Overview</h1>
      {user ? (
        <div className='user-info'>
          {profileImageUrl && (
            <img src={profileImageUrl} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
          )}
          <p>Username: {user.displayName}</p>
          <p>Email: {user.email}</p>
        </div>
      ) : (
        <p>Please sign in to view your account information.</p>
      )}
    </div>
  );
}

export default Account;
