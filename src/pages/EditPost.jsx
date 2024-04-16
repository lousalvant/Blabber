import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './EditPost.css';

function EditPost() {
  const { postId } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          const postData = postDoc.data();
          setTitle(postData.title);
          setContent(postData.content);
          setImageUrl(postData.imageUrl || '');
          setYoutubeUrl(postData.youtubeUrl || '');
          setVideoId(getVideoId(postData.youtubeUrl));
        } else {
          console.error('Post not found');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [postId]);

  const getVideoId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match && match[1];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'posts', postId), {
        title,
        content,
        imageUrl,
        youtubeUrl,
      });
      alert('Post updated successfully');
      // Redirect user to post details page or another appropriate page
      window.location.href = `/post/${postId}`;
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleYoutubeUrlChange = (e) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    const id = getVideoId(url);
    setVideoId(id);
  };

  return (
    <div className="edit-post-container">
      <h2>Edit Post</h2>
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
        <button type="submit">Update</button>
      </form>
    </div>
  );
}

export default EditPost;
