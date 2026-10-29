import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  ShieldCheck,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronRight,
  Shield,
  Plus,
  Minus,
  Crosshair,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { getServiceByIdApi } from '../../api/services';
import { Button } from '../../components/common/Button';
import { Badge } from '@/components/ui/badge';
import { getAccurateGPSLocation, reverseGeocodeCoords } from '../../utils/geolocation';
import { cn } from '@/lib/utils';

const timeSlots = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM', '05:00 PM'];

const buildDates = () => {
  const base = new Date();
  return Array.from({ length: 10 }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() + index);
    return {
      key: date.toISOString().slice(0, 10),
      weekday: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-IN', { month: 'short' }),
      label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  });
};

export const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dates = React.useMemo(buildDates, []);

  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedDate, setSelectedDate] = useState(dates[0]?.label || '');
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [quantity, setQuantity] = useState(1);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [locationAddress, setLocationAddress] = useState(
    'Home - Macherla, Palnadu District, Andhra Pradesh 522426'
  );
  const [coords, setCoords] = useState({ lat: 16.48, lng: 79.43 });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  const detectExactLocation = async () => {
    setDetectingLocation(true);
    setLocationStatus('Detecting GPS...');

    try {
      const loc = await getAccurateGPSLocation();
      setCoords({ lat: loc.lat, lng: loc.lng });
      setLocationStatus(`Resolving address (±${loc.accuracy}m accuracy)...`);

      const readableAddress = await reverseGeocodeCoords(loc.lat, loc.lng);
      setLocationAddress(readableAddress);
      setLocationStatus(`Exact GPS locked: ${loc.source.toUpperCase()} (±${loc.accuracy}m)`);
    } catch (err) {
      console.warn('[ServiceDetailsPage] Location detection error:', err);
      setLocationStatus(err.message || 'GPS blocked. Please check browser permissions.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const [service, setService] = useState(null);
  const [loadingService, setLoadingService] = useState(true);
  const [serviceError, setServiceError] = useState(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoadingService(true);
        setServiceError(null);

        let fetchedService = null;
        try {
          fetchedService = await getServiceByIdApi(id);
        } catch (err) {
          console.warn('API fetch failed, trying fallback...', err);
        }

        if (fetchedService) {
          setService({
            id: fetchedService.id,
            title: fetchedService.title,
            category: fetchedService.provider?.category?.categoryName || 'General',
            rating: Number(fetchedService.rating || 5.0),
            reviewCount: Number(fetchedService.reviewCount || 0),
            price: fetchedService.price,
            providerName: fetchedService.provider?.user?.name || 'Verified Service Provider',
            providerId: fetchedService.provider?.id || fetchedService.providerId,
            verified: true,
            image:
              (fetchedService.images && fetchedService.images[0]) ||
              'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80',
            description:
              fetchedService.description ||
              'Service information will appear here once a provider adds it.',
            whatsIncluded: [
              'Professional service execution',
              'Quality check post completion',
            ],
            similarServices: [],
          });
        } else {
          setServiceError('Service not found');
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        setServiceError('Failed to load service details.');
      } finally {
        setLoadingService(false);
      }
    };

    fetchService();
  }, [id]);

  if (loadingService) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (serviceError || !service) {
    return (
      <div className="flex h-72 flex-col items-center justify-center text-center">
        <h2 className="font-display text-2xl text-ink">Service not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {serviceError || "The service you're looking for doesn't exist."}
        </p>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-6">
          Go back
        </Button>
      </div>
    );
  }

  const similarServices = service.similarServices || [];

  const handleBookNow = () => {
    setLoadingBooking(true);
    navigate('/checkout', {
      state: {
        serviceId: service.id,
        title: service.title,
        price: service.price,
        quantity,
        location: locationAddress,
        coords,
        providerName: service.providerName,
        providerId: service.providerId,
        date: selectedDate,
        timeSlot: selectedSlot,
      },
    });
  };

  return (
    <div className="mx-auto max-w-[1180px] pb-16">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 transition-colors hover:text-ink">
          <ArrowLeft size={12} /> Back
        </button>
        <span className="opacity-50">/</span>
        <Link to="/" className="transition-colors hover:text-ink">Home</Link>
        <span className="opacity-50">/</span>
        <Link to="/services" className="transition-colors hover:text-ink">Services</Link>
        <span className="opacity-50">/</span>
        <Link
          to={`/services?category=${encodeURIComponent(service.category || 'All')}`}
          className="transition-colors hover:text-ink"
        >
          {service.category || 'All'}
        </Link>
        <span className="opacity-50">/</span>
        <span className="max-w-[180px] truncate font-medium text-ink">{service.title}</span>
      </nav>

      <div className="mt-5 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Main column */}
        <div className="space-y-8 lg:col-span-8">
          <div className="overflow-hidden rounded-lg border border-hairline bg-card">
            <div className="relative h-72 w-full overflow-hidden bg-surface-soft md:h-[380px]">
              <img src={service.image} alt={service.title} className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141413]/70 via-[#141413]/5 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="rounded-pill border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white backdrop-blur-md">
                    {service.category}
                  </span>
                  <h1 className="mt-3 max-w-[24ch] font-display text-[clamp(2rem,4vw,3rem)] leading-[1.02] tracking-[-0.03em] text-white">
                    {service.title}
                  </h1>
                </div>
                <span className="flex items-center gap-1.5 rounded-pill border border-white/20 bg-[#141413]/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                  <Star size={12} className="fill-accent-amber text-accent-amber" />
                  {service.rating.toFixed(1)}
                  <span className="text-white/60">({service.reviewCount.toLocaleString()})</span>
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display text-lg text-primary">
                    {(service.providerName || 'S').charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-medium text-ink">{service.providerName}</span>
                      <BadgeCheckIcon />
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Verified professional · {service.category}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Starting at</p>
                  <p className="font-display text-[1.9rem] leading-none text-ink">
                    ₹{Number(service.price).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6 flex gap-7 border-b border-hairline">
                {['Overview', 'Reviews', 'Gallery'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'relative pb-3 text-[12px] font-medium transition-colors',
                      activeTab === tab ? 'text-ink' : 'text-muted-foreground hover:text-ink'
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'Overview' && (
                <div className="space-y-7 pt-6">
                  <div>
                    <h2 className="font-display text-[1.5rem] leading-tight text-ink">About this service</h2>
                    <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[12px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      What’s included
                    </h3>
                    <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {service.whatsIncluded.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 rounded-md border border-hairline bg-surface-soft/50 px-3 py-2.5 text-xs text-body"
                        >
                          <CheckCircle2 size={15} className="shrink-0 text-accent-teal" strokeWidth={1.9} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md border border-hairline bg-surface-soft/50 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={18} className="mt-0.5 shrink-0 text-accent-teal" strokeWidth={1.7} />
                      <div>
                        <p className="text-[13px] font-medium text-ink">The ServiceHub guarantee</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          Every booking is backed by our service guarantee. If the work isn’t right,
                          we’ll arrange for it to be put right.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Reviews' && (
                <div className="pt-6">
                  <div className="flex items-center gap-6 rounded-md border border-hairline bg-surface-soft/50 p-5">
                    <div className="text-center">
                      <p className="font-display text-4xl leading-none text-ink">
                        {service.rating.toFixed(1)}
                      </p>
                      <div className="mt-1.5 flex justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            size={11}
                            className={n <= Math.round(service.rating) ? 'fill-accent-amber text-accent-amber' : 'text-hairline'}
                          />
                        ))}
                      </div>
                      <p className="mt-1.5 text-[10px] text-muted-foreground">
                        {service.reviewCount.toLocaleString()} reviews
                      </p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center gap-2">
                          <span className="w-2 text-[10px] text-muted-foreground">{star}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-hairline">
                            <div
                              className="h-full rounded-full bg-accent-amber"
                              style={{ width: `${star === 5 ? 76 : star === 4 ? 18 : star === 3 ? 4 : 1}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="mt-5 text-xs text-muted-foreground">
                    Reviews from verified bookings will appear here once this service has been
                    completed.
                  </p>
                </div>
              )}

              {activeTab === 'Gallery' && (
                <div className="pt-6">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[service.image, service.image, service.image].map((src, index) => (
                      <div
                        key={index}
                        className={cn(
                          'overflow-hidden rounded-md bg-surface-soft',
                          index === 0 ? 'col-span-2 aspect-[16/10] sm:col-span-2' : 'aspect-square'
                        )}
                      >
                        <img src={src} alt="" className="h-full w-full object-cover opacity-90" />
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground">
                    A closer look at the work and the people behind it.
                  </p>
                </div>
              )}
            </div>
          </div>

          {similarServices.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[1.6rem] text-ink">You may also like</h3>
                <Link
                  to="/services"
                  className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  View all <ChevronRight size={13} />
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {similarServices.map((sim) => (
                  <button
                    key={sim.id}
                    onClick={() => navigate(`/services/${sim.id}`)}
                    className="group overflow-hidden rounded-lg border border-hairline bg-card text-left transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]"
                  >
                    <img src={sim.image} alt={sim.title} className="h-28 w-full object-cover" />
                    <div className="p-3.5">
                      <h4 className="truncate text-xs font-medium text-ink">{sim.title}</h4>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Star size={10} className="fill-accent-amber text-accent-amber" />
                        <span>{sim.rating} ({sim.reviews})</span>
                      </div>
                      <p className="mt-2 text-xs font-medium text-primary">₹{sim.price} onwards</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking panel */}
        <aside className="self-start lg:col-span-4 lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-lg border border-hairline bg-card shadow-[var(--shadow-soft)]">
            <div className="border-b border-hairline bg-surface-soft/60 px-5 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[1.35rem] text-ink">Book this service</h3>
                <Badge variant="success" className="gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-teal" />
                  Available
                </Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Choose a time, confirm your address, and we’ll handle the rest.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Select date
                  </span>
                  <CalendarIcon size={13} className="text-muted-foreground" />
                </div>
                <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-1">
                  {dates.map((date) => {
                    const active = selectedDate === date.label;
                    return (
                      <button
                        key={date.key}
                        type="button"
                        onClick={() => setSelectedDate(date.label)}
                        className={cn(
                          'flex min-w-[50px] flex-col items-center rounded-md border px-2 py-2 transition-all',
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-hairline bg-canvas text-body hover:border-ink/20'
                        )}
                      >
                        <span className={cn('text-[9px] uppercase tracking-[0.08em]', active ? 'text-white/70' : 'text-muted-foreground')}>
                          {date.weekday}
                        </span>
                        <span className="mt-0.5 text-sm font-medium tabular-nums">{date.day}</span>
                        <span className={cn('text-[9px]', active ? 'text-white/70' : 'text-muted-foreground')}>
                          {date.month}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Time slot
                  </span>
                  <Clock size={13} className="text-muted-foreground" />
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        'rounded-sm border py-2 text-[11px] font-medium transition-all',
                        selectedSlot === slot
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-hairline bg-canvas text-body hover:border-ink/20'
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Service address
                  </span>
                  <button
                    type="button"
                    onClick={detectExactLocation}
                    disabled={detectingLocation}
                    className="flex items-center gap-1 rounded-sm text-[10px] font-medium text-primary transition-colors hover:text-primary-active disabled:opacity-60"
                    title="Detect current GPS location"
                  >
                    {detectingLocation ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Crosshair size={11} />
                    )}
                    {detectingLocation ? 'Detecting…' : 'Use my location'}
                  </button>
                </div>
                <div className="rounded-md border border-hairline bg-surface-soft/50 p-2.5">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="mt-1 shrink-0 text-primary" />
                    <input
                      type="text"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      placeholder="Enter street address or apartment"
                      className="w-full rounded-xs border-0 bg-transparent p-1 text-[11px] text-ink outline-hidden placeholder:text-muted-foreground focus:ring-0"
                    />
                  </div>
                  {locationStatus && (
                    <p className="mt-1 pl-6 text-[10px] text-accent-teal">{locationStatus}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-y border-hairline py-3">
                <span className="text-[11px] font-medium text-body">Quantity</span>
                <div className="flex items-center gap-3 rounded-md border border-hairline bg-surface-soft p-0.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-xs bg-canvas text-ink transition-colors hover:bg-surface-cream-strong"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="min-w-[12px] text-center text-xs font-medium tabular-nums text-ink">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-xs bg-canvas text-ink transition-colors hover:bg-surface-cream-strong"
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Total</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    ₹{Number(service.price).toLocaleString('en-IN')} × {quantity}
                  </p>
                </div>
                <p className="font-display text-[2rem] leading-none text-ink">
                  ₹{(service.price * quantity).toLocaleString('en-IN')}
                </p>
              </div>

              {bookingSuccess ? (
                <div className="rounded-md border border-accent-teal/25 bg-accent-teal/10 p-3 text-center text-xs font-medium text-accent-teal">
                  Booking confirmed. Redirecting…
                </div>
              ) : (
                <Button onClick={handleBookNow} fullWidth loading={loadingBooking} size="lg">
                  Continue to booking
                </Button>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                <Shield size={12} className="text-accent-teal" />
                Encrypted payment · Free cancellation up to 24h
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-hairline px-3 py-2.5">
            <Sparkles size={13} className="shrink-0 text-primary" />
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              New here? Your first booking is covered by our satisfaction guarantee.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

const BadgeCheckIcon = () => (
  <span title="Verified" className="inline-flex text-accent-teal">
    <ShieldCheck size={13} strokeWidth={1.9} />
  </span>
);
