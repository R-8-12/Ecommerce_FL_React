import BannerCarousel from "../components/BannerCarousel";
import CategoryList from "../components/CategoryList";
import FeaturedProductList from "../components/FeaturedProductList";
import HeroBanner from "../components/HeroBanner";
import BestSellingSection from "../components/ProductSections/BestSellingSection";
import NewReleasesSection from "../components/ProductSections/NewReleasesSection";
import BrandsSection from "../components/ProductSections/BrandsSection";
import { useEffect, useState } from "react";
import { useProductStore } from "../store/useProduct";
import useFrontendCacheStore from "../store/useFrontendCacheStore";
import ProductCard from "../components/ProductList/ProductCard";
import Pagination from "../components/common/Pagination";
import { Link } from "react-router-dom";

const Home = () => {
  const { products, featuredProducts, fetchProducts } = useProductStore();
  // Use centralized cache with context awareness
  const { getHomepageSections, isLoading, initializeCacheWithContext } = useFrontendCacheStore();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const PRODUCTS_PER_PAGE = 10;

  // Get data from cache (no API calls needed)
  const sections = getHomepageSections();
  const sectionsLoading = isLoading('homepageSections');
  
  useEffect(() => {
    const initializeHomePage = async () => {
      try {
        console.log('🏠 Initializing homepage with context-aware cache...');
        setIsLoadingProducts(true);
        
        // Initialize homepage context - this will only fetch what's missing/stale
        await initializeCacheWithContext('homepage');
        
        // Only fetch products if we don't have them already
        if (products.length === 0) {
          console.log('Fetching products...');
          await fetchProducts();
        }
        
        console.log('✅ Homepage initialized with optimized cache (no redundant API calls)');
      } catch (error) {
        console.error('Homepage initialization error:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    initializeHomePage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pagination calculations
  const totalProducts = products?.length || 0;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = products?.slice(startIndex, endIndex) || [];
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Render homepage sections dynamically based on admin configuration
  const renderHomepageSection = (section) => {
    // Safety check for undefined section
    if (!section || !section.enabled) return null;

    const sectionStyle = {
      backgroundColor: "var(--bg-primary)",
      ...(section.background_color && { backgroundColor: section.background_color }),
    };

    switch (section.section_type) {
      case 'hero_banner':
        return (
          <div key={section.section_id} style={sectionStyle}>
            <HeroBanner />
          </div>
        );

      case 'category_list':
        return (
          <section key={section.section_id} style={sectionStyle} className="py-12">
            <div className="container mx-auto px-4">
              <div className="mb-10">
                <h2
                  className="text-4xl font-bold mb-4 text-left"
                  style={{ color: "var(--text-primary)" }}
                >
                  {section.title || "Shop by Category"}
                </h2>
                <div
                  className="h-1 w-32 rounded-full mb-2"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                ></div>
                <p
                  className="text-lg text-left"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {section.description || "Discover our wide range of products across different categories"}
                </p>
              </div>
              <CategoryList categories={categories} />
            </div>
          </section>
        );

      case 'featured_products':
        return (
          <section key={section.section_id} className="py-12">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <h2
                  className="text-3xl font-bold mb-3 text-left"
                  style={{ color: "var(--text-primary)" }}
                >
                  {section.title || "Featured Products"}
                </h2>
                <div
                  className="h-1 w-24 rounded-full"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                ></div>
                <p
                  className="mt-4 text-lg text-left"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {section.description || "Discover our best-selling items handpicked for you"}
                </p>
              </div>
              <FeaturedProductList products={featuredProducts} />
            </div>
          </section>
        );

      case 'best_selling':
        return (
          <BestSellingSection 
            key={section.section_id}
            products={products.filter(p => p.category?.toLowerCase().includes('smartphone')).slice(0, 8)}
            title={section.title}
            description={section.description}
          />
        );

      case 'new_releases':
        return (
          <NewReleasesSection 
            key={section.section_id}
            products={products.filter(p => p.isNew || p.featured).slice(0, 8)}
            title={section.title}
            description={section.description}
          />
        );

      case 'banner_carousel':
        return (
          <section key={section.section_id} style={sectionStyle} className="py-12">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <h2
                  style={{ color: "var(--text-primary)" }}
                  className="text-3xl font-bold mb-3 text-left"
                >
                  {section.title || "Special Offers"}
                </h2>
                <div
                  className="h-1 w-24 rounded-full"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                ></div>
                <p
                  className="mt-4 text-lg text-left"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {section.description || "Don't miss out on these amazing deals"}
                </p>
              </div>
              <BannerCarousel />
            </div>
          </section>
        );

      case 'static_promo_banners':
        return (
          <div key={section.section_id}>
            {/* Static promo banners section removed - admin can now fully control homepage sections */}
            <div style={{ backgroundColor: "var(--bg-primary)" }} className="py-4">
              <div className="container mx-auto px-4">
                <p style={{ color: "var(--text-secondary)" }} className="text-center">
                  This section is now under admin control. Configure it in the admin panel.
                </p>
              </div>
            </div>
          </div>
        );

      case 'newsletter':
        return (
          <section key={section.section_id} style={sectionStyle} className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2
                  className="text-3xl font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  {section.title || "Stay Updated"}
                </h2>
                <p
                  className="text-lg mb-6"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {section.description || "Subscribe to our newsletter for the latest updates and exclusive offers"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto w-full">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    className="px-6 py-2 text-white rounded-md font-medium transition-colors"
                    style={{ backgroundColor: "var(--brand-primary)" }}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </section>
        );

      case 'testimonials':
        return (
          <section key={section.section_id} style={sectionStyle} className="py-12">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2
                  className="text-3xl font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  {section.title || "What Our Customers Say"}
                </h2>
                <p
                  className="text-lg"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {section.description || "Real reviews from satisfied customers"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: "John Doe",
                    rating: 5,
                    review: "Excellent service and quality products. Highly recommended!",
                    avatar: "https://via.placeholder.com/64x64"
                  },
                  {
                    name: "Jane Smith",
                    rating: 5,
                    review: "Fast delivery and great customer support. Will shop again!",
                    avatar: "https://via.placeholder.com/64x64"
                  },
                  {
                    name: "Mike Johnson",
                    rating: 5,
                    review: "Best prices in the market with genuine products.",
                    avatar: "https://via.placeholder.com/64x64"
                  }
                ].map((testimonial, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center mb-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div>
                        <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {testimonial.name}
                        </h4>
                        <div className="flex text-yellow-400">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p style={{ color: "var(--text-secondary)" }}>
                      "{testimonial.review}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  // Filter and sort enabled sections by display order
  const enabledSections = (sections || []) // Ensure sections is always an array
    .filter(section => section && section.enabled) // Add null/undefined check
    .sort((a, b) => (a.display_order || a.order || 0) - (b.display_order || b.order || 0));
  
  console.log('Homepage sections to render:', enabledSections); // We don't need mock data anymore as CategoryList will fetch from backend
  // Keeping as fallback in case backend is not available
  const categories = [];

  return (
    <div
      style={{ backgroundColor: "var(--bg-secondary)" }}
      className="min-h-screen"
    >
      {(sectionsLoading || isLoadingProducts) ? (
        // Loading state for homepage sections
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Loading homepage...
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Please wait while we load the content
            </p>
          </div>
        </div>
      ) : enabledSections.length > 0 ? (
        // Render admin-configured sections
        enabledSections.map(section => renderHomepageSection(section))
      ) : (
        // Fallback to default sections if no admin sections configured
        <>
          {/* Hero Banner */}
          <HeroBanner />
          
          {/* Categories Section */}
          <section
            style={{ backgroundColor: "var(--bg-primary)" }}
            className="py-12"
          >
            <div className="container mx-auto px-4">
              <div className="mb-10">
                <h2
                  className="text-4xl font-bold mb-4 text-left"
                  style={{ color: "var(--text-primary)" }}
                >
                  Shop by Category
                </h2>
                <div
                  className="h-1 w-32 rounded-full mb-2"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                  }}
                ></div>
                <p
                  className="text-lg text-left"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Discover our wide range of products across different categories
                </p>
              </div>
              <CategoryList categories={categories} />
            </div>
          </section>

          {/* Featured Products Section */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <h2
                  className="text-3xl font-bold mb-3 text-left"
                  style={{ color: "var(--text-primary)" }}
                >
                  Featured Products
                </h2>
                <div
                  className="h-1 w-24 rounded-full"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                  }}
                ></div>
                <p
                  className="mt-4 text-lg text-left"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Discover our best-selling items handpicked for you
                </p>
              </div>
              <FeaturedProductList products={featuredProducts} />
            </div>
          </section>

          {/* Best Selling Smartphones Section */}
          <BestSellingSection products={products.filter(p => p.category?.toLowerCase().includes('smartphone')).slice(0, 8)} />

          {/* New Releases Section */}
          <NewReleasesSection products={products.filter(p => p.isNew || p.featured).slice(0, 8)} />

          {/* Brands Section - Removed StaticPromoBanners to give admin full control */}
          <BrandsSection />

          {/* Promotional Banners */}
          <section
            style={{ backgroundColor: "var(--bg-primary)" }}
            className="py-12"
          >
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <h2
                  style={{ color: "var(--text-primary)" }}
                  className="text-3xl font-bold mb-3 text-left"
                >
                  Special Offers
                </h2>
                <div
                  className="h-1 w-24 rounded-full"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                  }}
                ></div>
                <p
                  className="mt-4 text-lg text-left"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Don't miss out on these amazing deals
                </p>
              </div>
              <BannerCarousel />
            </div>
          </section>
          
          {/* Our Products Section with Pagination */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="mb-12">
                <h2
                  className="text-3xl font-bold mb-3 text-left"
                  style={{ color: "var(--text-primary)" }}
                >
                  Our Products
                </h2>
                <div
                  className="h-1 w-24 rounded-full"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                  }}
                ></div>
                <p
                  className="mt-4 text-lg text-left"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Explore our complete collection
                </p>
              </div>
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      id: product.id || product._id,
                      name:
                        product.name ||
                        `${product.brand} ${product.model || ""}`.trim(),
                      image:
                        product.images && product.images.length > 0
                          ? product.images[0]
                          : product.image ||
                            "https://via.placeholder.com/300x300?text=No+Image",
                      discountPrice:
                        product.discount_price ||
                        product.offer_price ||
                        product.price,
                      price: product.price,
                      discount:
                        product.discount ||
                        (product.price && product.discount_price
                          ? `${Math.round(
                              ((product.price -
                                (product.discount_price || product.offer_price)) /
                                product.price) *
                                100
                            )}%`
                          : null),
                      rating: product.rating || 4.0,
                      reviews: product.reviews || product.reviews_count || 0,
                      brand: product.brand || "Unknown",
                      category: product.category || "General",
                      stock: product.stock || 0,
                    }}
                  />
                ))}
              </div>
              {/* Pagination */}
              {totalProducts > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalProducts}
                  itemsPerPage={PRODUCTS_PER_PAGE}
                />
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
