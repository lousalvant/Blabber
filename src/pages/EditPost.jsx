import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './EditPost.css';

function EditPost() {
  const { postId } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [imageFile, setImageFile] = useState(null); // State to store the uploaded image file
  const [localImageUrl, setLocalImageUrl] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postDoc = await getDoc(doc(db, 'posts', postId));
        if (postDoc.exists()) {
          const postData = postDoc.data();
          setTitle(postData.title);
          setContent(postData.content);
          setLocalImageUrl(postData.imageUrl || '');
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
      // Upload the image file to Firebase Storage if it exists
      let downloadUrl = '';
      let newLocalImageUrl = ''; // Initialize new local image URL variable
  
      if (imageFile) {
        const storageRef = ref(storage, `postImages/${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        downloadUrl = await getDownloadURL(storageRef);
        newLocalImageUrl = URL.createObjectURL(imageFile); // Create new local image URL
      }
  
      // Update post data in Firestore
      await updateDoc(doc(db, 'posts', postId), {
        title,
        content,
        imageUrl: imageUrl || downloadUrl, // Use the existing image URL if available, otherwise use the newly uploaded URL
        localImageUrl: newLocalImageUrl, // Update localImageUrl field with the new local image URL
        youtubeUrl,
      });
  
      // Update localImageUrl state with the new blob URL
      setLocalImageUrl(newLocalImageUrl);
  
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

  const handleDelete = async () => {
    try {
      // Delete the post from the database
      await deleteDoc(doc(db, 'posts', postId));
      alert('Post deleted successfully');
      // Redirect user to an appropriate page, e.g., home page
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    const localImageUrl = URL.createObjectURL(file);
    setLocalImageUrl(localImageUrl);
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
          <label htmlFor="localImageUpload">Upload an image from device:</label>
          <input type="file" id="localImageUpload" accept="image/*" onChange={handleImageChange} />
          {localImageUrl && <img src={localImageUrl} alt="Local Post" style={{ maxWidth: '50%', marginTop: '10px' }} />}
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl">Upload an image by URL:</label>
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
        <div className="button-group">
          <button type="submit">Update</button>
          <button type="submit" onClick={handleDelete}>Delete</button>
        </div>
      </form>
    </div>
  );
}

export default EditPost;
