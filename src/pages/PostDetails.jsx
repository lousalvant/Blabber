// pages/PostDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './PostDetails.css';

function PostDetails() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          setPost({ id: postDoc.id, ...postDoc.data() });
        } else {
          console.error('Post not found');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [postId]);

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
      {post && (
        <div className='post-details-box'>
          <h1>{post.title}</h1>
          <p>{post.content}</p>
          {renderMedia()}
          <div className='button-container'>
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
