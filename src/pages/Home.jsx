import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Post from '../components/Post';
import { getStorage, ref, getDownloadURL } from 'firebase/storage'; // Import storage functions
import './Home.css';

function Home() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // Track sorting option
  const storage = getStorage();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'posts'));
        const postData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
          const post = { id: docSnapshot.id, ...docSnapshot.data() };
          if (post.userId) {
            const userSnapshot = await getDoc(doc(db, 'users', post.userId));
            const userData = userSnapshot.data();

            // Ensure displayName field is included in userData
            const { displayName } = userData || {}; // Destructure displayName if userData exists

            // Get download URL for profile picture
            const profileImageRef = ref(storage, `profilePictures/${post.userId}`);
            const profileImageUrl = await getDownloadURL(profileImageRef);

            return { ...post, user: { ...userData, displayName, profileImageUrl } };
          } else {
            console.warn('User ID is undefined for post:', post);
            // Fetching post without user data
            return post;
          }
        }));

        // Count unique upvoters for each post
        const updatedPosts = postData.map(post => {
          return { ...post, upvoteCount: new Set(post.upvotes).size };
        });

        // Sort posts based on sorting option
        const sortedPosts = sortPosts(updatedPosts, sortBy);

        setPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError(error.message);
      }
    };

    fetchPosts();
  }, [sortBy, storage]);

  // Function to sort posts based on selected option
  const sortPosts = (posts, sortBy) => {
    if (sortBy === 'newest') {
      return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'mostPopular') {
      return posts.sort((a, b) => b.upvoteCount - a.upvoteCount);
    }
    return posts;
  };

  // Function to handle sorting option change
  const handleSortChange = (option) => {
    setSortBy(option);
  };

  return (
    <div className='home-container'>
      <div className='sort-options'>
        <span>Sort by:</span>
        <button
          className={sortBy === 'newest' ? 'active' : ''}
          onClick={() => handleSortChange('newest')}
        >
          Newest
        </button>
        <button
          className={sortBy === 'mostPopular' ? 'active' : ''}
          onClick={() => handleSortChange('mostPopular')}
        >
          Most Popular
        </button>
      </div>
      {error && <p>Error fetching posts: {error}</p>}
      {posts.map(post => (
        <div className='post-container' key={post.id}>
          <Link to={`/post/${post.id}`} className='Link'>
            <Post post={post} /> {/* Pass each post as a prop to the Post component */}
          </Link>
        </div>
      ))}
    </div>
  );
}

export default Home;
