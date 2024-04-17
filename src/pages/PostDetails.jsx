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
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null); // State to hold the user object
  const storage = getStorage();

  // Fetch the current user when the component mounts
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set the user object in state
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

  // Function to handle posting a new comment
  const handlePostComment = async () => {
    try {
      if (!userId) {
        alert('Please log in to post a comment.');
        return;
      }
      
      if (newComment.trim() === '') {
        alert('Please enter a comment.');
        return;
      }
  
      const newCommentData = {
        text: newComment,
        userId: userId,
        userDisplayName: user.displayName, // Use user.displayName instead of user.displayName
        createdAt: new Date().toISOString()
      };
  
      // Add the new comment to the database
      await updateDoc(doc(db, 'posts', postId), {
        comments: arrayUnion(newCommentData)
      });
  
      // Update the comments state immediately with the new comment
      setComments([...comments, newCommentData]);
  
      // Clear the comment text box after posting
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Error posting comment. Please try again.');
    }
  };

  // Function to convert time difference to a more readable format for comments
  const getTimePosted = (createdAt) => {
    // Parse the ISO 8601 date string into a Date object
    const createdAtDate = new Date(createdAt);
  
    // Calculate the relative time
    const timeDifference = Date.now() - createdAtDate.getTime();
    let timePosted;
  
    if (timeDifference < 60000) { // Less than a minute
      timePosted = 'just now';
    } else if (timeDifference < 3600000) { // Less than an hour
      const minutes = Math.round(timeDifference / 60000);
      timePosted = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (timeDifference < 86400000) { // Less than a day
      const hours = Math.round(timeDifference / 3600000);
      timePosted = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else { // More than a day
      const days = Math.round(timeDifference / 86400000);
      timePosted = `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  
    return timePosted;
  };
  

  // Fetch comments when the component mounts
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          const postData = postDoc.data();
          setComments(postData.comments || []);
    
          // Fetch user details for each comment
          const commentsWithUserDetails = await Promise.all(
            postData.comments.map(async (comment) => {
              if (comment.userId) {
                console.log("Comment user ID:", comment.userId); // Add this line to log the user ID
                const userSnapshot = await getDoc(doc(db, 'users', comment.userId));
                if (userSnapshot.exists()) {
                  const userData = userSnapshot.data();
                  // Ensure displayName field is included in userData
                  const { displayName } = userData || {};
                  // Get profile image URL
                  const profileImageRef = ref(storage, `profilePictures/${comment.userId}`);
                  try {
                    const profileImageUrl = await getDownloadURL(profileImageRef);
                    return { ...comment, userDisplayName: displayName, profileImageUrl };
                  } catch (error) {
                    console.error("Error fetching profile image URL:", error);
                    // If there's an error fetching the profile image URL, return the comment without the image URL
                    return { ...comment, userDisplayName: displayName };
                  }
                }
              }
              return comment;
            })
          );
    
          // Update comments state with user details
          setComments(commentsWithUserDetails);
        } else {
          console.error('Post not found');
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    
    fetchComments();
  }, [postId]);
  
  return (
    <div className='post-details-container'>
      {error && <p>Error fetching post: {error}</p>}
      {post && (
        <div className='post-details-box'>
          <Post post={post} showUpvoteIcon={false} />
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
      <div className="comment-section">
        <h3>Comments</h3>
        <div className="comment-input">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows="4"
            cols="50"
          />
          <button onClick={handlePostComment}>Post Comment</button>
        </div>
        <div className="comments-list">
          {comments.slice().reverse().map((comment, index) => (
            <div key={index} className="comment">
              <p>Posted {getTimePosted(comment.createdAt)}</p>
              <p><b>{comment.userDisplayName}</b> says</p>
              <p>{comment.text}</p>
              {/* <p>profileImageUrl={comment.profileImageUrl}</p> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PostDetails;
