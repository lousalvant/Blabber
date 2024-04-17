import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Post from '../components/Post';
import { getStorage, ref, getDownloadURL } from 'firebase/storage'; // Import storage functions
import './PostDetails.css';

function PostDetails() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [userId, setUserId] = useState(null); // State to hold the user ID
  const storage = getStorage();

  // Fetch the current user's ID when the component mounts
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe(); // Cleanup function
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          const postData = postDoc.data();
          if (postData.userId) {
            const userSnapshot = await getDoc(doc(db, 'users', postData.userId));
            const userData = userSnapshot.data();
    
            // Ensure displayName field is included in userData
            const { displayName } = userData || {}; // Destructure displayName if userData exists
    
            // Get download URL for profile picture
            const profileImageRef = ref(storage, `profilePictures/${postData.userId}`);
            const profileImageUrl = await getDownloadURL(profileImageRef);
    
            setPost({
              id: postDoc.id,
              ...postData,
              user: { ...userData, displayName, profileImageUrl }
            });
          } else {
            // If userId is not available
            setPost({ id: postDoc.id, ...postData });
          }
    
          // Set upvote count if upvotes array exists
          if (postData.upvotes) {
            setUpvoteCount(postData.upvotes.length);
          }
    
          // Check if current user has upvoted
          if (userId && postData.upvotes && postData.upvotes.includes(userId)) {
            setUpvoted(true);
          }
        } else {
          console.error('Post not found');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(error.message);
      }
    };
    

    fetchPost();
  }, [postId, storage, userId]);

  const handleUpvote = async () => {
    try {
      const postRef = doc(db, 'posts', postId);
      if (!userId) {
        // If user is not authenticated, show an alert or redirect to login page
        alert('Please log in to upvote this post.');
        return;
      }
      if (upvoted) {
        // Remove user's upvote
        await updateDoc(postRef, {
          upvotes: arrayRemove(userId)
        });
        setUpvoted(false);
        setUpvoteCount(prevCount => prevCount - 1);
      } else {
        // Add user's upvote
        await updateDoc(postRef, {
          upvotes: arrayUnion(userId)
        });
        setUpvoted(true);
        setUpvoteCount(prevCount => prevCount + 1);
      }
    } catch (error) {
      console.error('Error updating upvote:', error);
    }
  };

  const renderMedia = () => {
    if (!post) return null;
  
    const mediaElements = [];
  
    if (post.imageUrl) {
      mediaElements.push(<img key="image" src={post.imageUrl} alt="Post" style={{ maxWidth: '500px', height: 'auto' }} />);
    }
  
    if (post.youtubeUrl) {
      const videoId = post.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)[1];
      mediaElements.push(
        <iframe
          key="video"
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
  
    return mediaElements;
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      console.log('Post deleted successfully');
      // Set success message
      alert('Post deleted successfully!');
      // Redirect user to the home page
      window.location = '/';
    } catch (error) {
      console.error('Error deleting post:', error);
      // Set error message
      alert('Error deleting post. Please try again.');
    }
  };

  return (
    <div className='post-details-container'>
      {error && <p>Error fetching post: {error}</p>}
      {post && (
        <div className='post-details-box'>
          <Post post={post} />
          <p>{post.content}</p>
          {renderMedia()}
          <div className='button-container'>
            <button onClick={handleUpvote} className={`upvote-button ${upvoted ? 'upvoted' : ''}`}>
              👍
            </button>
            <span className='upvote-count'>{upvoteCount} Likes</span>
            <Link to={`/editpost/${post.id}`}>
              <button>✏️</button>
            </Link>
            <button onClick={handleDelete}>❌</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostDetails;
