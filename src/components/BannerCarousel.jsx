/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useFrontendCacheStore from "../store/useFrontendCacheStore";

// Define fallback product images with correct paths for Vite
const fallbackImages = [
  {
    id: 1,
    image: "/mobile1.png",
    backgroundColor: "#f8fafc",
  },
  {
    id: 2,
    image: "/laptops.png",
    backgroundColor: "#f1f5f9",
  },
  {
    id: 3,
    image: "/tv1.png",
    backgroundColor: "#e2e8f0",
  },
  {
    id: 4,
    image: "/tablets1.png",
    backgroundColor: "#f1f5f9",
  },
  {
    id: 5,
    image: "/accessories.png",
    backgroundColor: "#f8fafc",
  },
];

const BannerCarousel = () => {
  // Use centralized cache instead of individual banner store
  const { getBanners } = useFrontendCacheStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [[page, direction], setPage] = useState([0, 0]);

  // Get carousel banners from cache or use fallback
  const allBanners = getBanners();
  console.log('🎠 All banners from cache:', allBanners);
  
  // Filter for carousel position banners that are active
  // Based on the database, we'll use 'carousel' position, but if none exist, use hero banners
  let carouselBanners = allBanners.filter(banner => 
    banner.position === 'carousel' && banner.active === true
  );
  
  // If no carousel banners, use hero banners as fallback
  if (carouselBanners.length === 0) {
    carouselBanners = allBanners.filter(banner => 
      banner.position === 'hero' && banner.active === true
    );
  }
  
  console.log('🎠 Filtered carousel banners:', carouselBanners);
  const banners = carouselBanners.length > 0 ? carouselBanners : fallbackImages;
  console.log('🎠 Final banners for carousel:', banners);
  // Auto-advance the slider
  useEffect(() => {
    const timer = setTimeout(() => {
      const newIndex = (currentIndex + 1) % banners.length;
      setPage([newIndex, 1]); // 1 for forward direction
      setCurrentIndex(newIndex);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentIndex, banners.length]);

  // Handle manual navigation
  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + banners.length) % banners.length;
    setPage([newIndex, -1]); // -1 for backward direction
    setCurrentIndex(newIndex);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % banners.length;
    setPage([newIndex, 1]); // 1 for forward direction
    setCurrentIndex(newIndex);
  };

  // Variants for Framer Motion
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  // Transition for animation
  const slideTransition = {
    duration: 0.6,
    ease: "easeInOut",
  };
  return (
    <div
      className="relative overflow-hidden w-full"
      style={{
        boxShadow: "var(--shadow-large)",
        height: "500px",
      }}
    >
      {/* Progress bar - automatic animation */}
      <div className="absolute top-0 left-0 right-0 z-30 h-1.5 bg-white bg-opacity-20">
        <div
          className="h-full"
          style={{
            width: `${((currentIndex + 1) / banners.length) * 100}%`,
            backgroundColor: "var(--brand-primary)",
            transition: "width 5s linear",
          }}
        ></div>
      </div>
      {/* Slider with Framer Motion */}
      <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="absolute inset-0 w-full"
          >
            {/* High-quality image with subtle zoom effect */}
            <motion.img
              src={banners[currentIndex].image}
              alt={banners[currentIndex].title || "Banner"}
              className="w-full h-full object-cover"
              style={{
                backgroundColor:
                  banners[currentIndex].backgroundColor || "#f1f5f9",
              }}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              loading="eager"
            />
            {/* Banner content overlay */}

            {/* Decorative elements */}
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 opacity-20 rotate-45 translate-x-20 -translate-y-20"
              animate={{
                rotate: [45, 55, 45],
                opacity: [0.2, 0.25, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)",
                  filter: "blur(40px)",
                }}
              ></div>
            </motion.div>
            <motion.div
              className="absolute bottom-10 right-1/4 w-32 h-32 opacity-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.15, 0.1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, var(--text-on-brand) 0%, transparent 70%)",
                  filter: "blur(25px)",
                }}
              ></div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Navigation buttons */}
      <motion.button
        initial={{ opacity: 0.6 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full shadow-lg z-10"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(4px)",
          color: "var(--brand-primary)",
          boxShadow: "var(--shadow-medium)",
        }}
        aria-label="Previous slide"
      >
        <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.button>
      <motion.button
        initial={{ opacity: 0.6 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full shadow-lg z-10"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.25)",
          backdropFilter: "blur(4px)",
          color: "var(--brand-primary)",
          boxShadow: "var(--shadow-medium)",
        }}
        aria-label="Next slide"
      >
        <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.button>
      {/* Slide indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {banners.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => {
              const direction = index > currentIndex ? 1 : -1;
              setPage([index, direction]);
              setCurrentIndex(index);
            }}
            className={`h-2.5 rounded-full ${
              index === currentIndex ? "w-8 bg-white" : "w-2.5 bg-white/50"
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
