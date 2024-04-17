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
        setPosts(postData);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError(error.message);
      }
    };

    fetchPosts();
  }, [storage]);

  return (
    <div className='home-container'>
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
