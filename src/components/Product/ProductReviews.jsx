import React, { useEffect, useState } from "react";
import ReviewList from "../../components/Reviews/ReviewList";
import ReviewForm from "./ReviewForm";
import useReviewStore from "../../store/useReviewStore";
import { useAuthStore } from "../../store/useAuth";
import { useProductStore } from "../../store/useProduct";
import { toast } from "../../utils/toast";
import ConfirmModal from "../ui/ConfirmModal";
import { useConfirmModal } from "../../hooks/useConfirmModal";
import Button from "../ui/Button";
import { FiEdit3, FiUpload } from "react-icons/fi";

const ProductReviews = ({ productId, product }) => {
  const { reviews, productReviews, addReview, fetchReviews } = useReviewStore();
  const { user } = useAuthStore();
  const { markReviewHelpful, reportReview } = useProductStore();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const {
    isOpen: confirmOpen,
    modalConfig,
    isLoading: confirmLoading,
    showConfirm,
    hideConfirm,
    handleConfirm,
  } = useConfirmModal();

  useEffect(() => {
    // Fetch reviews if we don't have any yet
    if (reviews.length === 0) {
      fetchReviews();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle adding a new review
  const handleAddReview = (reviewData) => {
    addReview({
      productId,
      productName: product.name,
      user: user?.name || "Anonymous User",
      userEmail: user?.email || "anonymous@example.com",
      ...reviewData,
    });
    setShowReviewForm(false);
  };

  // Check if user can add a review - now enabled for all authenticated users
  const canAddReview = !!user;
  
  // Use API reviews data if available, otherwise fall back to local reviews
  const displayReviews =
    product.reviewsData && product.reviewsData.length > 0
      ? product.reviewsData
      : productReviews[productId] || [];

  // Handle marking review as helpful
  const handleMarkHelpful = async (reviewId) => {
    if (!user) {
      toast.warning("Please log in to mark reviews as helpful");
      return;
    }

    // Find the review to check if it's the user's own review
    const review = displayReviews.find((r) => r.id === reviewId);
    if (review && review.userEmail === user.email) {
      toast.warning("You cannot mark your own review as helpful");
      return;
    }

    // Check if user has already marked this review as helpful
    if (review && (review.userMarkedHelpful || review.is_marked_helpful)) {
      toast.info("You have already marked this review as helpful");
      return;
    }

    try {
      const result = await markReviewHelpful(productId, reviewId);
      if (result.success) {
        toast.success("Review marked as helpful!");
        console.log("Review marked as helpful successfully");
      } else {
        toast.error(result.error || "Failed to mark review as helpful");
      }
    } catch (error) {
      console.error("Error marking review as helpful:", error);
      toast.error("Failed to mark review as helpful");
    }
  };

  // Handle reporting review
  const handleReportReview = async (reviewId) => {
    if (!user) {
      toast.warning("Please log in to report reviews");
      return;
    }

    // Find the review to check if it's the user's own review
    const review = displayReviews.find((r) => r.id === reviewId);
    if (review && review.userEmail === user.email) {
      toast.warning("You cannot report your own review");
      return;
    }

    // Show confirm modal instead of window.confirm
    showConfirm({
      title: "Report Review",
      message:
        "Are you sure you want to report this review? This will flag it for moderator review.",
      confirmText: "Report",
      cancelText: "Cancel",
      type: "warning",
      onConfirm: async () => {
        try {
          const result = await reportReview(productId, reviewId);
          if (result.success) {
            toast.success(
              "Review reported successfully. Thank you for helping us maintain quality."
            );
          } else {
            toast.error(result.error || "Failed to report review");
          }
        } catch (error) {
          console.error("Error reporting review:", error);
          toast.error("Failed to report review");
        }
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Customer Reviews
        </h2>
        
        {canAddReview && (
          <Button
            variant={showReviewForm ? "secondary" : "primary"}
            size="sm"
            icon={showReviewForm ? <FiUpload size={16} /> : <FiEdit3 size={16} />}
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            {showReviewForm ? "Close Review Form" : "Write Review"}
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && canAddReview && (
        <div className="mb-8">
          <ReviewForm
            productId={productId}
            onReviewSubmitted={handleAddReview}
          />
        </div>
      )}

      {/* Review List */}
      <ReviewList
        productId={productId}
        reviews={displayReviews}
        onAddReview={handleAddReview}
        canAddReview={false} // Disable inline form since we have dedicated form above
        showFilters={true}
        onMarkHelpful={handleMarkHelpful}
        onReportReview={handleReportReview}
        currentUser={user}
        isAuthenticated={!!user}
      />
      
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={hideConfirm}
        onConfirm={handleConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        type={modalConfig.type}
        isLoading={confirmLoading}
      />
    </div>
  );
};

export default ProductReviews;
