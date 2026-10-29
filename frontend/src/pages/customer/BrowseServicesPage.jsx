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
  Search,
  X,
} from 'lucide-react';
import { CategoryCard } from '../../components/service/CategoryCard';
import { ServiceCard } from '../../components/service/ServiceCard';
import { EmptyState } from '../../components/common/EmptyState';
import { getServicesApi } from '../../api/services';
import { marketplaceCategories } from '../../constants/marketplaceCategories';
import { getCategoriesApi } from '../../api/admin';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/button';

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
        if (activeCategoryTab && activeCategoryTab !== 'All') {
          const matched = categoriesFromApi.find((c) => c.categoryName === activeCategoryTab);
          if (matched) params.categoryId = matched.id;
        }

        const res = await getServicesApi(params).catch(() => null);
        const apiServices = res?.data || res?.services || (Array.isArray(res) ? res : []);
        if (Array.isArray(apiServices) && apiServices.length > 0) {
          const normalizedApi = apiServices.map((s) => ({
            ...s,
            category:
              s.provider?.category?.categoryName || s.provider?.category?.name || 'Home Services',
            providerName: s.providerName || s.provider?.user?.name || 'Verified Specialist',
            image:
              s.image ||
              s.images?.[0] ||
              'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
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

    if (tab === 'beauty') {
      return sCat === 'beauty' || sCat === 'beauty & salon' || sCat === 'salon';
    }
    if (tab === 'repairs') {
      return sCat === 'repairs' || sCat === 'repair';
    }
    if (tab === 'home services') {
      return (
        sCat === 'home services' ||
        sCat === 'home cleaning' ||
        sCat === 'cleaning' ||
        sCat === 'plumbing'
      );
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

  const hasFilters = searchTerm || activeCategoryTab !== 'All' || priceRange < 10000 || minRating > 0;

  const resetFilters = () => {
    setActiveCategoryTab('All');
    setSearchTerm('');
    setPriceRange(10000);
    setMinRating(0);
    setPriceSort('relevant');
    searchParams.delete('search');
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  return (
    <div className="mx-auto max-w-[1180px] pb-12">
      {/* Header */}
      <Reveal className="border-b border-hairline pb-6">
        <p className="sh-eyebrow">The marketplace</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="workspace-title">
              {searchTerm ? `Results for “${searchTerm}”` : 'What needs doing?'}
            </h1>
            <p className="workspace-subtitle">
              {searchTerm
                ? `${filteredServices.length} service${filteredServices.length === 1 ? '' : 's'} matched your search.`
                : 'Verified professionals, upfront prices, and a booking that takes minutes.'}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-hairline bg-surface-soft px-3 py-2 text-[11px] text-muted-foreground">
            <Search size={13} className="text-primary" />
            Hyderabad · 6 cities
          </div>
        </div>
      </Reveal>

      {/* Category pills */}
      <div className="scrollbar-none mt-6 flex items-center gap-2 overflow-x-auto pb-1">
        {categoryPills.map((cat) => (
          <button
            key={cat}
            onClick={() => handleTabChange(cat)}
            className={`whitespace-nowrap rounded-pill border px-4 py-2 text-xs font-medium transition-all duration-200 ${
              activeCategoryTab === cat
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-hairline bg-canvas text-body hover:border-ink/20 hover:text-ink'
            }`}
          >
            {cat}
          </button>
        ))}
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-pill px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-ink"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Category cards */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.slice(0, 8).map((cat) => (
          <CategoryCard
            key={cat.title}
            title={cat.title}
            count={cat.count}
            icon={cat.icon}
            active={activeCategoryTab === cat.title}
            onClick={() => handleTabChange(cat.title)}
          />
        ))}
      </div>

      {/* Filter bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-hairline bg-surface-soft/60 p-3">
        <div className="flex items-center gap-2 px-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <SlidersHorizontal size={13} /> Refine
        </div>

        <select
          value={priceSort}
          onChange={(e) => setPriceSort(e.target.value)}
          className="h-9 cursor-pointer rounded-sm border border-hairline bg-canvas px-2.5 text-xs text-body outline-hidden focus:border-primary"
        >
          <option value="relevant">Relevance</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>

        <div className="flex h-9 items-center gap-2 rounded-sm border border-hairline bg-canvas px-2.5 text-xs text-body">
          <span className="tabular-nums">Up to ₹{priceRange.toLocaleString('en-IN')}</span>
          <input
            type="range"
            min="200"
            max="10000"
            step="100"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-24 cursor-pointer accent-primary"
            aria-label="Maximum price"
          />
        </div>

        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="h-9 cursor-pointer rounded-sm border border-hairline bg-canvas px-2.5 text-xs text-body outline-hidden focus:border-primary"
        >
          <option value={0}>Any rating</option>
          <option value={4.0}>4.0 and up</option>
          <option value={4.5}>4.5 and up</option>
          <option value={4.8}>4.8 and up</option>
        </select>

        <span className="ml-auto px-1 text-[11px] tabular-nums text-muted-foreground">
          {filteredServices.length} available
        </span>
      </div>

      {/* Results */}
      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="sh-eyebrow">{activeCategoryTab === 'All' ? 'Popular near you' : activeCategoryTab}</p>
          <h2 className="mt-1.5 font-display text-[1.85rem] leading-tight tracking-[-0.02em] text-ink">
            {searchTerm ? 'Search results' : 'Considered choices'}
          </h2>
        </div>
        <span className="hidden text-[11px] text-muted-foreground sm:block">
          Sorted by {priceSort === 'low' ? 'price ascending' : priceSort === 'high' ? 'price descending' : 'relevance'}
        </span>
      </div>

      {loading ? (
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-[360px] animate-pulse rounded-lg border border-hairline bg-surface-soft" />
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nothing matched, yet"
          description="Try widening the price range or clearing the category filter. There’s plenty more to explore."
          actionLabel="Reset filters"
          onAction={resetFilters}
        />
      ) : (
        <Stagger fast once={false} className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => (
            <StaggerItem key={service.id}>
              <ServiceCard service={service} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {!loading && filteredServices.length > 0 && (
        <div className="mt-10 flex flex-col items-center justify-between gap-3 rounded-lg border border-dashed border-hairline px-6 py-5 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-muted-foreground">
            Not sure what you need? Tell us the problem and we’ll point you in the right direction.
          </p>
          <Button variant="outline" size="sm" onClick={() => handleTabChange('All')}>
            Browse everything
          </Button>
        </div>
      )}
    </div>
  );
};
