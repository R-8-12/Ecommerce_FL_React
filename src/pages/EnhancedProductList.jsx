import React, { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import EnhancedProductFilter from "../components/ProductList/EnhancedProductFilter";
import ProductSorting from "../components/ProductList/ProductSorting";
import ProductGrid from "../components/ProductList/ProductGrid";
import NoResultsFound from "../components/ProductList/NoResultsFound";
import Pagination from "../components/common/Pagination";
import ProductService from "../services/productService";
import useGlobalFilterStore from "../store/useGlobalFilterStore";
import { FiFilter } from "react-icons/fi";

// Helper function to normalize category names
const normalizeCategory = (cat) => {
  if (!cat) return cat;
  
  const lowerCat = cat.toLowerCase();
  // Handle common variations and normalize them
  if (lowerCat === 'mobile' || lowerCat === 'mobiles') {
    return 'smartphones';
  } else if (lowerCat === 'laptop') {
    return 'laptops';
  } else if (lowerCat === 'laptop-accessories') {
    return 'laptop-accessories';
  }
  return lowerCat;
};

const EnhancedProductList = () => {
  let { category } = useParams();
  const [searchParams] = useSearchParams();
  const { setFiltersFromURL, toEnhancedProductFilters, clearFilters, getFilterDescription } = useGlobalFilterStore();
  
  // Normalize category to lowercase and handle common variations
  category = normalizeCategory(category);

  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("popularity");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter states - managed by EnhancedProductFilter
  const [currentFilters, setCurrentFilters] = useState({
    brands: [],
    categories: [],
    priceRange: { min: 0, max: 150000 },
    storage: [],
    ram: [],
    colors: [],
    rating: 0,
    stockFilters: { inStock: false, outOfStock: false },
    discount: null
  });

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlFilters = setFiltersFromURL(searchParams);
    const enhancedFilters = toEnhancedProductFilters();
    
    // Apply URL filters to current filters
    setCurrentFilters(prev => ({
      ...prev,
      ...enhancedFilters
    }));

    // Set search query if present
    const queryFromURL = searchParams.get('query');
    if (queryFromURL) {
      setSearchQuery(queryFromURL);
    }

    // Set sort order if present
    const sortFromURL = searchParams.get('sort');
    if (sortFromURL) {
      setSortBy(sortFromURL);
    }

    console.log('Applied URL filters:', urlFilters);
  }, [searchParams, setFiltersFromURL, toEnhancedProductFilters]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  // Fetch products on component mount and category change
  // Fetch products on component mount and category change
//   const fetchProducts = useCallback(async () => {
//     setLoading(true);
//     try {
//       let productData;
//       if (category && category.toLowerCase() !== 'all') {
//         productData = await ProductService.getProductsByCategory(category);
//       } else {
//         productData = await ProductService.getAllProducts();
//       }
      
//       // Transform products to match expected format
//       const transformedProducts = (productData.products || []).map((product) => ({
//         ...product,
//         discountPrice: product.discount_price || product.price,
//         image:
//           product.images && product.images.length > 0
//             ? product.images[0]
//             : "https://via.placeholder.com/300x300?text=No+Image",
//       }));
      
//       setProducts(transformedProducts);
//     } catch (error) {
//       console.error('Error fetching products:', error);
//       setProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, category]);

  // Apply filters when currentFilters change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch, currentFilters, searchQuery, products]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentFilters, searchQuery, category]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let productData;
      if (category && category.toLowerCase() !== 'all') {
        // Category is already normalized at the top of the component
        productData = await ProductService.getProductsByCategory(category);
      } else {
        productData = await ProductService.getAllProducts();
      }
      
      // Transform products to match expected format
      const transformedProducts = (productData.products || []).map((product) => ({
        ...product,
        discountPrice: product.discount_price || product.price,
        image:
          product.images && product.images.length > 0
            ? product.images[0]
            : "https://via.placeholder.com/300x300?text=No+Image",
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...products];

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query)
      );
    }

    // Apply brand filter
    if (currentFilters.brands.length > 0) {
      filtered = filtered.filter(product =>
        currentFilters.brands.includes(product.brand)
      );
    }

    // Apply category filter (if not already filtered by URL)
    if (!category && currentFilters.categories.length > 0) {
      filtered = filtered.filter(product =>
        currentFilters.categories.includes(product.category)
      );
    }

    // Apply price range filter
    filtered = filtered.filter(product => {
      const price = product.discountPrice || product.price || 0;
      return price >= currentFilters.priceRange.min && 
             price <= currentFilters.priceRange.max;
    });

    // Apply rating filter
    if (currentFilters.rating > 0) {
      filtered = filtered.filter(product => 
        Math.round(product.rating || 0) >= currentFilters.rating
      );
    }

    // Apply stock filters
    if (currentFilters.stockFilters.inStock && !currentFilters.stockFilters.outOfStock) {
      filtered = filtered.filter(product => (product.stock || 0) > 0);
    } else if (!currentFilters.stockFilters.inStock && currentFilters.stockFilters.outOfStock) {
      filtered = filtered.filter(product => (product.stock || 0) <= 0);
    }

    // Apply storage filter
    if (currentFilters.storage.length > 0) {
      filtered = filtered.filter(product => {
        if (product.variant?.storage) {
          return product.variant.storage.some(storage => 
            currentFilters.storage.includes(storage)
          );
        }
        if (product.valid_options) {
          return product.valid_options.some(option => 
            option.storage && currentFilters.storage.includes(option.storage)
          );
        }
        return false;
      });
    }

    // Apply RAM filter
    if (currentFilters.ram.length > 0) {
      filtered = filtered.filter(product => {
        if (product.valid_options) {
          return product.valid_options.some(option => 
            option.ram && currentFilters.ram.includes(option.ram)
          );
        }
        return false;
      });
    }

    // Apply color filter
    if (currentFilters.colors.length > 0) {
      filtered = filtered.filter(product => {
        if (product.variant?.colors) {
          return product.variant.colors.some(color => 
            currentFilters.colors.includes(color)
          );
        }
        if (product.valid_options) {
          return product.valid_options.some(option => 
            option.colors && currentFilters.colors.includes(option.colors)
          );
        }
        return false;
      });
    }

    // Apply discount filter
    if (currentFilters.discount !== null) {
      filtered = filtered.filter(product => {
        const originalPrice = product.price || 0;
        const discountPrice = product.discountPrice || product.price || 0;
        if (originalPrice > discountPrice) {
          const discountPercentage = Math.round(
            ((originalPrice - discountPrice) / originalPrice) * 100
          );
          return discountPercentage >= currentFilters.discount;
        }
        return false;
      });
    }

    // Apply sorting
    if (sortBy === "price-low") {
      filtered.sort((a, b) => (a.discountPrice || a.price || 0) - (b.discountPrice || b.price || 0));
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => (b.discountPrice || b.price || 0) - (a.discountPrice || a.price || 0));
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    setFilteredProducts(filtered);
  }, [products, currentFilters, searchQuery, category, sortBy]);

  // Handle filter changes from EnhancedProductFilter
  const handleFiltersChange = useCallback((filters) => {
    setCurrentFilters(filters);
  }, []);

  // Reset all filters
  const resetFilters = () => {
    // Clear local filters
    setCurrentFilters({
      brands: [],
      categories: [],
      priceRange: { min: 0, max: 150000 },
      storage: [],
      ram: [],
      colors: [],
      rating: 0,
      stockFilters: { inStock: false, outOfStock: false },
      discount: null
    });
    
    // Clear global filters
    clearFilters();
    
    // Clear search query
    setSearchQuery("");
    
    // Clear sort
    setSortBy("popularity");
  };

  // Pagination calculations
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", link: ROUTES.HOME },
    {
      label: category
        ? category.charAt(0).toUpperCase() + category.slice(1).replace("-", " ")
        : "Products",
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-secondary)" }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {category
              ? category.charAt(0).toUpperCase() +
                category.slice(1).replace("-", " ")
              : "All Products"}
          </h1>
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FiFilter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Sidebar */}
          <EnhancedProductFilter
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            currentCategory={category}
            onFiltersChange={handleFiltersChange}
            resetFilters={resetFilters}
          />

          {/* Product Grid */}
          <div className="w-full md:w-3/4">
            {/* Applied Filters Display */}
            {getFilterDescription() && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Applied Filters: 
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-300 ml-2">
                      {getFilterDescription()}
                    </span>
                  </div>
                  <button
                    onClick={resetFilters}
                    className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 rounded-full transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
            
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {loading ? (
                  "Loading products..."
                ) : (
                  `Showing ${startIndex + 1}-${Math.min(endIndex, totalProducts)} of ${totalProducts} products`
                )}
              </div>
              <ProductSorting sortBy={sortBy} setSortBy={setSortBy} />
            </div>

            {/* Products Grid */}
            <ProductGrid products={paginatedProducts} loading={loading} />

            {/* Pagination */}
            {!loading && totalProducts > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalProducts}
                itemsPerPage={PRODUCTS_PER_PAGE}
              />
            )}

            {/* No Results */}
            {!loading && filteredProducts.length === 0 && (
              <NoResultsFound resetFilters={resetFilters} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProductList;
