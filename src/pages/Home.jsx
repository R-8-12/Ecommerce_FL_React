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
import { motion } from "framer-motion";
import api from "../services/api";

// Component to display custom section content from admin
const CustomSectionContent = ({ section }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectionContent = async () => {
      if (!section?.section_id) return;
      
      try {
        const response = await api.get(`/admin/homepage/sections/${section.section_id}/content/`);
        if (response.status === 200 && response.data.content) {
          setContent(response.data.content);
        }
      } catch (error) {
        console.error('Error fetching section content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectionContent();
  }, [section?.section_id]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!content || Object.keys(content).length === 0) {
    return null;
  }

  // Convert content object to array
  const contentItems = Object.values(content).filter(item => item && typeof item === 'object');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {contentItems.map((item, index) => (
        <motion.div
          key={item.id || index}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          style={{ backgroundColor: "var(--bg-primary)", boxShadow: "var(--shadow-medium)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {item.image_url && (
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={item.image_url}
                alt={item.title || 'Section content'}
                className="w-full h-48 object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            {item.title && (
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                {item.title}
              </h3>
            )}
            
            {item.subtitle && (
              <p 
                className="text-sm mb-2 font-medium"
                style={{ color: "var(--brand-primary)" }}
              >
                {item.subtitle}
              </p>
            )}
            
            {item.description && (
              <p 
                className="text-sm mb-4"
                style={{ color: "var(--text-secondary)" }}
              >
                {item.description}
              </p>
            )}
            
            {item.link && item.cta && (
              <a
                href={item.link}
                className="inline-block px-4 py-2 rounded-md text-white font-medium transition-colors duration-200 hover:opacity-90"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                {item.cta}
              </a>
            )}
            
            {item.tag && (
              <span 
                className="inline-block px-2 py-1 text-xs rounded-full mt-2"
                style={{ 
                  backgroundColor: "var(--brand-primary-light)", 
                  color: "var(--brand-primary)" 
                }}
              >
                {item.tag}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

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

      case 'brands':
        return (
          <div key={section.section_id} style={sectionStyle}>
            <BrandsSection 
              title={section.title}
              description={section.description}
            />
          </div>
        );

      case 'section_banners':
        return (
          <section key={section.section_id} style={sectionStyle} className="py-12">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <h2
                  style={{ color: "var(--text-primary)" }}
                  className="text-3xl font-bold mb-3 text-left"
                >
                  {section.title || "Section Banners"}
                </h2>
                <div
                  className="h-1 w-24 rounded-full"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                ></div>
                <p
                  className="mt-4 text-lg text-left"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {section.description || "Promotional banner section"}
                </p>
              </div>
              
              {/* Grid layout for banners - similar to Poorvika style */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.config?.banners?.map((banner, index) => (
                  <div key={index} className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src={banner.image_url || 'https://via.placeholder.com/400x250'} 
                      alt={banner.title || `Banner ${index + 1}`}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg font-semibold mb-1">{banner.title}</h3>
                      {banner.subtitle && <p className="text-sm opacity-90">{banner.subtitle}</p>}
                    </div>
                  </div>
                )) || (
                  // Placeholder banners if none configured
                  Array.from({length: 6}).map((_, index) => (
                    <div key={index} className="relative group overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h3 className="text-lg font-semibold mb-1">Banner {index + 1}</h3>
                          <p className="text-sm opacity-90">Configure in admin panel</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        );

      case 'phones_and_gadgets':
        return (
          <section key={section.section_id} style={sectionStyle} className="py-12">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <h2
                  style={{ color: "var(--text-primary)" }}
                  className="text-3xl font-bold mb-3 text-left"
                >
                  {section.title || "Phones & Gadgets"}
                </h2>
                <div
                  className="h-1 w-24 rounded-full"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                ></div>
                <p
                  className="mt-4 text-lg text-left"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {section.description || "Latest smartphones and mobile accessories"}
                </p>
              </div>
              
              {/* Grid layout for phones and gadgets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products
                  .filter(p => p.category?.toLowerCase().includes('phone') || p.category?.toLowerCase().includes('mobile'))
                  .slice(0, 8)
                  .map((product, index) => (
                    <ProductCard key={product.id || index} product={product} />
                  ))}
              </div>
            </div>
          </section>
        );

      case 'electronic_gadgets':
        return (
          <section key={section.section_id} style={sectionStyle} className="py-12">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <h2
                  style={{ color: "var(--text-primary)" }}
                  className="text-3xl font-bold mb-3 text-left"
                >
                  {section.title || "Electronic Gadgets"}
                </h2>
                <div
                  className="h-1 w-24 rounded-full"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                ></div>
                <p
                  className="mt-4 text-lg text-left"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {section.description || "Latest electronic devices and gadgets"}
                </p>
              </div>
              
              {/* Grid layout for electronic gadgets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products
                  .filter(p => p.category?.toLowerCase().includes('electronic') || p.category?.toLowerCase().includes('gadget'))
                  .slice(0, 8)
                  .map((product, index) => (
                    <ProductCard key={product.id || index} product={product} />
                  ))}
              </div>
            </div>
          </section>
        );

      case 'footer_section':
        return (
          <section key={section.section_id} style={sectionStyle} className="py-12">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <h2
                  style={{ color: "var(--text-primary)" }}
                  className="text-3xl font-bold mb-3 text-left"
                >
                  {section.title || "Footer Information"}
                </h2>
                <div
                  className="h-1 w-24 rounded-full"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                ></div>
                <p
                  className="mt-4 text-lg text-left"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {section.description || "Important links and information"}
                </p>
              </div>
              
              {/* Footer content grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Company</h3>
                  <ul className="space-y-2">
                    <li><Link to="/about" className="hover:text-orange-500" style={{ color: "var(--text-secondary)" }}>About Us</Link></li>
                    <li><Link to="/contact" className="hover:text-orange-500" style={{ color: "var(--text-secondary)" }}>Contact</Link></li>
                    <li><Link to="/careers" className="hover:text-orange-500" style={{ color: "var(--text-secondary)" }}>Careers</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Support</h3>
                  <ul className="space-y-2">
                    <li><Link to="/help" className="hover:text-orange-500" style={{ color: "var(--text-secondary)" }}>Help Center</Link></li>
                    <li><Link to="/returns" className="hover:text-orange-500" style={{ color: "var(--text-secondary)" }}>Returns</Link></li>
                    <li><Link to="/warranty" className="hover:text-orange-500" style={{ color: "var(--text-secondary)" }}>Warranty</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Legal</h3>
                  <ul className="space-y-2">
                    <li><Link to="/privacy" className="hover:text-orange-500" style={{ color: "var(--text-secondary)" }}>Privacy Policy</Link></li>
                    <li><Link to="/terms" className="hover:text-orange-500" style={{ color: "var(--text-secondary)" }}>Terms of Service</Link></li>
                    <li><Link to="/refund" className="hover:text-orange-500" style={{ color: "var(--text-secondary)" }}>Refund Policy</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Connect</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="hover:text-orange-500" style={{ color: "var(--text-secondary)" }}>Facebook</a></li>
                    <li><a href="#" className="hover:text-orange-500" style={{ color: "var(--text-secondary)" }}>Twitter</a></li>
                    <li><a href="#" className="hover:text-orange-500" style={{ color: "var(--text-secondary)" }}>Instagram</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        // Handle custom/unknown section types with content from admin
        return (
          <section key={section.section_id} style={sectionStyle} className="py-12">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <h2
                  className="text-3xl font-bold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  {section.title || "New Section"}
                </h2>
                <div
                  className="h-1 w-24 rounded-full mx-auto mb-4"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                ></div>
                <p
                  className="text-lg mb-8"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {section.description || "This section is being prepared. Content coming soon!"}
                </p>
                
                {/* Display custom content if available */}
                <CustomSectionContent section={section} />
                
                {/* Fallback message if no content */}
                {(!section.content || Object.keys(section.content || {}).length === 0) && (
                  <div 
                    className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300"
                    style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-primary)" }}
                  >
                    <div className="text-center">
                      <div className="mb-4">
                        <div 
                          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                          style={{ backgroundColor: "var(--brand-primary-light)" }}
                        >
                          <span 
                            className="text-2xl"
                            style={{ color: "var(--brand-primary)" }}
                          >
                            🚀
                          </span>
                        </div>
                      </div>
                      <h3 
                        className="text-xl font-semibold mb-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Content Coming Soon
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        This section has been created and is ready for content. 
                        Visit the admin panel to add banners, images, and other content.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
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
