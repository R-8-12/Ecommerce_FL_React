import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FiHome,
  FiBox,
  FiLayers,
  FiShoppingCart,
  FiUsers,
  FiCornerDownLeft,
  FiFileText,
  FiStar,
  FiChevronLeft,
  FiChevronRight,
  FiArrowLeft,
  FiTruck,
  FiSmartphone,
} from "react-icons/fi";
import NotificationBar from "./NotificationBar";
import ThemeToggle from "../ui/ThemeToggle";
import useFrontendCacheStore from "../../store/useFrontendCacheStore";

const AdminLayout = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { initializeCacheWithContext } = useFrontendCacheStore();
  
  // Initialize admin context cache on mount
  useEffect(() => {
    const initializeAdminCache = async () => {
      try {
        console.log('🛠️ Initializing admin context cache...');
        await initializeCacheWithContext('admin');
        console.log('✅ Admin cache initialized');
      } catch (error) {
        console.error('❌ Admin cache initialization failed:', error);
      }
    };

    initializeAdminCache();
  }, [initializeCacheWithContext]);
  
  const navLinks = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <FiHome size={20} />,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: <FiBox size={20} />,
    },
    {
      name: "Inventory",
      path: "/admin/inventory",
      icon: <FiLayers size={20} />,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: <FiShoppingCart size={20} />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <FiUsers size={20} />,
    },
    // {
    //   name: "Returns",
    //   path: "/admin/returns",
    //   icon: <FiCornerDownLeft size={20} />,
    // },
    {
      name: "Content",
      path: "/admin/content",
      icon: <FiFileText size={20} />,
    },
    {
      name: "Sell Phones",
      path: "/admin/sell-phones",
      icon: <FiSmartphone size={20} />,
    },
    {
      name: "Reviews",
      path: "/admin/reviews",
      icon: <FiStar size={20} />,
    },
    {
      name: "Delivery Partners",
      path: "/admin/delivery-partners",
      icon: <FiTruck size={20} />,
    },
  ];

  return (
    <div className="flex h-screen bg-bg-secondary overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } bg-bg-dark text-text-on-dark-bg flex flex-col transition-all duration-300 ease-in-out shadow-lg`}
        style={{
          backgroundColor: "var(--bg-dark)",
          color: "var(--text-on-dark-bg)",
        }}
      >
        {/* Sidebar Header */}
        <div
          className="flex items-center justify-between p-4 border-b border-opacity-20"
          style={{ borderColor: "var(--border-dark)" }}
        >
          <div
            className={`flex items-center ${
              collapsed ? "justify-center w-full" : ""
            }`}
          >
            {!collapsed && (
              <span
                className="text-xl font-bold"
                style={{ color: "var(--brand-primary)" }}
              >
                Admin Panel
              </span>
            )}
            {collapsed && (
              <span
                className="text-xl font-bold"
                style={{ color: "var(--brand-primary)" }}
              >
                AP
              </span>
            )}
          </div>

          <div className={`flex items-center gap-2 ${collapsed ? "flex-col" : ""}`}>
            {/* Theme Toggle */}
            <div className={collapsed ? "mb-2" : ""}>
              <ThemeToggle />
            </div>
            
            {/* Collapse Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`p-1 rounded-md hover:bg-gray-700 transition-colors duration-150`}
            >
              {collapsed ? (
                <FiChevronRight size={24} />
              ) : (
                <FiChevronLeft size={24} />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto no-scrollbar">
          <ul className="px-2 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`flex items-center px-4 py-3 rounded-md transition-all duration-200 ${
                      isActive
                        ? "bg-opacity-20 font-medium animate-fadeIn"
                        : "hover:bg-gray-700 hover:bg-opacity-30"
                    }`}
                    style={{
                      backgroundColor: isActive
                        ? "var(--brand-primary)"
                        : "transparent",
                      color: isActive
                        ? "var(--text-on-brand)"
                        : "var(--text-on-dark-bg)",
                      boxShadow: isActive ? "var(--shadow-small)" : "none",
                      borderRadius: "var(--rounded-md)",
                    }}
                  >
                    <span className="flex items-center justify-center">
                      {link.icon}
                    </span>
                    {!collapsed && <span className="ml-3">{link.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div
          className="p-4 border-t border-opacity-20"
          style={{ borderColor: "var(--border-dark)" }}
        >
          <Link
            to="/"
            className="flex items-center px-4 py-2 rounded-md hover:bg-gray-700 hover:bg-opacity-30 transition-all duration-150 text-sm"
            style={{ borderRadius: "var(--rounded-md)" }}
            onClick={() => {
              // Set flag to allow admin to access homepage
              sessionStorage.setItem('admin_visiting_homepage', 'true');
            }}
          >
            <FiArrowLeft size={20} />
            {!collapsed && <span className="ml-3">Visit Homepage</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Sticky Notification Bar */}
        <NotificationBar />
        
        {/* Main Content Area */}
        <div
          className="flex-1 overflow-y-auto p-6 bg-bg-secondary animate-fadeIn"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          <div
            className="bg-bg-primary p-6 rounded-lg shadow-md mb-6"
            style={{
              backgroundColor: "var(--bg-primary)",
              boxShadow: "var(--shadow-medium)",
              borderRadius: "var(--rounded-lg)",
            }}
          >
            <Outlet /> {/* Nested routes will render here */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
