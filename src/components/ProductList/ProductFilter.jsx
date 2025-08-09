import { useState, useEffect, useMemo } from "react";
import { FiFilter, FiChevronDown, FiChevronUp, FiX } from "react-icons/fi";
import Button from "../ui/Button";
import ProductService from "../../services/productService";

const ProductFilter = ({
  showFilters,
  setShowFilters,
  brands,
  products = [], // Add products prop to extract dynamic filters
  currentCategory, // Add current category prop
  selectedBrands,
  toggleBrandFilter,
  priceRange,
  setPriceRange,
  setSelectedBrands,
  stockFilters,
  setStockFilters,
  selectedRating,
  setSelectedRating,
  selectedStorage,
  setSelectedStorage,
  selectedRAM,
  setSelectedRAM,
  selectedColors,
  setSelectedColors,
  selectedCategories,
  setSelectedCategories,
  selectedDiscount,
  setSelectedDiscount,
  // Add new filter states for dynamic attributes
  selectedAttributes,
  setSelectedAttributes,
  // URL parameter handling functions
  resetFilters, // Function to reset all filters and clear URL
  updateURLParams, // Function to update URL parameters
}) => {
  // State for accordion sections - dynamically add sections based on available attributes
  const [openSections, setOpenSections] = useState({
    price: true,
    stock: false,
    rating: false,
    discount: false,
    brands: false,
    storage: false,
    ram: false,
    colors: false,
    category: false,
    // Dynamic sections will be added here
  });
  // Dynamic filter extraction from products
  const dynamicFilters = useMemo(() => {
    if (!products || products.length === 0) {
      return {
        storageOptions: [],
        ramOptions: [],
        colorOptions: [],
        categoryOptions: [],
        attributeOptions: {},
        validOptionKeys: [],
      };
    }

    // Filter products by current category first
    let categoryProducts = products;
    if (currentCategory) {
      const formattedCategory = currentCategory.replace("-", " ");
      categoryProducts = products.filter(
        (product) =>
          product.category.toLowerCase() === formattedCategory.toLowerCase()
      );
    }

    const storageSet = new Set();
    const ramSet = new Set();
    const colorSet = new Set();
    const categorySet = new Set();
    const attributeOptionsMap = {};
    const validOptionKeysSet = new Set();
    categoryProducts.forEach((product) => {
      // Extract from variant data
      if (product.variant) {
        if (product.variant.storage) {
          product.variant.storage.forEach((storage) => {
            if (storage && storage.trim()) storageSet.add(storage.trim());
          });
        }
        if (product.variant.colors) {
          product.variant.colors.forEach((color) => {
            if (color && color.trim()) colorSet.add(color.trim());
          });
        }
      } // Extract from valid_options
      if (product.valid_options && Array.isArray(product.valid_options)) {
        product.valid_options.forEach((option) => {
          Object.keys(option).forEach((key) => {
            // Skip system fields but include all variant/option fields
            if (
              ![
                "id",
                "stock",
                "price",
                "discounted_price",
                "product_id",
              ].includes(key)
            ) {
              validOptionKeysSet.add(key);

              const value = option[key];
              if (value && typeof value === "string" && value.trim()) {
                if (key === "storage") {
                  storageSet.add(value.trim());
                } else if (key === "ram") {
                  ramSet.add(value.trim());
                } else if (key === "colors") {
                  colorSet.add(value.trim());
                } else {
                  // For all other attributes, create dynamic filter groups
                  if (!attributeOptionsMap[key]) {
                    attributeOptionsMap[key] = new Set();
                  }
                  attributeOptionsMap[key].add(value.trim());
                }
              }
            }
          });
        });
      }

      // Extract from attributes
      if (product.attributes && typeof product.attributes === "object") {
        Object.keys(product.attributes).forEach((key) => {
          const value = product.attributes[key];
          if (value && typeof value === "string" && value.trim()) {
            validOptionKeysSet.add(key);
            if (!attributeOptionsMap[key]) {
              attributeOptionsMap[key] = new Set();
            }
            attributeOptionsMap[key].add(value.trim());
          }
        });
      }

      // Extract categories
      if (product.category && product.category.trim()) {
        categorySet.add(product.category.trim());
      }
    }); // Convert sets to arrays with counts
    const getOptionsWithCounts = (valueSet, products, checkFunction) => {
      return Array.from(valueSet)
        .map((value) => ({
          label: value,
          count: products.filter(checkFunction(value)).length,
        }))
        .sort((a, b) => b.count - a.count);
    };

    const storageOptions = getOptionsWithCounts(
      storageSet,
      categoryProducts,
      (storage) => (product) => {
        return (
          product.variant?.storage?.includes(storage) ||
          product.valid_options?.some((opt) => opt.storage === storage)
        );
      }
    );

    const ramOptions = getOptionsWithCounts(
      ramSet,
      categoryProducts,
      (ram) => (product) => {
        return product.valid_options?.some((opt) => opt.ram === ram);
      }
    );

    const colorOptions = getOptionsWithCounts(
      colorSet,
      categoryProducts,
      (color) => (product) => {
        return (
          product.variant?.colors?.includes(color) ||
          product.valid_options?.some((opt) => opt.colors === color)
        );
      }
    );

    const categoryOptions = getOptionsWithCounts(
      categorySet,
      categoryProducts,
      (category) => (product) => product.category === category
    );

    // Convert attribute sets to arrays with counts
    const attributeOptions = {};
    Object.keys(attributeOptionsMap).forEach((key) => {
      attributeOptions[key] = getOptionsWithCounts(
        attributeOptionsMap[key],
        categoryProducts,
        (value) => (product) => {
          return (
            product.attributes?.[key] === value ||
            product.valid_options?.some((opt) => opt[key] === value)
          );
        }
      );
    });
    return {
      storageOptions,
      ramOptions,
      colorOptions,
      categoryOptions,
      attributeOptions,
      validOptionKeys: Array.from(validOptionKeysSet).filter(
        (key) =>
          ![
            "storage",
            "ram",
            "colors",
            "product_id",
            "custom_keys",
            "custom_values",
          ].includes(key)
      ),
    };
  }, [products, currentCategory]);
  // Extract the options
  const {
    storageOptions,
    ramOptions,
    colorOptions,
    categoryOptions,
    attributeOptions,
    validOptionKeys,
  } = dynamicFilters;

  // Filter brands based on current category
  const filteredBrands = useMemo(() => {
    if (!currentCategory || !products || products.length === 0) {
      return brands;
    }

    const formattedCategory = currentCategory.replace("-", " ");
    const categoryProducts = products.filter(
      (product) =>
        product.category.toLowerCase() === formattedCategory.toLowerCase()
    );

    const categoryBrands = new Set();
    categoryProducts.forEach((product) => {
      if (product.brand && product.brand.trim()) {
        categoryBrands.add(product.brand.trim());
      }
    });

    return brands.filter((brand) => categoryBrands.has(brand));
  }, [brands, products, currentCategory]);
  // Toggle accordion section
  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Add function to handle dynamic attribute filters
  const toggleAttributeFilter = (attributeKey, value) => {
    const currentValues = selectedAttributes?.[attributeKey] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    setSelectedAttributes({
      ...selectedAttributes,
      [attributeKey]: newValues,
    });
  };

  // Update openSections to include dynamic attributes
  useEffect(() => {
    if (validOptionKeys.length > 0) {
      setOpenSections((prev) => {
        const newSections = { ...prev };
        validOptionKeys.forEach((key) => {
          if (!(key in newSections)) {
            newSections[key] = false;
          }
        });
        return newSections;
      });
    }
  }, [validOptionKeys]);

  // Handle min-max price input and GO button
  const [minPrice, setMinPrice] = useState(priceRange.min || 0);
  const [maxPrice, setMaxPrice] = useState(priceRange.max || 150000);

  const handlePriceInputChange = (e, type) => {
    const value = parseInt(e.target.value) || 0;
    if (type === "min") {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
  };

  const applyPriceRange = () => {
    setPriceRange({ min: minPrice, max: maxPrice });
    
    // Update URL parameters if function is available
    if (updateURLParams) {
      updateURLParams({ 
        priceMin: minPrice, 
        priceMax: maxPrice 
      });
    }
  };

  // Toggle stock filter
  const toggleStockFilter = (type) => {
    setStockFilters({
      ...stockFilters,
      [type]: !stockFilters[type],
    });
  };

  // Toggle storage filter
  const toggleStorageFilter = (storage) => {
    if (selectedStorage.includes(storage)) {
      setSelectedStorage(selectedStorage.filter((item) => item !== storage));
    } else {
      setSelectedStorage([...selectedStorage, storage]);
    }
  };

  // Toggle RAM filter
  const toggleRAMFilter = (ram) => {
    if (selectedRAM.includes(ram)) {
      setSelectedRAM(selectedRAM.filter((item) => item !== ram));
    } else {
      setSelectedRAM([...selectedRAM, ram]);
    }
  };

  // Toggle color filter
  const toggleColorFilter = (color) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter((item) => item !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  // Toggle category filter
  const toggleCategoryFilter = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter((item) => item !== category)
      );
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Set discount filter
  const handleDiscountFilter = (discount) => {
    setSelectedDiscount(selectedDiscount === discount ? null : discount);
  };
  // Reset all filters
  const resetAllFilters = () => {
    if (resetFilters) {
      // Use the parent's reset function which also handles URL clearing
      resetFilters();
    } else {
      // Fallback to local state reset if resetFilters prop is not provided
      setSelectedBrands([]);
      setPriceRange({ min: 0, max: 150000 });
      setMinPrice(0);
      setMaxPrice(150000);
      setSelectedRating(0);
      setStockFilters({ inStock: false, outOfStock: false });
      setSelectedStorage([]);
      setSelectedRAM([]);
      setSelectedColors([]);
      setSelectedCategories([]);
      setSelectedDiscount(null);
      // Reset dynamic attributes
      if (setSelectedAttributes) {
        setSelectedAttributes({});
      }
    }
  };
  // Update minPrice and maxPrice when priceRange changes
  useEffect(() => {
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
  }, [priceRange]);

  // Discount options
  const discountOptions = [
    { label: "50% or more", value: 50 },
    { label: "40% or more", value: 40 },
    { label: "30% or more", value: 30 },
    { label: "20% or more", value: 20 },
    { label: "10% or more", value: 10 },
  ];

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="w-full md:hidden mb-4">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 py-2.5"
          variant="outline"
          icon={<FiFilter size={18} />}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {/* Filter Sidebar */}
      <div
        className={`
          ${showFilters ? "block" : "hidden md:block"}
          w-full md:w-1/4 rounded-lg overflow-hidden transition-all duration-300
        `}
        style={{
          backgroundColor: "var(--bg-primary)",
          boxShadow: "var(--shadow-small)",
        }}
      >
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <h2
            className="text-base font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Filters
          </h2>
          <button
            onClick={resetAllFilters}
            className="text-sm font-medium hover:underline transition-all duration-200"
            style={{ color: "var(--brand-primary)" }}
          >
            Clear
          </button>
        </div>
        {/* Price Filter */}
        <div
          className="border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection("price")}
          >
            <h3
              className="font-medium text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              PRICE
            </h3>
            {openSections.price ? (
              <FiChevronUp
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            ) : (
              <FiChevronDown
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            )}
          </div>

          {openSections.price && (
            <div className="px-4 pb-4">
              <div className="mb-2 flex items-center justify-between">
                <span
                  className="text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  ₹ {minPrice.toLocaleString()}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  ₹ {maxPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div
                  className="flex items-center border rounded-md px-2"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  <span
                    className="text-sm mr-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => handlePriceInputChange(e, "min")}
                    className="w-16 py-1 text-sm outline-none"
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <span style={{ color: "var(--text-secondary)" }}>-</span>
                <div
                  className="flex items-center border rounded-md px-2"
                  style={{ borderColor: "var(--border-primary)" }}
                >
                  <span
                    className="text-sm mr-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => handlePriceInputChange(e, "max")}
                    className="w-16 py-1 text-sm outline-none"
                    style={{
                      backgroundColor: "transparent",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
                <button
                  onClick={applyPriceRange}
                  className="px-3 py-1 text-sm rounded-md"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                    color: "var(--text-on-brand)",
                  }}
                >
                  Go
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Stock Status */}
        <div
          className="border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection("stock")}
          >
            <h3
              className="font-medium text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              STOCK STATUS
            </h3>
            {openSections.stock ? (
              <FiChevronUp
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            ) : (
              <FiChevronDown
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            )}
          </div>

          {openSections.stock && (
            <div className="px-4 pb-4 space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="in-stock"
                  checked={stockFilters.inStock}
                  onChange={() => toggleStockFilter("inStock")}
                  className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                  style={{ accentColor: "var(--brand-primary)" }}
                />
                <label
                  htmlFor="in-stock"
                  className="ml-3 cursor-pointer text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  In Stock
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="out-of-stock"
                  checked={stockFilters.outOfStock}
                  onChange={() => toggleStockFilter("outOfStock")}
                  className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                  style={{ accentColor: "var(--brand-primary)" }}
                />
                <label
                  htmlFor="out-of-stock"
                  className="ml-3 cursor-pointer text-sm"
                  style={{ color: "var(--text-primary)" }}
                >
                  Out Of Stock
                </label>
              </div>
            </div>
          )}
        </div>
        {/* Rating */}
        <div
          className="border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection("rating")}
          >
            <h3
              className="font-medium text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              RATING
            </h3>
            {openSections.rating ? (
              <FiChevronUp
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            ) : (
              <FiChevronDown
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            )}
          </div>

          {openSections.rating && (
            <div className="px-4 pb-4 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div
                  key={rating}
                  className="flex items-center cursor-pointer"
                  onClick={() =>
                    setSelectedRating(selectedRating === rating ? 0 : rating)
                  }
                >
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className="text-lg">
                        {i < rating ? (
                          <span style={{ color: "var(--warning-color)" }}>★</span>
                        ) : (
                          <span style={{ color: "#E4E5E8" }}>★</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Discount Section */}
        <div
          className="border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection("discount")}
          >
            <h3
              className="font-medium text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              DISCOUNT
            </h3>
            {openSections.discount ? (
              <FiChevronUp
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            ) : (
              <FiChevronDown
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            )}
          </div>

          {openSections.discount && (
            <div className="px-4 pb-4 space-y-2">
              {discountOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center"
                  onClick={() => handleDiscountFilter(option.value)}
                >
                  <input
                    type="radio"
                    id={`discount-${option.value}`}
                    checked={selectedDiscount === option.value}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                    style={{ accentColor: "var(--brand-primary)" }}
                  />
                  <label
                    htmlFor={`discount-${option.value}`}
                    className="ml-3 cursor-pointer text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Brands Filter */}
        <div
          className="border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection("brands")}
          >
            <h3
              className="font-medium text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              BRANDS
            </h3>
            {openSections.brands ? (
              <FiChevronUp
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            ) : (
              <FiChevronDown
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            )}
          </div>
          {openSections.brands && (
            <div className="px-4 pb-4 space-y-2">
              {filteredBrands.map((brand) => (
                <div key={brand} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`brand-${brand}`}
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrandFilter(brand)}
                    className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                    style={{ accentColor: "var(--brand-primary)" }}
                  />
                  <label
                    htmlFor={`brand-${brand}`}
                    className="ml-3 cursor-pointer text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Category Filter - Only show when no specific category is selected */}
        {!currentCategory && (
          <div
            className="border-b"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <div
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleSection("category")}
            >
              <h3
                className="font-medium text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                CATEGORY
              </h3>
              {openSections.category ? (
                <FiChevronUp
                  size={18}
                  style={{ color: "var(--text-secondary)" }}
                />
              ) : (
                <FiChevronDown
                  size={18}
                  style={{ color: "var(--text-secondary)" }}
                />
              )}
            </div>

            {openSections.category && (
              <div className="px-4 pb-4 space-y-2">
                {categoryOptions.map((option) => (
                  <div key={option.label} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${option.label}`}
                      checked={selectedCategories.includes(option.label)}
                      onChange={() => toggleCategoryFilter(option.label)}
                      className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                      style={{ accentColor: "var(--brand-primary)" }}
                    />
                    <label
                      htmlFor={`category-${option.label}`}
                      className="ml-3 cursor-pointer text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {option.label} ({option.count})
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Internal Storage */}
        <div
          className="border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection("storage")}
          >
            <h3
              className="font-medium text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              INTERNAL STORAGE
            </h3>
            {openSections.storage ? (
              <FiChevronUp
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            ) : (
              <FiChevronDown
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            )}
          </div>

          {openSections.storage && (
            <div className="px-4 pb-4 space-y-2">
              {storageOptions.map((option) => (
                <div key={option.label} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`storage-${option.label}`}
                    checked={selectedStorage.includes(option.label)}
                    onChange={() => toggleStorageFilter(option.label)}
                    className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                    style={{ accentColor: "var(--brand-primary)" }}
                  />
                  <label
                    htmlFor={`storage-${option.label}`}
                    className="ml-3 cursor-pointer text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {option.label} ({option.count})
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* RAM */}
        <div
          className="border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection("ram")}
          >
            <h3
              className="font-medium text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              RAM
            </h3>
            {openSections.ram ? (
              <FiChevronUp
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            ) : (
              <FiChevronDown
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            )}
          </div>

          {openSections.ram && (
            <div className="px-4 pb-4 space-y-2">
              {ramOptions.map((option) => (
                <div key={option.label} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`ram-${option.label}`}
                    checked={selectedRAM.includes(option.label)}
                    onChange={() => toggleRAMFilter(option.label)}
                    className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                    style={{ accentColor: "var(--brand-primary)" }}
                  />
                  <label
                    htmlFor={`ram-${option.label}`}
                    className="ml-3 cursor-pointer text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {option.label} ({option.count})
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Colors */}
        <div
          className="border-b"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <div
            className="flex justify-between items-center p-4 cursor-pointer"
            onClick={() => toggleSection("colors")}
          >
            <h3
              className="font-medium text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              COLOR
            </h3>
            {openSections.colors ? (
              <FiChevronUp
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            ) : (
              <FiChevronDown
                size={18}
                style={{ color: "var(--text-secondary)" }}
              />
            )}
          </div>

          {openSections.colors && (
            <div className="px-4 pb-4 space-y-2">
              {colorOptions.map((option) => (
                <div key={option.label} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`color-${option.label}`}
                    checked={selectedColors.includes(option.label)}
                    onChange={() => toggleColorFilter(option.label)}
                    className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                    style={{ accentColor: "var(--brand-primary)" }}
                  />
                  <label
                    htmlFor={`color-${option.label}`}
                    className="ml-3 cursor-pointer text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {option.label} ({option.count})
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Dynamic Attribute Filters */}
        {validOptionKeys.map(
          (attributeKey) =>
            attributeOptions[attributeKey] &&
            attributeOptions[attributeKey].length > 0 && (
              <div
                key={attributeKey}
                className="border-b"
                style={{ borderColor: "var(--border-primary)" }}
              >
                <div
                  className="flex justify-between items-center p-4 cursor-pointer"
                  onClick={() => toggleSection(attributeKey)}
                >
                  <h3
                    className="font-medium text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {attributeKey.toUpperCase().replace(/_/g, " ")}
                  </h3>
                  {openSections[attributeKey] ? (
                    <FiChevronUp
                      size={18}
                      style={{ color: "var(--text-secondary)" }}
                    />
                  ) : (
                    <FiChevronDown
                      size={18}
                      style={{ color: "var(--text-secondary)" }}
                    />
                  )}
                </div>

                {openSections[attributeKey] && (
                  <div className="px-4 pb-4 space-y-2">
                    {attributeOptions[attributeKey]?.map((option) => (
                      <div key={option.label} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${attributeKey}-${option.label}`}
                          checked={
                            selectedAttributes?.[attributeKey]?.includes(
                              option.label
                            ) || false
                          }
                          onChange={() =>
                            toggleAttributeFilter(attributeKey, option.label)
                          }
                          className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                          style={{ accentColor: "var(--brand-primary)" }}
                        />
                        <label
                          htmlFor={`${attributeKey}-${option.label}`}
                          className="ml-3 cursor-pointer text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {option.label} ({option.count})
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
        )}
        {/* Apply Filters Button (Mobile Only) */}
        <div className="md:hidden p-4">
          <Button
            onClick={() => setShowFilters(false)}
            fullWidth={true}
            variant="primary"
            className="py-2.5 text-sm font-medium"
            style={{
              backgroundColor: "var(--brand-primary)",
              color: "var(--text-on-brand)",
            }}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProductFilter;
