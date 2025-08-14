import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'; // Used for JSX motion elements
import { useNavigate, Link } from "react-router-dom";
import Button from "./ui/Button";
import useFrontendCacheStore from "../store/useFrontendCacheStore";
import { useAuthStore } from "../store/useAuth";
import { useAdminAuthStore } from "../store/Admin/useAdminAuth";

// Fallback images from public folder (used if no banners from database)
const fallbackImages = [
  {
    image: "/mobile1.png",
    title: "Latest Smartphones",
    subtitle: "Discover the newest technology at unbeatable prices",
    tag: "New Arrivals",
    cta: "Shop Phones",
    backgroundColor: "#f8fafc",
  },
  {
    image: "/laptops.png",
    title: "Premium Laptops",
    subtitle: "Powerful devices for work and play",
    tag: "Best Sellers",
    cta: "Shop Laptops",
    backgroundColor: "#f1f5f9",
  },
  {
    image: "/tv1.png",
    title: "Smart TVs",
    subtitle: "Immersive entertainment for your home",
    tag: "Featured",
    cta: "Shop TVs",
    backgroundColor: "#e2e8f0",
  },
];

const HeroBanner = () => {
  // Use centralized cache instead of individual banner store
  const { getBanners, fetchBanners } = useFrontendCacheStore();
  const { isAuthenticated } = useAuthStore();
  const { isAuthenticated: isAdminAuth } = useAdminAuthStore();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Fetch banners when auth state changes
  useEffect(() => {
    console.log('🎯 Auth state changed in hero banner, refreshing banners...');
    fetchBanners('homepage');
  }, [isAuthenticated, isAdminAuth, fetchBanners]);

  // Get hero banners from cache or use fallback
  const allBanners = getBanners();
  console.log('🎯 All banners from cache:', allBanners);
  
  // Filter for hero position banners that are active
  const heroBanners = allBanners.filter(banner => 
    banner.position === 'hero' && banner.active === true
  );
  console.log('🎯 Filtered hero banners:', heroBanners);
  
  const images = heroBanners.length > 0 ? heroBanners : fallbackImages;
  console.log('🎯 Final images for hero banner:', images);

  // Auto-advance the slider
  useEffect(() => {
    if (images.length === 0) return;
    const timer = setTimeout(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [currentIndex, images.length]);

  // Handle manual navigation
  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  // Handle button click navigation
  const handleButtonClick = (link) => {
    if (link) {
      navigate(`/category/${link}`);
    }
  };

  // Variants for Framer Motion
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  // Transition for animation
  const slideTransition = {
    duration: 0.6,
    ease: "easeInOut",
  };

  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div
          className="relative overflow-hidden rounded-xl transform hover:scale-[1.01] transition-all duration-700 ease-in-out animate-fadeIn"
          style={{
            boxShadow:
              "var(--shadow-large), 0 15px 30px -10px rgba(245, 158, 11, 0.2)",
            height: "clamp(250px, 40vh, 500px)",
            width: "100%",
            maxHeight: "500px",
            minHeight: "250px",
          }}
        >
          {/* Slider with Framer Motion */}
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="absolute inset-0"
            >
              {/* High-quality image with responsive sizing and better fit */}
              <img
                src={images[currentIndex].image}
                alt={images[currentIndex].title}
                className="w-full h-full object-cover object-center"
                style={{
                  backgroundColor: images[currentIndex].backgroundColor,
                  objectFit: "cover",
                  objectPosition: "center center",
                }}
                loading="eager"
              />
              {/* Content overlay with responsive padding */}
              <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-14">
                <div className="max-w-lg lg:max-w-xl relative">
                  {/* Animated badge */}
                  {images[currentIndex].tag && (
                    <motion.span
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="inline-block px-5 py-2 mb-5 rounded-full text-sm font-medium shadow-lg"
                      style={{
                        backgroundColor: "var(--brand-primary)",
                        color: "var(--text-on-brand)",
                        boxShadow: "0 8px 25px rgba(245, 158, 11, 0.5)",
                      }}
                    >
                      {images[currentIndex].tag}
                    </motion.span>
                  )}
                  {/* Responsive animated headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-4 leading-tight drop-shadow-lg"
                    style={{
                      color: "var(--text-on-brand)",
                      textShadow: "0 2px 10px rgba(0,0,0,0.4)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {images[currentIndex].title}
                  </motion.h1>
                  {/* Responsive animated subtitle */}
                  {images[currentIndex].subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 sm:mb-6 md:mb-8 leading-relaxed max-w-xl"
                      style={{
                        color: "var(--text-on-brand-muted)",
                        textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      }}
                    >
                      {images[currentIndex].subtitle}
                    </motion.p>
                  )}
                  {/* Responsive description */}
                  {images[currentIndex].description && (
                    <motion.p
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                      className="text-sm sm:text-base mb-4 sm:mb-6 md:mb-8 leading-relaxed max-w-xl"
                      style={{
                        color: "var(--text-on-brand-muted)",
                        textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      }}
                    >
                      {images[currentIndex].description}
                    </motion.p>
                  )}
                  {/* Clickable overlay for entire banner */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
                  >
                    <motion.button
                      onClick={() => handleButtonClick(images[currentIndex].link)}
                      className="group relative overflow-hidden px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                      style={{
                        backgroundColor: "var(--brand-primary)",
                        boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.5)",
                      }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {images[currentIndex].cta || "Shop Now"}
                        <svg
                          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-30 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Slider navigation buttons */}
          <div className="absolute inset-y-0 left-0 flex items-center z-10">
            <motion.button
              initial={{ opacity: 0.6 }}
              whileHover={{ opacity: 1, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevious}
              className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-r-lg ml-2 z-10"
              aria-label="Previous slide"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center z-10">
            <motion.button
              initial={{ opacity: 0.6 }}
              whileHover={{ opacity: 1, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="bg-black/30 hover:bg-black/50 text-white p-2 rounded-l-lg mr-2 z-10"
              aria-label="Next slide"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>
          </div>
          {/* Slide indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {images.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
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
          {/* Decorative elements */}
          <div
            className="absolute top-0 right-0 w-64 h-64 opacity-20 rotate-45 translate-x-20 -translate-y-20 animate-pulse"
            style={{ animationDuration: "5s" }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            ></div>
          </div>
          <div
            className="absolute top-1/2 right-1/3 w-40 h-40 opacity-15 rotate-12 animate-pulse"
            style={{ animationDuration: "8s" }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle, var(--brand-secondary) 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
            ></div>
          </div>
          <div
            className="absolute bottom-10 right-1/4 w-32 h-32 opacity-10 animate-pulse"
            style={{ animationDuration: "12s" }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle, var(--text-on-brand) 0%, transparent 70%)",
                filter: "blur(25px)",
              }}
            ></div>
          </div>
          <div
            className="absolute bottom-0 left-1/4 w-20 h-20 opacity-10 rotate-90 animate-pulse"
            style={{ animationDuration: "10s" }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle, var(--brand-primary) 0%, transparent 70%)",
                filter: "blur(15px)",
              }}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
