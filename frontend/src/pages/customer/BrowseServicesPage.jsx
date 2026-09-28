import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Home,
  Wrench,
  Sparkles,
  Car,
  GraduationCap,
  HeartPulse,
  Camera,
  Dog,
  SlidersHorizontal,
  ChevronDown,
  Search
} from 'lucide-react';
import { CategoryCard } from '../../components/service/CategoryCard';
import { ServiceCard } from '../../components/service/ServiceCard';
import { getServicesApi } from '../../api/services';
import { Skeleton } from '../../components/common/Skeleton';
import { marketplaceCategories } from '../../constants/marketplaceCategories';
import { getCategoriesApi } from '../../api/admin';

export const BrowseServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchKeyword = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'All';

  const [activeCategoryTab, setActiveCategoryTab] = useState(categoryParam);
  const [searchTerm, setSearchTerm] = useState(searchKeyword);
  const [loading, setLoading] = useState(false);
  const [priceSort, setPriceSort] = useState('relevant');
  const [priceRange, setPriceRange] = useState(10000);
  const [minRating, setMinRating] = useState(0);

  const categoryIcons = [Home, Wrench, Sparkles, Car, GraduationCap, HeartPulse, Camera, Dog];
  const categories = marketplaceCategories.map((category, index) => ({
    ...category,
    icon: categoryIcons[index],
    colorBg: 'hsl(var(--muted))',
    colorText: 'hsl(var(--foreground))',
  }));

  const categoryPills = ['All', 'Home Services', 'Repairs', 'Beauty', 'Automotive', 'Tutors'];

  const [services, setServices] = useState([]);
  const [categoriesFromApi, setCategoriesFromApi] = useState([]);

  useEffect(() => {
    if (searchKeyword) {
      setSearchTerm(searchKeyword);
    }
  }, [searchKeyword]);

  useEffect(() => {
    const cat = searchParams.get('category') || 'All';
    setActiveCategoryTab(cat);
  }, [searchParams]);

  useEffect(() => {
    // load categories to map names -> ids
    (async () => {
      try {
        const cats = await getCategoriesApi();
        setCategoriesFromApi(Array.isArray(cats) ? cats : []);
      } catch (err) {
        setCategoriesFromApi([]);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const params = {};
        // If a category tab is active and not 'All', attempt to resolve its id and request server-side filtering
        if (activeCategoryTab && activeCategoryTab !== 'All') {
          const matched = categoriesFromApi.find(c => c.categoryName === activeCategoryTab);
          if (matched) params.categoryId = matched.id;
        }

        const res = await getServicesApi(params).catch(() => null);
        const apiServices = res?.data || res?.services || (Array.isArray(res) ? res : []);
        if (Array.isArray(apiServices) && apiServices.length > 0) {
          const normalizedApi = apiServices.map((s) => ({
            ...s,
            category: s.provider?.category?.categoryName || s.provider?.category?.name || 'Home Services',
            providerName: s.providerName || s.provider?.user?.name || 'Verified Specialist',
            image: s.image || s.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
            rating: Number(s.rating || 4.8),
            reviewCount: Number(s.reviewCount || 150),
          }));

          setServices(normalizedApi);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.warn('[BrowseServicesPage] API error, no services available:', err);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
    // re-run when activeCategoryTab or categoriesFromApi are updated
  }, [activeCategoryTab, categoriesFromApi]);

  const handleTabChange = (cat) => {
    setActiveCategoryTab(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const matchesCategory = (serviceCat, activeTab) => {
    if (activeTab === 'All') return true;
    if (!serviceCat) return false;
    const sCat = serviceCat.trim().toLowerCase();
    const tab = activeTab.trim().toLowerCase();

    // Strict per-category matching — each bucket is mutually exclusive
    if (tab === 'beauty') {
      return sCat === 'beauty' || sCat === 'beauty & salon' || sCat === 'salon';
    }
    if (tab === 'repairs') {
      return sCat === 'repairs' || sCat === 'repair';
    }
    if (tab === 'home services') {
      return sCat === 'home services' || sCat === 'home cleaning' || sCat === 'cleaning' || sCat === 'plumbing';
    }
    if (tab === 'automotive') {
      return sCat === 'automotive';
    }
    if (tab === 'tutors') {
      return sCat === 'tutors' || sCat === 'tutor' || sCat === 'tutoring' || sCat === 'education';
    }
    if (tab === 'health & wellness') {
      return sCat === 'health & wellness' || sCat === 'health' || sCat === 'wellness';
    }
    // Generic fallback for any other tabs
    return sCat === tab;
  };

  const filteredServices = services
    .filter((s) => {
      if (!matchesCategory(s.category, activeCategoryTab)) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const compactTerm = term.replace(/\s+/g, '');
        const title = (s.title || '').toLowerCase();
        const compactTitle = title.replace(/\s+/g, '');
        const category = (s.category || '').toLowerCase();
        const provider = (s.providerName || '').toLowerCase();

        const matches = 
          title.includes(term) ||
          compactTitle.includes(compactTerm) ||
          category.includes(term) ||
          provider.includes(term);

        if (!matches) return false;
      }
      if (s.price > priceRange) return false;
      if (s.rating < minRating) return false;
      return true;
    })
    .sort((a, b) => {
      if (priceSort === 'low') return a.price - b.price;
      if (priceSort === 'high') return b.price - a.price;
      return 0;
    });

  return (
    <div className="max-w-[1120px] space-y-6 animate-fade-in pb-10">
      {/* Page Title Header */}
      <div>
        <h1 className="workspace-title">Book Services</h1>
        <p className="workspace-subtitle">
          {searchTerm ? `Showing results for "${searchTerm}"` : 'Find trusted professionals for every need and book in seconds'}
        </p>
      </div>

      {/* Category Filter Tabs Pills matching Reference Image 3 */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {categoryPills.map((cat) => (
          <button
            key={cat}
            onClick={() => handleTabChange(cat)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap ${
              activeCategoryTab === cat
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card text-muted-foreground hover:bg-muted border border-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Category Cards Grid (2 rows x 4 cols) matching Reference Image 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.title}
            title={cat.title}
            count={cat.count}
            icon={cat.icon}
            colorBg={cat.colorBg}
            colorText={cat.colorText}
            active={activeCategoryTab === cat.title}
            onClick={() => handleTabChange(cat.title)}
          />
        ))}
      </div>

      {/* Filter Controls Bar matching Reference Image 3 */}
      <div className="sh-card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <SlidersHorizontal size={14} /> Filter:
          </div>

          <select
            value={priceSort}
            onChange={(e) => setPriceSort(e.target.value)}
            className="bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value="relevant">Sort by: Relevance</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>

          <div className="flex items-center gap-2 bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground">
            <span>Max Price: ₹{priceRange}</span>
            <input
              type="range"
              min="200"
              max="10000"
              step="100"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-24 accent-neutral-900 dark:accent-white cursor-pointer"
            />
          </div>

          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer"
          >
            <option value={0}>Minimum Rating: Any</option>
            <option value={4.0}>⭐ 4.0+</option>
            <option value={4.5}>⭐ 4.5+</option>
            <option value={4.8}>⭐ 4.8+</option>
          </select>
        </div>

      </div>


      {/* Popular Services Section Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            {searchTerm ? `Search Results (${filteredServices.length})` : 'Popular near you'}
          </h2>
          <p className="text-xs text-muted-foreground">Top rated services in Hyderabad right now.</p>
        </div>
        <button
          onClick={() => {
            setActiveCategoryTab('All');
            setSearchTerm('');
            searchParams.delete('search');
            searchParams.delete('category');
            setSearchParams(searchParams);
          }}
          className="text-xs font-bold text-foreground hover:text-muted-foreground flex items-center gap-1"
        >
          View all &gt;
        </button>
      </div>

      {/* Services Grid (4 Columns) matching Reference Image 3 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="sh-card p-4 h-72 animate-pulse bg-muted"></div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border p-8">
          <p className="text-base font-bold text-foreground">No services matched your filters.</p>
          <p className="text-xs text-muted-foreground mt-1">Try resetting the search or category filters.</p>
          <button
            onClick={() => {
              setActiveCategoryTab('All');
              setSearchTerm('');
              setPriceRange(10000);
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
};
