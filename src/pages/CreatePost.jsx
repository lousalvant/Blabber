import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './CreatePost.css';

function CreatePost() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const navigate = useNavigate(); // Initialize useNavigate hook

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add a new document with auto-generated ID to a "posts" collection
      const docRef = await addDoc(collection(db, 'posts'), {
        title,
        content,
        imageUrl,
        youtubeUrl
      });
      console.log('Document written with ID: ', docRef.id);
      // Clear form fields after submission
      setTitle('');
      setContent('');
      setImageUrl('');
      setYoutubeUrl('');
      alert('Post successfully created!');
      // Redirect to home page after 2 seconds
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
    return null; // or render a loading spinner
  }

  if (!user) {
    alert('Please log in to create a post!');
    navigate('/login'); // Use navigate function to redirect
    return null; // Return null to prevent rendering while redirecting
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
          <label htmlFor="imageUrl">Image URL:</label>
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CreatePost;
