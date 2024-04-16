// pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Post from '../components/Post';

function Home() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'posts'));
        const postData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
          const post = { id: docSnapshot.id, ...docSnapshot.data() };
          if (post.userId) {
            const userSnapshot = await getDoc(doc(db, 'users', post.userId));
            const userData = userSnapshot.data();
            return { ...post, user: userData };
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
  }, []);

  return (
    <div>
      <h1>Home Page</h1>
      {error && <p>Error fetching posts: {error}</p>}
      {posts.map(post => (
        <div key={post.id}>
          <Link to={`/post/${post.id}`}>
            <Post post={post} /> {/* Pass each post as a prop to the Post component */}
          </Link>
        </div>
      ))}
    </div>
  );
}

export default Home;
