import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiStar } from "react-icons/fi";
import { useProductStore } from "../../store/useProduct";
import { useAuthStore } from "../../store/useAuth";
import { awardCoins } from '../../utils/gamificationUtils';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const { addReview, reviewLoading, reviewError, clearReviewError } =
    useProductStore();
  const { isAuthenticated } = useAuthStore();
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please log in to write a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    clearReviewError();

    const reviewData = {
      rating: rating,
      comment: comment.trim(),
    };

    const result = await addReview(productId, reviewData);
    if (result.success) {
      await awardCoins('review');

      // Reset form
      setRating(0);
      setComment("");

      // Call parent callback if provided
      if (onReviewSubmitted) {
        onReviewSubmitted(result.data);
      }

      toast.success("Review submitted successfully!");
    } else {
      // Show error toast if the API call failed
      toast.error(result.error || "Failed to submit review. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600 mb-4">Please log in to write a review</p>
        <button className="text-brand-primary hover:text-brand-primary-hover font-medium">
          Log In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

      {reviewError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {reviewError}
        </div>
      )}

      {/* Rating Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              <FiStar
                className={`w-6 h-6 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-gray-600 mt-1">{rating} out of 5 stars</p>
        )}
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          maxLength={1000}
        />
        <p className="text-sm text-gray-500 mt-1">
          {comment.length}/1000 characters
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={reviewLoading || rating === 0}
        className="w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {reviewLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Submitting...
          </div>
        ) : (
          "Submit Review"
        )}
      </button>
    </form>
  );
};

export default ReviewForm;
