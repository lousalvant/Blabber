import React from 'react';

function Post({ post }) {
  return (
    <div>
      <h2>{post.title}</h2>
      <p>Date posted: {post.createdAt}</p>
      {/* Add additional fields as needed, e.g., content, imageUrl, etc. */}
    </div>
  );
}

export default Post;
