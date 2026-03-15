import React, { useState, useEffect, useCallback } from 'react';
import API from '../api';

const ReviewSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  const loadReviews = useCallback(() => {
    if (!productId) return;
    API.get(`/reviews/${productId}`).then(({ data }) => setReviews(data)).catch(err => console.error(err));
  }, [productId]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!localStorage.getItem('token')) {
        alert("Please login to submit a review");
        return;
      }
      await API.post('/reviews/add', { productId, rating, comment });
      setComment('');
      loadReviews(); // Refresh the list
    } catch (err) {
      alert("Failed to submit review. Make sure you are logged in.");
    }
  };

  return (
    <div className="mt-10">
      <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
      
      {/* Review Submission Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded bg-gray-50">
        <textarea 
          className="w-full p-2 border rounded mb-2" 
          placeholder="Write your feedback..." 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        <select value={rating} onChange={(e) => setRating(e.target.value)} className="mr-4 p-2 border rounded">
          {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit Review</button>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div key={rev._id} className="p-4 border-b">
            <div className="flex justify-between">
              <span className="font-semibold">{rev.userName}</span>
              <span className="text-yellow-500">{"★".repeat(rev.rating)}</span>
            </div>
            <p className="text-gray-700">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
