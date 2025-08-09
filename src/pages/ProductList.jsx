import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ROUTES } from "../utils/constants";
import Breadcrumb from "../components/Breadcrumb/Breadcrumb";
import ProductFilter from "../components/ProductList/ProductFilter";
import ProductSorting from "../components/ProductList/ProductSorting";
import ProductGrid from "../components/ProductList/ProductGrid";
import NoResultsFound from "../components/ProductList/NoResultsFound";
import Pagination from "../components/common/Pagination";
import { useProductStore } from "../store/useProduct";

const ProductList = () => {
  let { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Normalize category to lowercase and handle common variations
  if (category) {
    category = category.toLowerCase();
    // Handle common variations and normalize them
    if (category === 'mobile' || category === 'mobiles') {
      category = 'smartphones';
    } else if (category === 'laptop') {
      category = 'laptops';
    } else if (category === 'laptop-accessories') {
      category = 'laptop-accessories';
    }
  }
  
  const [showFilters, setShowFilters] = useState(false);
  // Filter states
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 150000 });
  const [sortBy, setSortBy] = useState("popularity");
  const [selectedRating, setSelectedRating] = useState(0);
  const [stockFilters, setStockFilters] = useState({
    inStock: false,
    outOfStock: false,
  });
  const [selectedStorage, setSelectedStorage] = useState([]);
  const [selectedRAM, setSelectedRAM] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({}); // New state for dynamic attributes

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 10;

  const { products, brands, loading, fetchProducts } = useProductStore();

  // Initialize filters from URL parameters
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    const priceMinParam = searchParams.get('priceMin');
    const priceMaxParam = searchParams.get('priceMax');
    const sortParam = searchParams.get('sort');
    const ratingParam = searchParams.get('rating');
    const discountParam = searchParams.get('discount');
    
    // Set brand filter from URL
    if (brandParam) {
      console.log('🏷️ Setting brand filter from URL:', brandParam);
      setSelectedBrands([brandParam]);
    }
    
    // Set price range from URL
    if (priceMinParam || priceMaxParam) {
      setPriceRange({
        min: priceMinParam ? parseInt(priceMinParam) : 0,
        max: priceMaxParam ? parseInt(priceMaxParam) : 150000
      });
    }
    
    // Set sorting from URL
    if (sortParam) {
      setSortBy(sortParam);
    }
    
    // Set rating filter from URL
    if (ratingParam) {
      setSelectedRating(parseInt(ratingParam));
    }
    
    // Set discount filter from URL
    if (discountParam) {
      setSelectedDiscount(parseInt(discountParam));
    }
    
    console.log('🔗 URL parameters applied to filters');
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update URL parameters when filters change (except on initial load)
  useEffect(() => {
    // Skip URL update during initial load when filters are being set from URL
    const hasURLParams = searchParams.has('brand') || searchParams.has('priceMin') || 
                        searchParams.has('priceMax') || searchParams.has('sort') || 
                        searchParams.has('rating') || searchParams.has('discount');
    
    if (!hasURLParams) {
      // Only update URL if this is not the initial load from URL parameters
      const timeout = setTimeout(() => {
        updateURLParams();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [selectedBrands, priceRange, sortBy, selectedRating, selectedDiscount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Transform products from store to match the expected format
  const transformedProducts = (products || []).map((product) => ({
    ...product,
    discountPrice: product.discount_price || product.price,
    image:
      product.images && product.images.length > 0
        ? product.images[0]
        : "https://via.placeholder.com/300x300?text=No+Image",
  }));

  const toggleBrandFilter = (brand) => {
    let newBrands;
    if (selectedBrands.includes(brand)) {
      newBrands = selectedBrands.filter((b) => b !== brand);
    } else {
      newBrands = [...selectedBrands, brand];
    }
    setSelectedBrands(newBrands);
    
    // Update URL parameters
    updateURLParams({ brands: newBrands });
  };
  
  // Function to update URL parameters based on current filters
  const updateURLParams = (updates = {}) => {
    const params = new URLSearchParams(searchParams);
    
    // Update brands
    const brands = updates.brands !== undefined ? updates.brands : selectedBrands;
    if (brands.length > 0) {
      params.set('brand', brands[0]); // For simplicity, use first brand in URL
    } else {
      params.delete('brand');
    }
    
    // Update price range
    const priceMin = updates.priceMin !== undefined ? updates.priceMin : priceRange.min;
    const priceMax = updates.priceMax !== undefined ? updates.priceMax : priceRange.max;
    if (priceMin > 0) {
      params.set('priceMin', priceMin.toString());
    } else {
      params.delete('priceMin');
    }
    if (priceMax < 150000) {
      params.set('priceMax', priceMax.toString());
    } else {
      params.delete('priceMax');
    }
    
    // Update sort
    const sort = updates.sort !== undefined ? updates.sort : sortBy;
    if (sort !== 'popularity') {
      params.set('sort', sort);
    } else {
      params.delete('sort');
    }
    
    // Update rating
    const rating = updates.rating !== undefined ? updates.rating : selectedRating;
    if (rating > 0) {
      params.set('rating', rating.toString());
    } else {
      params.delete('rating');
    }
    
    // Update discount
    const discount = updates.discount !== undefined ? updates.discount : selectedDiscount;
    if (discount) {
      params.set('discount', discount.toString());
    } else {
      params.delete('discount');
    }
    
    // Update the URL
    setSearchParams(params);
  };
  // This function is now handled within the ProductFilter component

  const applyFilters = () => {
    let filteredProducts = [...transformedProducts];

    // Apply brand filter
    if (selectedBrands.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        selectedBrands.includes(product.brand)
      );
    }

    // Apply category filter from URL if present
    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply selected categories filter
    if (selectedCategories.length > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        selectedCategories.includes(product.category)
      );
    }

    // Apply price range filter
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.discountPrice >= priceRange.min &&
        product.discountPrice <= priceRange.max
    );

    // Apply rating filter
    if (selectedRating > 0) {
      filteredProducts = filteredProducts.filter(
        (product) => Math.round(product.rating || 0) >= selectedRating
      );
    }

    // Apply stock filter
    if (stockFilters.inStock && !stockFilters.outOfStock) {
      filteredProducts = filteredProducts.filter(
        (product) => product.stock > 0
      );
    } else if (!stockFilters.inStock && stockFilters.outOfStock) {
      filteredProducts = filteredProducts.filter(
        (product) => product.stock <= 0
      );
    } // Apply storage filter
    if (selectedStorage.length > 0) {
      filteredProducts = filteredProducts.filter((product) => {
        // Check if product has variant.storage and if any match the selected storage
        if (product.variant && Array.isArray(product.variant.storage)) {
          return product.variant.storage.some((storage) =>
            selectedStorage.includes(storage)
          );
        }
        // Check if product has valid_options with storage and if any match the selected storage
        if (product.valid_options && Array.isArray(product.valid_options)) {
          return product.valid_options.some(
            (option) =>
              option.storage && selectedStorage.includes(option.storage)
          );
        }
        return false;
      });
    }

    // Apply RAM filter
    if (selectedRAM.length > 0) {
      filteredProducts = filteredProducts.filter((product) => {
        // Check if product has valid_options with ram and if any match the selected RAM
        if (product.valid_options && Array.isArray(product.valid_options)) {
          return product.valid_options.some(
            (option) => option.ram && selectedRAM.includes(option.ram)
          );
        }
        return false;
      });
    }

    // Apply color filter
    if (selectedColors.length > 0) {
      filteredProducts = filteredProducts.filter((product) => {
        // Check if product has variant.colors and if any match the selected colors
        if (product.variant && Array.isArray(product.variant.colors)) {
          return product.variant.colors.some((color) =>
            selectedColors.includes(color)
          );
        }
        // Check if product has valid_options with colors and if any match the selected colors
        if (product.valid_options && Array.isArray(product.valid_options)) {
          return product.valid_options.some(
            (option) => option.colors && selectedColors.includes(option.colors)
          );
        }
        return false;
      });
    }

    // Apply dynamic attribute filters
    if (selectedAttributes && Object.keys(selectedAttributes).length > 0) {
      filteredProducts = filteredProducts.filter((product) => {
        return Object.entries(selectedAttributes).every(
          ([attributeKey, selectedValues]) => {
            if (!selectedValues || selectedValues.length === 0) return true;

            // Check in product attributes
            if (product.attributes && product.attributes[attributeKey]) {
              return selectedValues.includes(product.attributes[attributeKey]);
            }

            // Check in valid_options
            if (product.valid_options && Array.isArray(product.valid_options)) {
              return product.valid_options.some(
                (option) =>
                  option[attributeKey] &&
                  selectedValues.includes(option[attributeKey])
              );
            }

            return false;
          }
        );
      });
    }

    // Apply discount filter
    if (selectedDiscount !== null) {
      filteredProducts = filteredProducts.filter((product) => {
        // Calculate discount percentage
        const discountPercentage =
          product.price && product.discountPrice
            ? Math.round(
                ((product.price - product.discountPrice) / product.price) * 100
              )
            : 0;

        return discountPercentage >= selectedDiscount;
      });
    }

    // Apply sorting
    if (sortBy === "price-low") {
      filteredProducts.sort((a, b) => a.discountPrice - b.discountPrice);
    } else if (sortBy === "price-high") {
      filteredProducts.sort((a, b) => b.discountPrice - a.discountPrice);
    } else if (sortBy === "rating") {
      filteredProducts.sort((a, b) => {
        const ratingA =
          a.rating !== undefined && a.rating !== null ? a.rating : 0;
        const ratingB =
          b.rating !== undefined && b.rating !== null ? b.rating : 0;
        return ratingB - ratingA;
      });
    }

    return filteredProducts;
  };

  const filteredProducts = applyFilters();

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
  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedBrands,
    priceRange,
    sortBy,
    selectedRating,
    stockFilters,
    selectedStorage,
    selectedRAM,
    selectedColors,
    selectedCategories,
    selectedDiscount,
    selectedAttributes,
    category,
  ]);

  // Add resetFilters function
  const resetFilters = () => {
    setSelectedBrands([]);
    setPriceRange({ min: 0, max: 150000 });
    setSortBy("popularity");
    setSelectedRating(0);
    setStockFilters({ inStock: false, outOfStock: false });
    setSelectedStorage([]);
    setSelectedRAM([]);
    setSelectedColors([]);
    setSelectedCategories([]);
    setSelectedDiscount(null);
    setSelectedAttributes({});
    
    // Clear URL parameters while keeping the category path
    const currentPath = category ? `/category/${category}` : '/products';
    navigate(currentPath, { replace: true });
    console.log('🧹 All filters cleared and URL updated');
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
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {category
              ? category.charAt(0).toUpperCase() +
                category.slice(1).replace("-", " ")
              : "All Products"}
          </h1>
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <ProductFilter
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            brands={brands}
            products={transformedProducts}
            currentCategory={category}
            selectedBrands={selectedBrands}
            toggleBrandFilter={toggleBrandFilter}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            setSelectedBrands={setSelectedBrands}
            stockFilters={stockFilters}
            setStockFilters={setStockFilters}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            selectedStorage={selectedStorage}
            setSelectedStorage={setSelectedStorage}
            selectedRAM={selectedRAM}
            setSelectedRAM={setSelectedRAM}
            selectedColors={selectedColors}
            setSelectedColors={setSelectedColors}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedDiscount={selectedDiscount}
            setSelectedDiscount={setSelectedDiscount}
            selectedAttributes={selectedAttributes}
            setSelectedAttributes={setSelectedAttributes}
            resetFilters={resetFilters}
            updateURLParams={updateURLParams}
          />
          {/* Product Grid */}
          <div className="w-full md:w-3/4">
            {/* Results Header */}
            <ProductSorting sortBy={sortBy} setSortBy={setSortBy} />
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

export default ProductList;
