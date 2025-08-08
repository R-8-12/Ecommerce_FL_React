import React, { useState } from "react";
import toast from "react-hot-toast";
import { FiStar, FiUpload, FiX, FiImage, FiVideo, FiTrash2 } from "react-icons/fi";
import { useProductStore } from "../../store/useProduct";
import { useAuthStore } from "../../store/useAuth";
import { awardCoins } from '../../utils/gamificationUtils';
import Button from "../ui/Button";

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
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

    if (!title.trim()) {
      toast.error("Please enter a review title");
      return;
    }

    clearReviewError();

    // For now, we'll send the basic review data that the backend expects
    // Media upload functionality can be added later when backend supports it
    const reviewData = {
      rating: rating,
      title: title.trim(),
      comment: comment.trim(),
    };

    const result = await addReview(productId, reviewData);
    if (result.success) {
      await awardCoins('review');

      // Reset form
      setRating(0);
      setTitle("");
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
    <div 
      className="p-6 rounded-lg border-2"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-primary)',
        borderRadius: 'var(--rounded-lg)',
        boxShadow: 'var(--shadow-medium)'
      }}
    >
      <form onSubmit={handleSubmit}>
        <h3 
          className="text-xl font-semibold mb-6 flex items-center"
          style={{ color: 'var(--text-primary)' }}
        >
          <FiStar className="mr-2" style={{ color: 'var(--brand-primary)' }} />
          Write a Review
        </h3>

        {reviewError && (
          <div 
            className="border px-4 py-3 rounded mb-4"
            style={{
              backgroundColor: 'var(--error-bg)',
              borderColor: 'var(--error-border)',
              color: 'var(--error-text)'
            }}
          >
            {reviewError}
          </div>
        )}

        {/* Rating Selection */}
        <div className="mb-6">
          <label 
            className="block text-sm font-medium mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Rating *
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <FiStar
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p 
              className="text-sm mt-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {rating} out of 5 stars
            </p>
          )}
        </div>

        {/* Review Title */}
        <div className="mb-6">
          <label 
            className="block text-sm font-medium mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Review Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your review in a few words..."
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              focusRingColor: 'var(--brand-primary)'
            }}
            maxLength={100}
          />
          <p 
            className="text-sm mt-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {title.length}/100 characters
          </p>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label 
            className="block text-sm font-medium mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your detailed thoughts about this product..."
            rows={4}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              focusRingColor: 'var(--brand-primary)'
            }}
            maxLength={1000}
          />
          <p 
            className="text-sm mt-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {comment.length}/1000 characters
          </p>
        </div>

        {/* Media Upload Notice */}
        <div className="mb-6">
          <div 
            className="border-2 border-dashed rounded-lg p-6 text-center"
            style={{ 
              borderColor: 'var(--border-primary)',
              backgroundColor: 'var(--bg-secondary)',
              opacity: 0.6
            }}
          >
            <FiImage className="mx-auto mb-2 text-3xl" style={{ color: 'var(--text-secondary)' }} />
            <p 
              className="mb-2 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              🚧 <strong>Media Upload Coming Soon!</strong>
            </p>
            <p 
              className="text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              Image and video upload functionality will be available in a future update.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            icon={<FiTrash2 size={16} />}
            onClick={() => {
              setRating(0);
              setTitle("");
              setComment("");
            }}
          >
            Clear Form
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={reviewLoading}
            disabled={reviewLoading || rating === 0 || !title.trim()}
            icon={<FiUpload size={16} />}
          >
            {reviewLoading ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
