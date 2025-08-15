import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RiSmartphoneLine, RiArrowRightSLine } from "react-icons/ri";
import {
  MdLaptopMac,
  MdTablet,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { BiHeadphone } from "react-icons/bi";
import { FiPackage } from "react-icons/fi";
import { BsHddStack } from "react-icons/bs";
import useCategory from "../store/useCategory";

// Custom CSS for scrollbar hiding
const scrollbarHideStyles = {
  scrollbarWidth: "none", // Firefox
  msOverflowStyle: "none", // IE/Edge
};

const CategoryList = () => {
  const { categories, fetchCategories } = useCategory();
  const [displayCategories, setDisplayCategories] = useState([]);

  const carousel = useRef();

  useEffect(() => {
    fetchCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Use backend categories or prop categories and sort them by order
    if (categories && categories.length > 0) {
      const sortedCategories = [...categories].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      setDisplayCategories(sortedCategories);
    } else if (categories.list && categories.list.length > 0) {
      const sortedCategories = [...categories.list].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );
      setDisplayCategories(sortedCategories);
    }
  }, [categories.list, categories]);

  // Fallback icons if images fail to load
  const categoryIcons = {
    Smartphones: <RiSmartphoneLine className="w-full h-full" />,
    Laptops: <MdLaptopMac className="w-full h-full" />,
    Tablets: <MdTablet className="w-full h-full" />,
    "Mobile Accessories": <FiPackage className="w-full h-full" />,
    "Laptop Accessories": <BsHddStack className="w-full h-full" />,
    "Audio Devices": <BiHeadphone className="w-full h-full" />,
  }; // Handlers for slider controls
  const scrollLeft = (e) => {
    e.preventDefault();
    if (carousel.current) {
      carousel.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = (e) => {
    e.preventDefault();
    if (carousel.current) {
      carousel.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="py-6">
      {/* Slider container with navigation */}
      <div
        className="relative px-2"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") scrollLeft(e);
          if (e.key === "ArrowRight") scrollRight(e);
        }}
      >
        {/* Navigation buttons */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors focus:outline-none"
          style={{
            boxShadow: "var(--shadow-medium)",
            transform: "translateY(-50%) translateX(-5px)",
            cursor: "pointer",
          }}
          aria-label="Scroll left"
          type="button"
        >
          <MdKeyboardArrowLeft
            className="w-6 h-6"
            style={{ color: "var(--brand-primary)" }}
          />
        </button>
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors focus:outline-none"
          style={{
            boxShadow: "var(--shadow-medium)",
            transform: "translateY(-50%) translateX(5px)",
            cursor: "pointer",
          }}
          aria-label="Scroll right"
          type="button"
        >
          <MdKeyboardArrowRight
            className="w-6 h-6"
            style={{ color: "var(--brand-primary)" }}
          />
        </button>
        {/* Carousel container */}
        <div
          ref={carousel}
          className="overflow-x-auto relative z-10 scrollbar-hide"
          style={scrollbarHideStyles}
          tabIndex="0"
        >
          <div className="flex gap-4 py-4 px-8">
            {/* Display loading state */}
            {categories.loading && (
              <div className="flex justify-center w-full py-8">
                <div
                  className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
                  style={{ borderColor: "var(--brand-primary)" }}
                ></div>
              </div>
            )}

            {/* Display error state */}
            {categories.error && (
              <div className="flex justify-center w-full py-8 text-red-500">
                Error loading categories: {categories.error}
              </div>
            )}

            {/* Display categories */}
            {displayCategories.map((category) => (
              <Link
                key={category.id}
                to={`${category.redirect_url}`}
                className="flex-shrink-0 flex flex-col items-center transition-transform duration-300 hover:-translate-y-2 group"
                style={{
                  width: "220px", // Increased from 300px to better fill space
                }}
              >
                {/* Enhanced Image container with larger size */}
                <div
                  className="flex items-center justify-center mb-4 relative overflow-hidden transition-all duration-500 hover:shadow-2xl bg-white rounded-3xl border group-hover:border-orange-300 group-hover:bg-gradient-to-br group-hover:from-orange-50 group-hover:to-red-50 group-hover:scale-105"
                  style={{
                    width: "200px", // Increased from 160px
                    height: "200px", // Increased from 160px
                    padding: "20px", // Increased padding
                    border: "3px solid var(--border-primary)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.08)",
                    background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
                  }}
                >
                  {category.image_url ? (
                    <>
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          backgroundColor: "transparent",
                          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                      {/* Overlay gradient effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-100/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"></div>
                    </>
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{ 
                        color: "var(--brand-primary)",
                        background: "linear-gradient(135deg, var(--brand-primary) 0%, #ff8a65 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {categoryIcons[category.name] || (
                        <RiArrowRightSLine className="w-16 h-16" style={{ color: "var(--brand-primary)" }} />
                      )}
                    </div>
                  )}
                </div>
                {/* Enhanced Category name with larger styling */}
                <h3
                  className="text-center transition-all duration-500 group-hover:text-orange-600 group-hover:scale-105 px-4 py-3 rounded-xl font-bold bg-gradient-to-r from-white to-gray-50 group-hover:from-orange-50 group-hover:to-red-50 shadow-sm group-hover:shadow-md max-w-full"
                  style={{
                    color: "var(--text-primary)",
                    lineHeight: "1.4",
                    fontSize: "16px", // Increased from 15px
                    fontWeight: "700",
                    letterSpacing: "0.3px",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
