import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Post from '../components/Post';
import { getStorage, ref, getDownloadURL } from 'firebase/storage'; // Import storage functions
import './Home.css';

function Home() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // Track sorting option
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
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
        setFilteredPosts(sortedPosts); // Initialize filtered posts with sorted posts
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

// Function to handle search query change
const handleSearchInputChange = (event) => {
  const query = event.target.value.toLowerCase(); // Convert search query to lowercase for case-insensitive matching
  setSearchQuery(query); // Update search query state

  // Filter posts based on search query
  const filtered = posts.filter(post =>
    post.title.toLowerCase().includes(query)
  );
  setFilteredPosts(filtered); // Update filtered posts state
};


  // Function to handle search
  const handleSearch = () => {
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPosts(filtered);
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
      <div className='search-bar'>
        <input
          type='text'
          placeholder='Search by title...'
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
      </div>
      {error && <p>Error fetching posts: {error}</p>}
      {filteredPosts.map(post => (
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
