import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import usePublicBrandsStore from "../../store/usePublicBrandsStore";

const BrandsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleBrands, setVisibleBrands] = useState(6);
  
  // Use the public brands store
  const { brands, loading, fetchPublicBrands } = usePublicBrandsStore();

  // Fetch brands on component mount
  useEffect(() => {
    fetchPublicBrands(false); // Get all brands, not just featured
  }, [fetchPublicBrands]);

  // Filter to get display brands (active brands, prioritizing featured ones)
  const displayBrands = React.useMemo(() => {
    const activeBrands = brands.filter(brand => brand.is_active !== false);
    const featuredBrands = activeBrands.filter(brand => brand.is_featured);
    const nonFeaturedBrands = activeBrands.filter(brand => !brand.is_featured);
    
    // Show featured brands first, then other active brands
    return [...featuredBrands, ...nonFeaturedBrands];
  }, [brands]);

  // Handle responsive visible brands count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleBrands(6);
      } else if (window.innerWidth >= 768) {
        setVisibleBrands(4);
      } else {
        setVisibleBrands(2);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, displayBrands.length - visibleBrands);

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  //const visibleBrandsList = displayBrands.slice(currentIndex, currentIndex + visibleBrands);

  // Show loading state or return null if no brands
  if (loading) {
    return (
      <section className="py-16" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading brands...</p>
          </div>
        </div>
      </section>
    );
  }

  if (displayBrands.length === 0) {
    return null;
  }

  return (
    <section 
      className="py-16" 
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 
            className="text-3xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Shop by Brand
          </h2>
          <div 
            className="h-1 w-32 mx-auto rounded-full mb-4"
            style={{ backgroundColor: "var(--brand-primary)" }}
          />
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            Discover premium smartphones from the world's leading brands
          </p>
        </div>

        {/* Brands Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / visibleBrands)}%)`,
                width: `${(brands.length / visibleBrands) * 100}%`
              }}
            >
              {brands.map((brand) => (
                <div 
                  key={brand.id}
                  className="px-3"
                  style={{ width: `${100 / brands.length}%` }}
                >
                  <Link 
                    to={brand.link}
                    className="block group"
                  >
                    <div 
                      className="rounded-xl p-8 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border"
                      style={{ 
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border-primary)"
                      }}
                    >
                      {/* Brand Logo */}
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-white">
                        <img 
                          src={brand.logo_url || brand.logo}
                          alt={brand.name}
                          className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div 
                          className="w-16 h-16 hidden items-center justify-center text-sm font-bold"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          {brand.name.charAt(0)}
                        </div>
                      </div>

                      {/* Brand Info */}
                      <h3 
                        className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {brand.name}
                      </h3>
                      <p 
                        className="text-sm mb-3"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {brand.description}
                      </p>
                      <div className="flex items-center justify-center text-xs">
                        <span 
                          className="px-3 py-1 rounded-full"
                          style={{ 
                            backgroundColor: "var(--bg-accent-light)",
                            color: "var(--brand-primary)"
                          }}
                        >
                          {brand.product_count || brand.productCount || 0} Products
                        </span>
                        {(brand.is_featured || brand.featured) && (
                          <span 
                            className="ml-2 px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: "var(--success-color)",
                              color: "white"
                            }}
                          >
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          {brands.length > visibleBrands && (
            <>
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-primary)",
                  color: "var(--brand-primary)"
                }}
              >
                <FiChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-primary)",
                  color: "var(--brand-primary)"
                }}
              >
                <FiChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {brands.length > visibleBrands && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index ? 'scale-125' : 'hover:scale-110'
                }`}
                style={{ 
                  backgroundColor: currentIndex === index 
                    ? "var(--brand-primary)" 
                    : "var(--border-primary)"
                }}
              />
            ))}
          </div>
        )}

        {/* View All Brands Link */}
        <div className="text-center mt-8">
          <Link 
            to="/products"
            className="inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            style={{ 
              backgroundColor: "var(--brand-primary)",
              color: "var(--text-on-brand)"
            }}
          >
            View All Brands
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
