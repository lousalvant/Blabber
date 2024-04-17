import React from 'react';
import './Post.css';

function Post({ post }) {
  // Parse the ISO 8601 date string into a Date object
  const createdAtDate = new Date(post.createdAt);

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

  return (
    <div className='post-info-container'>
      <p className='post-info'>Posted {timePosted}</p>
      {post.user && (
        <div className='user-info'>
          {post.user.profileImageUrl && (
            <img src={post.user.profileImageUrl} alt="Profile" style={{ width: '50px', height: '50px', borderRadius: '50%' }} className='profile-picture' />
          )}
          <p className='display-name'>{post.displayName}</p>
        </div>
      )}
      <h2 className='post-title'>{post.title}</h2>
      <p className='post-info'>{post.upvoteCount} 👍</p>
    </div>
  );
}

export default Post;
