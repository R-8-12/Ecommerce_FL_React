import { useState, useEffect, useRef, useCallback } from "react";
import {
  FiSearch,
  FiShoppingCart,
  FiUser,
  FiMapPin,
  FiHeart,
  FiMenu,
  FiX,
  FiCalendar,
} from "react-icons/fi";
import { ROUTES } from "../utils/constants";
import Logo from "./ui/Logo";
import ThemeToggle from "./ui/ThemeToggle";
import { useAuthStore } from "../store/useAuth";
import { useCartStore } from "../store/useCart";
import { useWishlistStore } from "../store/useWishlist";
import { Link, useNavigate } from "react-router-dom";
import { useProductStore } from "../store/useProduct";
import { useBannerStore } from "../store/Admin/useBannerStore";
import WalletComponent from "./gamification/WalletComponent";

// FIX 1: Add a reusable 'useOutsideClick' hook for clean "click-outside" logic
const useOutsideClick = (callback) => {
  const ref = useRef();

  useEffect(() => {
    const handleClick = (event) => {
      // Improved outside click detection
      if (ref.current && !ref.current.contains(event.target)) {
        // Check if click is on a navigation link - if so, delay the callback
        if (event.target.closest('a[href]')) {
          setTimeout(callback, 150);
        } else {
          callback();
        }
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [ref, callback]);

  return ref;
};


const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const desktopSuggestionsRef = useRef(null);
  const mobileSuggestionsRef = useRef(null);
  const cartWishlistInitialized = useRef(false);
  const { isAuthenticated } = useAuthStore();
  const { itemCount: cartItemCount, totalAmount, fetchCart } = useCartStore();
  const { items: wishlistItems, fetchWishlist } = useWishlistStore();
  const productsInitialized = useRef(false);
  const { searchProducts, fetchProducts } = useProductStore();
  const { getDropdownBanners } = useBannerStore();
  const [location, setLocation] = useState({
    city: "Bhopal",
    loading: false,
    error: null,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // FIX 2: Refactored state and handlers for a robust Mega Menu
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [closeTimer, setCloseTimer] = useState(null);

  const closeDropdown = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  const megaMenuRef = useOutsideClick(closeDropdown);

  const handleDropdownEnter = () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      setCloseTimer(null);
    }
  };

  const handleDropdownLeave = () => {
    // Longer delay to allow users to navigate to dropdown content
    const timer = setTimeout(() => {
      closeDropdown();
    }, 300);
    setCloseTimer(timer);
  };

  const handleDropdownToggle = (categoryId) => {
    if (activeDropdown === categoryId) {
      closeDropdown();
    } else {
      setActiveDropdown(categoryId);
    }
  };

  const handleDropdownKeyDown = (e, categoryId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDropdownToggle(categoryId);
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  };
  
  // FIX 3: Enhanced link click handler that delays dropdown closing to allow navigation
  const handleLinkClick = () => {
    // Add small delay to ensure navigation happens before dropdown closes
    setTimeout(() => {
      closeDropdown();
    }, 100);
  };

  // Enhanced mega menu structure matching Poorvika's comprehensive layout
  const megaMenuCategories = [
    {
      id: 1,
      name: "Mobiles & Accessories",
      path: "/category/smartphones",
      banners: [
        {
          image: "/mobile1.png",
          title: "Latest iPhones",
          subtitle: "Up to 25% OFF",
          buttonText: "Shop Now",
          link: "/category/smartphones?brand=Apple"
        },
        {
          image: "/accessories.png",
          title: "Mobile Accessories",
          subtitle: "Starting ₹99",
          buttonText: "Explore",
          link: "/category/accessories"
        }
      ],
      subcategories: [
        {
          title: "Smartphones",
          items: [
            { name: "Apple iPhone", path: "/category/smartphones?brand=Apple", hot: true },
            { name: "Samsung Galaxy", path: "/category/smartphones?brand=Samsung", popular: true },
            { name: "Xiaomi Redmi", path: "/category/smartphones?brand=MI" },
            { name: "OnePlus", path: "/category/smartphones?brand=Oneplus" },
            { name: "Oppo", path: "/category/smartphones?brand=Oppo" },
            { name: "Vivo", path: "/category/smartphones?brand=Vivo" },
            { name: "Nothing Phone", path: "/category/smartphones?brand=Nothing", new: true },
            { name: "Motorola", path: "/category/smartphones?brand=Motorola" },
          ],
        },
        {
          title: "Mobile Accessories", 
          items: [
            { name: "Cases & Covers", path: "/category/accessories?type=cases", popular: true },
            { name: "Screen Protectors", path: "/category/accessories?type=screen-guards" },
            { name: "Chargers & Cables", path: "/category/accessories?type=chargers" },
            { name: "Power Banks", path: "/category/accessories?type=powerbanks" },
            { name: "Mobile Holders", path: "/category/accessories?type=holders" },
            { name: "Headphones", path: "/category/accessories?type=headphones" },
            { name: "Memory Cards", path: "/category/accessories?type=memory" },
            { name: "Bluetooth Speakers", path: "/category/accessories?type=speakers" },
          ],
        },
        {
          title: "By Price Range",
          items: [
            { name: "Under ₹15,000", path: "/category/smartphones?price_max=15000" },
            { name: "₹15,000 - ₹25,000", path: "/category/smartphones?price_min=15000&price_max=25000" },
            { name: "₹25,000 - ₹50,000", path: "/category/smartphones?price_min=25000&price_max=50000" },
            { name: "Above ₹50,000", path: "/category/smartphones?price_min=50000", premium: true },
          ],
        },
        {
          title: "Popular Brands",
          items: [
            { name: "Apple Store", path: "/category/smartphones?brand=Apple", premium: true },
            { name: "Samsung", path: "/category/smartphones?brand=Samsung" },
            { name: "Xiaomi", path: "/category/smartphones?brand=MI" },
            { name: "OnePlus", path: "/category/smartphones?brand=Oneplus" },
            { name: "Realme", path: "/category/smartphones?brand=Realme" },
            { name: "iQOO", path: "/category/smartphones?brand=iQOO", hot: true },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Computers & Tablets",
      path: "/category/laptops",
      banners: [
        {
          image: "/laptops.png",
          title: "Gaming Laptops",
          subtitle: "Up to 30% OFF",
          buttonText: "Shop Now",
          link: "/category/laptops?type=gaming"
        },
        {
          image: "/tablets1.png",
          title: "Premium Tablets", 
          subtitle: "Starting ₹15,999",
          buttonText: "Explore",
          link: "/category/tablets"
        }
      ],
      subcategories: [
        {
          title: "Laptops",
          items: [
            { name: "MacBooks", path: "/category/laptops?brand=Apple", premium: true },
            { name: "Gaming Laptops", path: "/category/laptops?type=gaming", hot: true },
            { name: "Business Laptops", path: "/category/laptops?type=business" },
            { name: "Student Laptops", path: "/category/laptops?type=student" },
            { name: "2-in-1 Laptops", path: "/category/laptops?type=convertible" },
            { name: "Ultrabooks", path: "/category/laptops?type=ultrabook" },
            { name: "Workstations", path: "/category/laptops?type=workstation" },
          ],
        },
        {
          title: "Tablets & iPads",
          items: [
            { name: "Apple iPad", path: "/category/tablets?brand=Apple", premium: true },
            { name: "Samsung Galaxy Tab", path: "/category/tablets?brand=Samsung", popular: true },
            { name: "Xiaomi Pad", path: "/category/tablets?brand=MI" },
            { name: "OnePlus Pad", path: "/category/tablets?brand=Oneplus", new: true },
            { name: "Realme Pad", path: "/category/tablets?brand=Realme" },
            { name: "Lenovo Tab", path: "/category/tablets?brand=Lenovo" },
          ],
        },
        {
          title: "Computer Accessories",
          items: [
            { name: "Wireless Mouse", path: "/category/accessories?type=mouse" },
            { name: "Mechanical Keyboards", path: "/category/accessories?type=keyboards", popular: true },
            { name: "Laptop Bags", path: "/category/accessories?type=bags" },
            { name: "Laptop Stands", path: "/category/accessories?type=stands" },
            { name: "Webcams", path: "/category/accessories?type=webcams" },
            { name: "USB Hubs", path: "/category/accessories?type=hubs" },
          ],
        },
        {
          title: "By Brand",
          items: [
            { name: "Apple", path: "/category/laptops?brand=Apple", premium: true },
            { name: "HP", path: "/category/laptops?brand=HP" },
            { name: "Dell", path: "/category/laptops?brand=Dell" },
            { name: "Lenovo", path: "/category/laptops?brand=Lenovo" },
            { name: "Asus", path: "/category/laptops?brand=Asus" },
            { name: "Acer", path: "/category/laptops?brand=Acer" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "TV & Audio",
      path: "/category/televisions",
      banners: [
        {
          image: "/tv1.png",
          title: "Smart TVs",
          subtitle: "Up to 40% OFF",
          link: "/category/televisions"
        },
        {
          image: "/accessories.png",
          title: "Audio Devices",
          subtitle: "Premium Sound",
          link: "/category/audio"
        }
      ],
      subcategories: [
        {
          title: "Smart TVs",
          items: [
            {
              name: "Xiaomi Smart TV",
              path: "/category/televisions?brand=Xiaomi",
              brands: ["Xiaomi"],
            },
            {
              name: "Mi TV",
              path: "/category/televisions?brand=Mi",
              brands: ["Mi"],
            },
            {
              name: "Cellecor TV",
              path: "/category/televisions?brand=Cellecor",
              brands: ["Cellecor"],
            },
            { name: "4K TVs", path: "/category/televisions?resolution=4K" },
            {
              name: "Full HD TVs",
              path: "/category/televisions?resolution=Full HD",
            },
            { name: "Android TVs", path: "/category/televisions?os=Android" },
          ],
        },
        {
          title: "Audio Devices",
          items: [
            {
              name: "Bluetooth Speakers",
              path: "/category/speakers?type=bluetooth",
            },
            {
              name: "Wireless Speakers",
              path: "/category/speakers?type=wireless",
            },
            {
              name: "Portable Speakers",
              path: "/category/speakers?type=portable",
            },
            { name: "Home Audio", path: "/category/speakers?type=home-audio" },
          ],
        },
        {
          title: "Audio Brands",
          items: [
            {
              name: "JBL",
              path: "/category/speakers?brand=JBL",
              brands: ["JBL"],
            },
            {
              name: "boAt",
              path: "/category/speakers?brand=Boat",
              brands: ["Boat"],
            },
            {
              name: "Zebronics",
              path: "/category/speakers?brand=Zebronics",
              brands: ["Zebronics"],
            },
            {
              name: "Digitek",
              path: "/category/speakers?brand=Digiteck",
              brands: ["Digiteck"],
            },
            {
              name: "Edifier",
              path: "/category/speakers?brand=Edifier",
              brands: ["Edifier"],
            },
            {
              name: "Ultra Prolink",
              path: "/category/speakers?brand=Ultra Prolink",
              brands: ["Ultra Prolink"],
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: "Smart Technology",
      path: "/category/smartwatches",
      banners: [
        {
          image: "/accessories.png",
          title: "Smart Watches",
          subtitle: "Latest Collection",
          link: "/category/smartwatches"
        },
        {
          image: "/mobile1.png",
          title: "Wireless Earbuds",
          subtitle: "Premium Audio",
          link: "/category/earbuds"
        }
      ],
      subcategories: [
        {
          title: "Wearables",
          items: [
            { name: "Smartwatches", path: "/category/smartwatches" },
            { name: "Fitness Bands", path: "/category/fitness-bands" },
            { name: "Wireless Earbuds", path: "/category/earbuds" },
            { name: "Smart Rings", path: "/category/smart-rings" },
          ],
        },
        {
          title: "Smart Home",
          items: [
            { name: "Smart Speakers", path: "/category/smart-speakers" },
            { name: "Smart Lights", path: "/category/smart-lights" },
            { name: "Smart Plugs", path: "/category/smart-plugs" },
            { name: "Security Cameras", path: "/category/security-cameras" },
          ],
        },
      ],
    },
  ];

  // Fetch product to get categories when component mounts
  useEffect(() => {
    if (!productsInitialized.current) {
      productsInitialized.current = true;
      fetchProducts();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // FIX 4: Simplified useEffect with proper dropdown closing
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickOutsideDesktop =
        desktopSuggestionsRef.current &&
        !desktopSuggestionsRef.current.contains(event.target);

      const isClickOutsideMobile =
        mobileSuggestionsRef.current &&
        !mobileSuggestionsRef.current.contains(event.target);

      if (isClickOutsideDesktop && isClickOutsideMobile) {
        setShowSuggestions(false);
      }

      // Enhanced dropdown closing with better targeting and navigation link detection
      const isDropdownArea = event.target.closest('.dropdown-container') || 
                             event.target.closest('[aria-haspopup="true"]') ||
                             event.target.closest('.mega-dropdown');
      
      const isNavigationLink = event.target.closest('a[href]');
      
      if (!isDropdownArea) {
        if (isNavigationLink) {
          // Delay closing when clicking navigation links to allow navigation
          setTimeout(() => closeDropdown(), 100);
        } else {
          closeDropdown();
        }
      }
    };

    const handleKeyDown = (event) => {
      // Close dropdown on Escape key
      if (event.key === 'Escape') {
        closeDropdown();
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDropdown]);

  // Update search suggestions when query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const results = searchProducts(searchQuery);
    // Limit to 5 suggestions
    setSearchSuggestions(results.slice(0, 5));
    setShowSuggestions(true);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch cart and wishlist data when component mounts or authentication state changes
  useEffect(() => {
    if (isAuthenticated && !cartWishlistInitialized.current) {
      cartWishlistInitialized.current = true;
      fetchCart();
      fetchWishlist();
    } else if (!isAuthenticated) {
      // Reset the initialization flag when user logs out
      cartWishlistInitialized.current = false;
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        setLocation((prev) => ({ ...prev, loading: true }));
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              // Using OpenStreetMap's Nominatim service for reverse geocoding
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
              const data = await response.json();
              const city =
                data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.county ||
                "Unknown";

              // Ensure city name is in English
              setLocation({
                city: city, // This should already be in English from the OpenStreetMap API
                loading: false,
                error: null,
              });
            } catch (error) {
              setLocation({
                city: "Bhopal",
                loading: false,
                error: error || "Failed to fetch location",
              });
            }
          },
          (error) => {
            setLocation({
              city: "Jabalpur", // Changed default from "Bhopal" to "Jabalpur" to match the image
              loading: false,
              error: error || "Location access denied",
            });
          }
        );
      } else {
        setLocation({
          city: "Jabalpur", // Changed default from "Bhopal" to "Jabalpur" to match the image
          loading: false,
          error: "Geolocation not supported",
        });
      }
    };

    getUserLocation();
  }, []);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Use searchProducts from product store to find matching products
      const searchResults = searchProducts(searchQuery);
      console.log("Search results:", searchResults);
      // Navigate to search results page with query parameter
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      // Clear the suggestions
      setShowSuggestions(false);
    }
  };

  // Handle search in mobile view
  const handleMobileSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const searchResults = searchProducts(searchQuery);
      console.log("Mobile search results:", searchResults);
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  // Handle selecting a product from suggestions
  const handleSelectProduct = (productId) => {
    navigate(`/products/${productId}`);
    setShowSuggestions(false);
    setSearchQuery("");
  };
  return (
    <header className="sticky top-0 z-50">
      {/* Top header with elevated design */}
      <div
        className="shadow-xl relative"
        style={{
          backgroundColor: "var(--brand-primary)",
          backgroundImage:
            "linear-gradient(to right, var(--brand-primary), var(--brand-primary-hover))",
        }}
      >
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between py-4 gap-4">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <FiX
                  className="w-6 h-6"
                  style={{ color: "var(--text-on-brand)" }}
                />
              ) : (
                <FiMenu
                  className="w-6 h-6"
                  style={{ color: "var(--text-on-brand)" }}
                />
              )}
            </button>
            
            {/* Enhanced Logo Section with better spacing */}
            <div className="flex-shrink-0">
              <Link
                to={ROUTES.HOME}
                className="flex items-center transform hover:scale-105 transition duration-300 ease-in-out"
              >
                <Logo linkWrapper={false} />
              </Link>
            </div>
            
            {/* Enhanced Search Bar with better flex distribution */}
            <div className="hidden md:flex flex-1 max-w-3xl mx-8">
              <div
                className={`relative group w-full ${
                  isSearchFocused ? "ring-4 ring-white/20 rounded-full" : ""
                }`}
              >
                <form onSubmit={handleSearch} className="w-full">
                  <input
                    type="text"
                    placeholder="Search for Products, Brands, Offers"
                    className="w-full py-3 px-5 pr-12 rounded-full focus:outline-none transition-all duration-300"
                    style={{
                      backgroundColor: isSearchFocused
                        ? "rgba(255, 255, 255, 0.9)"
                        : "rgba(255, 255, 255, 0.8)",
                      color: "#333",
                      borderColor: "rgba(255, 255, 255, 0.2)",
                      boxShadow: isSearchFocused
                        ? "0 0 20px rgba(255, 255, 255, 0.3)"
                        : "var(--shadow-small)",
                      caretColor: "#333",
                    }}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim() === "") {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (
                        searchQuery.trim() !== "" &&
                        searchSuggestions.length > 0
                      ) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center transition-transform duration-300 hover:scale-110 active:scale-95"
                    style={{
                      color: "#333",
                    }}
                    aria-label="Search"
                  >
                    <FiSearch className="text-xl filter drop-shadow-lg" />
                  </button>
                </form>
                {/* Search suggestions dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div
                    ref={desktopSuggestionsRef}
                    className="absolute left-0 right-0 z-10 mt-1 bg-white rounded-md shadow-lg overflow-hidden"
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <ul className="py-1">
                      {searchSuggestions.map((product) => (
                        <li key={product.id}>
                          <div
                            className="px-4 py-2 hover:bg-gray-100 flex items-center cursor-pointer"
                            onClick={() => handleSelectProduct(product.id)}
                          >
                            <div className="w-10 h-10 flex-shrink-0 mr-3 bg-gray-200 rounded overflow-hidden">
                              <img
                                src={
                                  product.images && product.images.length > 0
                                    ? product.images[0]
                                    : "https://via.placeholder.com/40"
                                }
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {product.brand} • {product.category}
                              </p>
                            </div>
                            <div className="ml-3 text-sm font-medium text-gray-900">
                              ₹{product.discount_price || product.price}
                            </div>
                          </div>
                        </li>
                      ))}
                      <li>
                        <div
                          className="px-4 py-2 text-center text-sm text-brand-primary hover:bg-gray-50 cursor-pointer font-medium"
                          onClick={() => {
                            handleSearch({ preventDefault: () => {} });
                            setShowSuggestions(false);
                          }}
                        >
                          View all results
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {/* Enhanced Right Header Menu with improved spacing */}
            <div className="flex items-center gap-3 md:gap-5 lg:gap-6 flex-shrink-0">
              {/* Location */}
              <div className="group flex flex-col items-center cursor-pointer transition-all duration-300 hover:translate-y-[-2px] relative">
                <div className="relative">
                  <div className="absolute -inset-1.5 bg-white/10 rounded-full blur-md group-hover:bg-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <FiMapPin
                    className="text-xl relative z-10"
                    style={{ color: "var(--text-on-brand)" }}
                  />
                </div>
                <div className="text-xs mt-1 text-center">
                  <p
                    className="text-white/80"
                    style={{ color: "var(--text-on-brand-muted)" }}
                  >
                    Delivery to
                  </p>
                  <p
                    className="font-semibold truncate max-w-20"
                    style={{ color: "var(--text-on-brand)" }}
                  >
                    {location.loading ? (
                      <span className="inline-block w-16 h-3 bg-white/20 rounded-full animate-pulse"></span>
                    ) : location.error ? (
                      "Error"
                    ) : (
                      location.city
                    )}
                  </p>
                </div>
              </div>
              
              {/* Wishlist */}
              <Link
                to={ROUTES.WISHLIST}
                className="hidden sm:flex flex-col items-center transition-all duration-300 hover:translate-y-[-2px] group"
              >
                <div className="relative">
                  <div className="absolute -inset-1.5 bg-white/10 rounded-full blur-md group-hover:bg-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <FiHeart
                    className="text-xl relative z-10"
                    style={{ color: "var(--text-on-brand)" }}
                  />
                  <span
                    className="absolute -top-2 -right-2 z-20 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--brand-primary)",
                      boxShadow: "0 0 10px rgba(255,255,255,0.3)",
                    }}
                  >
                    {wishlistItems.length}
                  </span>
                </div>
                <p
                  className="text-xs font-semibold mt-1"
                  style={{ color: "var(--text-on-brand)" }}
                >
                  Wishlist
                </p>
              </Link>

              {/* Wallet Component */}
              <div className="hidden sm:flex flex-col items-center">
                <WalletComponent />
              </div>
              
              {/* Orders */}
              <Link
                to={ROUTES.ORDERS}
                className="hidden sm:flex flex-col items-center transition-all duration-300 hover:translate-y-[-2px] group"
              >
                <div className="relative">
                  <div className="absolute -inset-1.5 bg-white/10 rounded-full blur-md group-hover:bg-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <FiCalendar
                    className="text-xl relative z-10"
                    style={{ color: "var(--text-on-brand)" }}
                  />
                </div>
                <p
                  className="text-xs font-semibold mt-1"
                  style={{ color: "var(--text-on-brand)" }}
                >
                  Orders
                </p>
              </Link>
              
              {/* Cart */}
              <Link
                to={ROUTES.CART}
                className="flex flex-col items-center transition-all duration-300 hover:translate-y-[-2px] group"
              >
                <div className="relative">
                  <div className="absolute -inset-1.5 bg-white/10 rounded-full blur-md group-hover:bg-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <FiShoppingCart
                    className="text-xl relative z-10"
                    style={{ color: "var(--text-on-brand)" }}
                  />
                  <span
                    className="absolute -top-2 -right-2 z-20 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--brand-primary)",
                      boxShadow: "0 0 10px rgba(255,255,255,0.3)",
                    }}
                  >
                    {cartItemCount}
                  </span>
                </div>
                <p
                  className="text-xs font-semibold mt-1"
                  style={{ color: "var(--text-on-brand)" }}
                >
                  ₹ {totalAmount.toFixed(2)}
                </p>
              </Link>
              
              {/* User Profile */}
              <Link
                to={isAuthenticated ? "/profile" : ROUTES.LOGIN}
                className="flex flex-col items-center transition-all duration-300 hover:translate-y-[-2px] group"
              >
                <div className="relative">
                  <div className="absolute -inset-1.5 bg-white/10 rounded-full blur-md group-hover:bg-white/20 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <FiUser
                    className="text-xl relative z-10"
                    style={{ color: "var(--text-on-brand)" }}
                  />
                </div>
                <div className="text-xs mt-1 text-center">
                  <p
                    className="font-semibold truncate max-w-20"
                    style={{ color: "var(--text-on-brand)" }}
                  >
                    {isAuthenticated ? "Account" : "Sign In"}
                  </p>
                </div>
              </Link>
              
              {/* Divider */}
              <div
                className="hidden md:block w-px h-8 mx-2"
                style={{ backgroundColor: "var(--text-on-brand-muted)" }}
              ></div>
              
              {/* Enhanced Theme Toggle */}
              <div className="flex flex-col items-center justify-center transition-all duration-300 hover:translate-y-[-2px] relative z-50">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile search bar - only visible on small screens */}
      <div
        className="md:hidden px-2 py-3"
        style={{ backgroundColor: "var(--brand-primary-hover)" }}
      >
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full py-2 px-4 pr-10 rounded-full text-sm focus:outline-none"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              color: "#333",
              borderColor: "rgba(255, 255, 255, 0.2)",
              boxShadow: "var(--shadow-small)",
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleMobileSearch} // Handle search on Enter key
            onFocus={() => {
              if (searchQuery.trim() !== "" && searchSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
          <button
            onClick={() => {
              if (searchQuery.trim()) {
                const searchResults = searchProducts(searchQuery);
                console.log("Mobile search results:", searchResults);
                navigate(
                  `/search?query=${encodeURIComponent(searchQuery.trim())}`
                );
              }
            }}
            className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center"
            style={{ color: "#333" }}
          >
            <FiSearch className="text-lg" />
          </button>

          {/* Mobile search suggestions dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div
              ref={mobileSuggestionsRef}
              className="absolute left-0 right-0 z-50 mt-1 bg-white rounded-md shadow-lg overflow-hidden"
              style={{
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              <ul className="py-1">
                {searchSuggestions.map((product) => (
                  <li key={product.id}>
                    <div
                      className="px-3 py-2 hover:bg-gray-100 flex items-center cursor-pointer"
                      onClick={() => handleSelectProduct(product.id)}
                    >
                      <div className="w-8 h-8 flex-shrink-0 mr-2 bg-gray-200 rounded overflow-hidden">
                        <img
                          src={
                            product.images && product.images.length > 0
                              ? product.images[0]
                              : "https://via.placeholder.com/32"
                          }
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      </div>
                      <div className="ml-2 text-xs font-medium text-gray-900">
                        ₹{product.discount_price || product.price}
                      </div>
                    </div>
                  </li>
                ))}
                <li>
                  <div
                    className="px-3 py-2 text-center text-xs text-brand-primary hover:bg-gray-50 cursor-pointer font-medium"
                    onClick={() => {
                      if (searchQuery.trim()) {
                        navigate(
                          `/search?query=${encodeURIComponent(
                            searchQuery.trim()
                          )}`
                        );
                        setShowSuggestions(false);
                      }
                    }}
                  >
                    View all results
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      {/* Mega Menu Navigation */}
      <nav
        className="bg-white shadow-md relative"
        style={{
          backgroundColor: "var(--bg-primary)",
          boxShadow: "var(--shadow-medium)",
          zIndex: 40,
        }}
      >
        <div className="container mx-auto px-2 sm:px-3 relative">
          <ul
            className="hidden lg:flex items-center justify-between py-3.5"
            style={{ overflow: "visible" }}
          >
            {megaMenuCategories?.map((category) => (
              <li
                key={category.id}
                className="whitespace-nowrap px-3 relative dropdown-container"
                style={{ position: "relative" }}
              >
                <button
                  onClick={() => handleDropdownToggle(category.id)}
                  onKeyDown={(e) => handleDropdownKeyDown(e, category.id)}
                  className="text-sm font-semibold transition-all duration-300 relative group py-2 px-3 flex items-center rounded-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{
                    color: "var(--text-primary)",
                    ":hover": {
                      color: "var(--brand-primary)",
                      backgroundColor: "var(--bg-accent-light)"
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = 'var(--brand-primary)';
                    e.target.style.backgroundColor = 'var(--bg-accent-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = 'var(--text-primary)';
                    e.target.style.backgroundColor = 'transparent';
                  }}
                  aria-expanded={activeDropdown === category.id}
                  aria-haspopup="true"
                  aria-label={`${category.name} menu`}
                >
                  <span className="relative z-10">{category.name}</span>
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                      activeDropdown === category.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 transition-all duration-300 group-hover:w-3/4 rounded-full shadow-lg"
                    style={{
                      backgroundColor: "var(--brand-primary)",
                    }}
                  ></span>
                </button>
              </li>
            ))}

            {/* Browse All Categories Link */}
            <li className="whitespace-nowrap px-3">
              <Link
                to="/category"
                className="text-sm font-semibold transition-all duration-300 relative group py-2 px-3 rounded-lg transform hover:scale-105"
                style={{
                  color: "var(--text-primary)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--brand-primary)';
                  e.target.style.backgroundColor = 'var(--bg-accent-light)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--text-primary)';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <span className="relative z-10">Browse All</span>
                <span
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 transition-all duration-300 group-hover:w-3/4 rounded-full shadow-lg"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                  }}
                ></span>
              </Link>
            </li>
          </ul>
          {/* Premium Poorvika-Style Mega Dropdown Menu - Ultra-Modern Enhanced UI */}
          {activeDropdown && (
            <div
              ref={megaMenuRef}
              className="absolute bg-white shadow-lg border-t-2 mega-dropdown"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderTopColor: "var(--brand-primary)",
                borderTopWidth: "2px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                zIndex: 9999,
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "90vw",
                maxWidth: "1200px",
                marginTop: "-1px",
                borderRadius: "0 0 8px 8px",
                border: "1px solid var(--border-primary)",
              }}
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <div className="px-8 py-6">
                {(() => {
                  const activeCategory = megaMenuCategories.find(
                    (cat) => cat.id === activeDropdown
                  );
                  if (!activeCategory) return null;

                  return (
                    <>
                      {/* Simple category header like Poorvika */}
                      <div className="mb-6 pb-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
                        <div className="flex items-center justify-between">
                          <h2 
                            className="text-xl font-semibold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {activeCategory.name}
                          </h2>
                          <Link
                            to={activeCategory.path}
                            className="hover:opacity-80 text-sm font-medium transition-opacity"
                            style={{ color: "var(--brand-primary)" }}
                            onClick={handleLinkClick}
                          >
                            View All →
                          </Link>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-4 h-full min-h-[340px]">
                        {/* Left side - Categories with reduced spacing (8 columns) */}
                        <div className="col-span-8 grid grid-cols-4 gap-4 pr-2">
                          {activeCategory.subcategories.map((subcategory, index) => (
                            <div key={index} className="space-y-2">
                              <h3 
                                className="font-semibold text-sm mb-2 pb-1 border-b"
                                style={{ 
                                  color: "var(--text-primary)",
                                  borderColor: "var(--border-primary)"
                                }}
                              >
                                {subcategory.title}
                              </h3>
                              <ul className="space-y-1">
                                {subcategory.items.map((item, itemIndex) => (
                                  <li key={itemIndex}>
                                    <Link
                                      to={item.path}
                                      className="text-sm transition-colors block py-1 px-2 rounded hover:bg-opacity-50"
                                      style={{ 
                                        color: "var(--text-secondary)"
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.color = 'var(--brand-primary)';
                                        e.target.style.backgroundColor = 'var(--bg-accent-light)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.color = 'var(--text-secondary)';
                                        e.target.style.backgroundColor = '';
                                      }}
                                      onClick={handleLinkClick}
                                    >
                                      {item.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        
                        {/* Right side - Banners with reduced spacing (4 columns) */}
                        <div className="col-span-4 pl-4 border-l hidden md:flex md:flex-col" style={{ borderColor: "var(--border-primary)" }}>
                          {(() => {
                            // Get admin-managed banners for this category
                            const adminBanners = getDropdownBanners(activeCategory.name);
                            const banners = adminBanners.length > 0 ? adminBanners : activeCategory.banners;
                            
                            if (!banners || banners.length === 0) {
                              return (
                                <div className="text-center py-8" style={{ color: "var(--text-secondary)" }}>
                                  <p className="text-sm">No promotions available</p>
                                </div>
                              );
                            }
                            
                            return (
                              <div className="flex gap-4">
                                {/* Two banners stacked vertically with proper aspect ratio */}
                                {banners.slice(0, 2).map((banner, bannerIndex) => (
                                  <Link
                                    key={bannerIndex}
                                    to={banner.link || banner.buttonLink || activeCategory.path}
                                    className="block relative rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                                    onClick={handleLinkClick}
                                  >
                                    <div className="aspect-[16/10] w-full h-[400px] relative" style={{
                                      background: `linear-gradient(to bottom right, var(--brand-primary), var(--brand-primary-hover))`
                                    }}>
                                      <img
                                        src={banner.image || banner.imageUrl}
                                        alt={banner.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                      {/* Enhanced fallback with banner-like design */}
                                      <div 
                                        className="absolute inset-0 flex items-center justify-center text-white"
                                        style={{
                                          background: `linear-gradient(to bottom right, var(--brand-primary), var(--brand-primary-hover))`
                                        }}
                                      >
                                        <div className="text-center p-4">
                                          <div className="text-lg font-bold mb-2">
                                            {banner.title || 'Smart TVs'}
                                          </div>
                                          <div className="text-sm opacity-90 mb-3">
                                            {banner.subtitle || 'Up to 40% OFF'}
                                          </div>
                                          <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                                            {banner.buttonText || 'Shop Now'}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {/* Enhanced overlay with better text layout */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
                                      <div className="p-4 text-white w-full">
                                        <h4 className="font-bold text-base mb-1">
                                          {banner.title || 'Smart TVs'}
                                        </h4>
                                        <p className="text-sm opacity-90 mb-2">
                                          {banner.subtitle || 'Up to 40% OFF'}
                                        </p>
                                        {(banner.buttonText || banner.cta) && (
                                          <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                                            {banner.buttonText || banner.cta || 'Shop Now'}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Mobile menu drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          className={`absolute top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-2xl transition-transform duration-300 transform ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ backgroundColor: "var(--bg-primary)" }}
        >
          <div
            className="p-4 border-b"
            style={{ borderColor: "var(--border-primary)" }}
          >
            <Logo
              size="small"
              linkWrapper={false}
            />
            <button
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <FiX
                className="w-5 h-5"
                style={{ color: "var(--text-primary)" }}
              />
            </button>
          </div>

          <div className="py-4">
            {/* Account section in mobile menu */}
            {isAuthenticated && (
              <div className="mb-4">
                <h3
                  className="px-4 text-xs uppercase font-semibold mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  My Account
                </h3>
                <ul>
                  <li>
                    <Link
                      to="/profile"
                      className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      style={{ color: "var(--text-primary)" }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/profile/addresses"
                      className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      style={{ color: "var(--text-primary)" }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Addresses
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/orders"
                      className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      style={{ color: "var(--text-primary)" }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Orders
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/wishlist"
                      className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      style={{ color: "var(--text-primary)" }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Wishlist
                    </Link>
                  </li>
                </ul>
              </div>
            )}

            <h3
              className="px-4 text-xs uppercase font-semibold mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Categories
            </h3>
            <ul>
              {megaMenuCategories?.map((category) => (
                <li key={category.id}>
                  <Link
                    to={category.path}
                    className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    style={{ color: "var(--text-primary)" }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/products"
                  className="block px-4 py-2.5 hover:bg-gray-50 transition-colors font-medium"
                  style={{ color: "var(--brand-primary)" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Browse All Products
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
