import React, { useEffect } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiPlay } from "react-icons/fi";

const MediaModal = ({
  isOpen,
  onClose,
  media,
  currentIndex,
  setCurrentIndex,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const isVideo = (url) => {
    return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com")
    );
  };

  const getYouTubeEmbedUrl = (url) => {
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  };

  if (!isOpen || !media || media.length === 0) return null;

  const currentMedia = media[currentIndex];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 z-10"
        >
          <FiX size={24} />
        </button>

        {/* Navigation buttons */}
        {media.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 z-10"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 z-10"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}

        {/* Media content */}
        <div className="max-w-6xl max-h-full w-full h-full flex items-center justify-center">
          {isVideo(currentMedia) ? (
            <div className="w-full h-full max-w-4xl max-h-[80vh] aspect-video">
              <iframe
                src={getYouTubeEmbedUrl(currentMedia)}
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <img
              src={currentMedia}
              alt={`Media ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>

        {/* Media counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {media.length}
        </div>

        {/* Thumbnail navigation */}
        {media.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex space-x-2 max-w-sm overflow-x-auto px-4 py-2 bg-black bg-opacity-50 rounded-lg">
            {media.map((item, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? "border-orange-500 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-80"
                }`}
              >
                {isVideo(item) ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <FiPlay className="text-white" size={16} />
                  </div>
                ) : (
                  <img
                    src={item}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaModal;
