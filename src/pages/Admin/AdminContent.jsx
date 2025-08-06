import { useState } from "react";
import BannerManager from "../../components/Admin/Content/BannerManager";
import LogoManager from "../../components/Admin/Content/LogoManager";
import CategoryManager from "../../components/Admin/Content/CategoryManager";
import FooterManager from "../../components/Admin/Content/FooterManager";
import PageManager from "../../components/Admin/Content/PageManager";
import ColorManager from "../../components/Admin/Content/ColorManager";
import ThemeManager from "../../components/Admin/Content/SimpleThemeManager";
import UserFriendlyHomepageManager from "../../components/Admin/Content/UserFriendlyHomepageManager";
import GamificationManager from "../../components/Admin/Content/GamificationManager";
import { bannerPositionOptions } from "../../constants/bannerOptions";

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState("logo");

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 
          className="text-2xl font-bold" 
          style={{ color: "var(--text-primary)" }}
        >
          Content Management
        </h1>
      </div>

      <div 
        className="shadow-md rounded-lg overflow-hidden"
        style={{ 
          backgroundColor: "var(--bg-primary)",
          boxShadow: "var(--shadow-medium)" 
        }}
      >
        <div 
          className="flex border-b overflow-x-auto"
          style={{ borderColor: "var(--border-primary)" }}
        >
          <button
            className={`px-6 py-3 font-medium transition-all duration-200 ${
              activeTab === "logo"
                ? "border-b-2"
                : "hover:opacity-75"
            }`}
            style={{
              color: activeTab === "logo" ? "var(--brand-primary)" : "var(--text-secondary)",
              borderBottomColor: activeTab === "logo" ? "var(--brand-primary)" : "transparent",
              backgroundColor: activeTab === "logo" ? "var(--bg-accent-light)" : "transparent",
            }}
            onClick={() => setActiveTab("logo")}
          >
            Logo
          </button>
          <button
            className={`px-6 py-3 font-medium transition-all duration-200 ${
              activeTab === "banners"
                ? "border-b-2"
                : "hover:opacity-75"
            }`}
            style={{
              color: activeTab === "banners" ? "var(--brand-primary)" : "var(--text-secondary)",
              borderBottomColor: activeTab === "banners" ? "var(--brand-primary)" : "transparent",
              backgroundColor: activeTab === "banners" ? "var(--bg-accent-light)" : "transparent",
            }}
            onClick={() => setActiveTab("banners")}
          >
            Banners
          </button>
          <button
            className={`px-6 py-3 font-medium transition-all duration-200 ${
              activeTab === "categories"
                ? "border-b-2"
                : "hover:opacity-75"
            }`}
            style={{
              color: activeTab === "categories" ? "var(--brand-primary)" : "var(--text-secondary)",
              borderBottomColor: activeTab === "categories" ? "var(--brand-primary)" : "transparent",
              backgroundColor: activeTab === "categories" ? "var(--bg-accent-light)" : "transparent",
            }}
            onClick={() => setActiveTab("categories")}
          >
            Categories
          </button>
          <button
            className={`px-6 py-3 font-medium transition-all duration-200 ${
              activeTab === "footer"
                ? "border-b-2"
                : "hover:opacity-75"
            }`}
            style={{
              color: activeTab === "footer" ? "var(--brand-primary)" : "var(--text-secondary)",
              borderBottomColor: activeTab === "footer" ? "var(--brand-primary)" : "transparent",
              backgroundColor: activeTab === "footer" ? "var(--bg-accent-light)" : "transparent",
            }}
            onClick={() => setActiveTab("footer")}
          >
            Footer
          </button>
          <button
            className={`px-6 py-3 font-medium transition-all duration-200 ${
              activeTab === "pages"
                ? "border-b-2"
                : "hover:opacity-75"
            }`}
            style={{
              color: activeTab === "pages" ? "var(--brand-primary)" : "var(--text-secondary)",
              borderBottomColor: activeTab === "pages" ? "var(--brand-primary)" : "transparent",
              backgroundColor: activeTab === "pages" ? "var(--bg-accent-light)" : "transparent",
            }}
            onClick={() => setActiveTab("pages")}
          >
            Pages
          </button>
          <button
            className={`px-6 py-3 font-medium transition-all duration-200 ${
              activeTab === "theme"
                ? "border-b-2"
                : "hover:opacity-75"
            }`}
            style={{
              color: activeTab === "theme" ? "var(--brand-primary)" : "var(--text-secondary)",
              borderBottomColor: activeTab === "theme" ? "var(--brand-primary)" : "transparent",
              backgroundColor: activeTab === "theme" ? "var(--bg-accent-light)" : "transparent",
            }}
            onClick={() => setActiveTab("theme")}
          >
            Theme & Colors
          </button>
          <button
            className={`px-6 py-3 font-medium transition-all duration-200 ${
              activeTab === "homepage"
                ? "border-b-2"
                : "hover:opacity-75"
            }`}
            style={{
              color: activeTab === "homepage" ? "var(--brand-primary)" : "var(--text-secondary)",
              borderBottomColor: activeTab === "homepage" ? "var(--brand-primary)" : "transparent",
              backgroundColor: activeTab === "homepage" ? "var(--bg-accent-light)" : "transparent",
            }}
            onClick={() => setActiveTab("homepage")}
          >
            Homepage Sections
          </button>
          <button
            className={`px-6 py-3 font-medium transition-all duration-200 ${
              activeTab === "gamification"
                ? "border-b-2"
                : "hover:opacity-75"
            }`}
            style={{
              color: activeTab === "gamification" ? "var(--brand-primary)" : "var(--text-secondary)",
              borderBottomColor: activeTab === "gamification" ? "var(--brand-primary)" : "transparent",
              backgroundColor: activeTab === "gamification" ? "var(--bg-accent-light)" : "transparent",
            }}
            onClick={() => setActiveTab("gamification")}
          >
            Gamification
          </button>
        </div>
        <div className="p-6">
          {activeTab === "banners" && (
            <BannerManager positionOptions={bannerPositionOptions} />
          )}
          {activeTab === "logo" && <LogoManager />}
          {activeTab === "categories" && <CategoryManager />}
          {activeTab === "footer" && <FooterManager />}
          {activeTab === "pages" && <PageManager />}
          {activeTab === "theme" && <ThemeManager />}
          {activeTab === "homepage" && <UserFriendlyHomepageManager />}
          {activeTab === "gamification" && <GamificationManager />}
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
