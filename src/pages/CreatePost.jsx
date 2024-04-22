import { useState, useEffect } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig'; // Import the storage instance
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './CreatePost.css';

function CreatePost() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState(''); // State to store the local image URL
  const [imageUrl, setImageUrl] = useState(''); // State to store the image URL provided by the user
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [imageFile, setImageFile] = useState(null); // State to store the uploaded image file
  const [secretKey, setSecretKey] = useState(''); // State to hold the secret key
  const auth = getAuth(); // Get the authentication instance
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    const localImageUrl = URL.createObjectURL(file);
    setLocalImageUrl(localImageUrl);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the current user UID and displayName
      const userId = user.uid;
      const displayName = user.displayName;
  
      // Get the current date and time
      const createdAt = new Date().toISOString();
  
      let downloadUrl = '';
      // Upload the image file to Firebase Storage if it exists
      if (imageFile) {
        const storageRef = ref(storage, `postImages/${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        downloadUrl = await getDownloadURL(snapshot.ref);
      }
  
      // Add a new document with auto-generated ID to a "posts" collection
      const docRef = await addDoc(collection(db, 'posts'), {
        userId,
        displayName,
        title,
        content,
        imageUrl: imageUrl || downloadUrl, // Use the provided image URL if available, otherwise use the download URL from Storage
        localImageUrl, // Include the local image URL
        youtubeUrl,
        createdAt,
        secretKey // Include the secret key in the post data
      });
  
      console.log('Document written with ID: ', docRef.id);
      setTitle('');
      setContent('');
      setLocalImageUrl('');
      setImageUrl('');
      setYoutubeUrl('');
      setImageFile(null); // Clear image file state
      setSecretKey(''); // Clear the secret key state
      alert('Post successfully created!');
      navigate('/');
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };
  

  // Extract video ID from YouTube URL
  const getVideoId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match && match[1];
  };

  // Handle changes in YouTube URL input
  const handleYoutubeUrlChange = (e) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    const id = getVideoId(url);
    setVideoId(id);
  };

  if (loading) {
    return null;
  }

  if (!user) {
    alert('Please log in to create a post!');
    navigate('/login');
    return null;
  }

  return (
    <div className="create-post-container">
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content:</label>
          <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="localImageUpload">Upload an image from device:</label>
          <input type="file" id="localImageUpload" accept="image/*" onChange={handleImageChange} />
          {localImageUrl && <img src={localImageUrl} alt="Local Post" style={{ maxWidth: '50%', marginTop: '10px' }} />}
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl">Upload an image by URL:</label>
          <input type="text" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          {imageUrl && <img src={imageUrl} alt="Post" style={{ maxWidth: '50%', marginTop: '10px' }} />}
        </div>
        <div className="form-group">
          <label htmlFor="youtubeUrl">YouTube URL:</label>
          <input type="text" id="youtubeUrl" value={youtubeUrl} onChange={handleYoutubeUrlChange} />
          {videoId && (
            <iframe
              width="50%"
              height="50%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ marginTop: '10px' }}
            />
          )}
        </div>
        <div className="form-group">
          <label htmlFor="secretKey">Secret Key:</label>
          <input type="password" id="secretKey" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} required />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CreatePost;
