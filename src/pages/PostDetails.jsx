// pages/PostDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

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

    if (post.imageUrl) {
      return <img src={post.imageUrl} alt="Post" style={{ maxWidth: '500px', height: 'auto' }} />;
    } else if (post.youtubeUrl) {
      const videoId = post.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)[1];
      return (
        <iframe
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
    <div>
      <h2>Post Details</h2>
      {post && (
        <div>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          {renderMedia()}
          <Link to={`/editpost/${post.id}`}>
            <button>Edit</button>
          </Link>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>
  );
}

export default PostDetails;
