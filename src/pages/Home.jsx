import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Post from '../components/Post';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import loadingGif from '../assets/loading.gif';
import './Home.css';

function Home() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading status
  const [sortBy, setSortBy] = useState('newest');
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

            const { displayName } = userData || {};

            const profileImageRef = ref(storage, `profilePictures/${post.userId}`);
            const profileImageUrl = await getDownloadURL(profileImageRef);

            return { ...post, user: { ...userData, displayName, profileImageUrl } };
          } else {
            console.warn('User ID is undefined for post:', post);
            return post;
          }
        }));

        const updatedPosts = postData.map(post => {
          return { ...post, upvoteCount: new Set(post.upvotes).size };
        });

        const sortedPosts = sortPosts(updatedPosts, sortBy);

        setPosts(sortedPosts);
        setFilteredPosts(sortedPosts);
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError(error.message);
        setLoading(false); // Set loading to false if an error occurs
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

  const handleSortChange = (option) => {
    setSortBy(option);
  };

  const handleSearchInputChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(query)
    );
    setFilteredPosts(filtered);
  };

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
        <button onClick={handleSearch}>Search</button>
      </div>
      {loading ? ( // Conditionally render loading animation if loading is true
        <div className='loading-container'>
          <div className="loading-animation">
            <img src={loadingGif} alt="Loading..." />
          </div>
        </div>
      ) : (
        <>
          {error && <p>Error fetching posts: {error}</p>}
          {filteredPosts.map(post => (
            <div className='post-container' key={post.id}>
              <Link to={`/post/${post.id}`} className='Link'>
                <Post post={post} showUpvoteIcon={true} />
              </Link>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default Home;
