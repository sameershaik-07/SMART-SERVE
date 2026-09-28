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
  Info,
  ChevronLeft,
  ChevronRight,
  Shield,
  Plus,
  Minus,
  Crosshair,
  Loader2
} from 'lucide-react';
import { getBookingByIdApi, createBookingApi } from '../../api/bookings';
import { getServicesApi, getServiceByIdApi } from '../../api/services';
import { Button } from '../../components/common/Button';
import { getAccurateGPSLocation, reverseGeocodeCoords } from '../../utils/geolocation';

export const ServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedDate, setSelectedDate] = useState('8 June 2025');
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [quantity, setQuantity] = useState(1);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [locationAddress, setLocationAddress] = useState('Home - Macherla, Palnadu District, Andhra Pradesh 522426');
  const [coords, setCoords] = useState({ lat: 16.4800, lng: 79.4300 });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  const timeSlots = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM', '05:00 PM'];

  const detectExactLocation = async () => {
    setDetectingLocation(true);
    setLocationStatus("Detecting GPS...");

    try {
      const loc = await getAccurateGPSLocation();
      setCoords({ lat: loc.lat, lng: loc.lng });
      setLocationStatus(`Resolving address (±${loc.accuracy}m accuracy)...`);

      const readableAddress = await reverseGeocodeCoords(loc.lat, loc.lng);
      setLocationAddress(readableAddress);
      setLocationStatus(`📍 Exact GPS locked: ${loc.source.toUpperCase()} (±${loc.accuracy}m)`);
    } catch (err) {
      console.warn('[ServiceDetailsPage] Location detection error:', err);
      setLocationStatus(err.message || 'GPS blocked. Please check browser permissions.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const parsedId = Number(id);
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
              image: (fetchedService.images && fetchedService.images[0]) || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
              description: fetchedService.description || 'Service information will appear here once a provider adds it.',
              whatsIncluded: [
                'Professional service execution',
                'Quality check post completion'
              ],
              similarServices: []
           });
        } else {
           setServiceError('Service not found');
        }
      } catch (err) {
        console.error("Error fetching service:", err);
        setServiceError('Failed to load service details.');
      } finally {
        setLoadingService(false);
      }
    };
    
    fetchService();
  }, [id]);

  if (loadingService) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  if (serviceError || !service) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Service Not Found</h2>
        <p className="text-slate-500 mb-6">{serviceError || "The service you're looking for doesn't exist."}</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  const similarServices = service.similarServices || [];

  const handleBookNow = () => {
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
      },
    });
  };

  return (
    <div className="service-details space-y-6 animate-fade-in pb-16">
      {/* Top Breadcrumb Navigation matching Reference Image 4 */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <button onClick={() => navigate(-1)} className="hover:text-purple-600 flex items-center gap-1">
          <ArrowLeft size={14} /> Back
        </button>
        <span>/</span>
        <Link to="/" className="hover:text-purple-600">Home</Link>
        <span>/</span>
        <Link to="/services" className="hover:text-purple-600">Services</Link>
        <span>/</span>
        <Link to={`/services?category=${encodeURIComponent(service.category || 'Beauty')}`} className="hover:text-purple-600 font-medium">
          {service.category || 'Beauty'}
        </Link>
        <span>/</span>
        <span className="text-purple-700 font-bold">{service.title}</span>
      </div>

      {/* Main Grid Layout (Left Content + Right Booking Widget) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Service Banner Image & Info Card */}
          <div className="sh-card p-6 space-y-6">
            {/* Hero Image Container */}
            <div className="relative h-72 md:h-80 w-full rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover"
              />
              {/* Rating Overlay Pill */}
              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <span>4.8 ({service.reviewCount.toLocaleString()} reviews)</span>
              </div>
            </div>

            {/* Title & Provider Row */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                  {service.title}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>{service.rating} ({service.reviewCount.toLocaleString()} reviews)</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
                    <ShieldCheck size={14} /> Highly rated service
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Price</span>
                <span className="text-2xl font-black text-foreground">₹{service.price}</span>
                <span className="text-xs text-slate-400 block font-medium">onwards</span>
              </div>
            </div>

            {/* Provider Card Badge */}
            <div className="flex items-center justify-between p-3.5 bg-muted/60 border border-border rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl font-extrabold flex items-center justify-center text-sm shadow-sm">
                  C
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-foreground">{service.providerName}</span>
                    <span className="bg-card text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full border border-border flex items-center gap-1">
                      <CheckCircle2 size={10} className="fill-current stroke-card" /> Verified
                    </span>
                  </div>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <Info size={18} />
              </button>
            </div>

            {/* Tabs: Overview, Reviews, Gallery */}
            <div className="border-b border-border flex gap-8">
              {['Overview', 'Reviews', 'Gallery'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-bold transition-all relative ${
                    activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content: About & Included */}
            {activeTab === 'Overview' && (
              <div className="space-y-6 pt-2">
                <div>
                  <h3 className="text-base font-bold text-foreground mb-2">About This Service</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground mb-3">What's Included</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.whatsIncluded.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-foreground">
                        <CheckCircle2 size={16} className="text-foreground shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar Date Availability Widget matching Reference Image 4 */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-foreground">Select Date</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <ChevronLeft size={16} className="cursor-pointer hover:text-foreground" />
                      <span>June 2025</span>
                      <ChevronRight size={16} className="cursor-pointer hover:text-foreground" />
                    </div>
                  </div>

                  {/* Mock Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-muted-foreground text-[11px] py-1">{day}</div>
                    ))}
                    {[25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 1, 2, 3, 4, 5].slice(0, 35).map((num, index) => {
                      const isSelected = num === 8;
                      const isAvailable = num >= 8 && num <= 28;
                      return (
                        <button
                          key={index}
                          onClick={() => isAvailable && setSelectedDate(`${num} June 2025`)}
                          disabled={!isAvailable}
                          className={`py-2 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : isAvailable
                              ? 'bg-muted hover:bg-accent text-foreground'
                              : 'text-muted-foreground/40 cursor-not-allowed'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 mt-4 text-xs font-semibold text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-foreground"></span> Available
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40"></span> Unavailable
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Similar Services Carousel / Section matching Reference Image 4 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Similar Services You May Like</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-600">
                <span>View All</span>
                <ChevronRight size={14} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarServices.map((sim) => (
                <div
                  key={sim.id}
                  onClick={() => navigate(`/services/${sim.id}`)}
                  className="sh-card p-3 cursor-pointer hover:border-purple-200 transition-all bg-white"
                >
                  <img
                    src={sim.image}
                    alt={sim.title}
                    className="h-28 w-full object-cover rounded-xl mb-2"
                  />
                  <h4 className="font-bold text-xs text-slate-800 truncate">{sim.title}</h4>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span>{sim.rating} ({sim.reviews})</span>
                  </div>
                  <div className="mt-2 text-xs font-extrabold text-purple-700">₹{sim.price} onwards</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sticky Booking Panel (4 cols) matching Reference Image 4 */}
        <div className="lg:col-span-4 self-start">
          <div className="sh-card p-6 border border-border shadow-lg space-y-5">
            <h3 className="text-lg font-extrabold text-foreground pb-3 border-b border-border">
              Book This Service
            </h3>

            {/* Select Date */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5 flex items-center justify-between">
                <span>Select Date</span>
                <CalendarIcon size={14} className="text-foreground" />
              </label>
              <div className="p-3 bg-muted border border-border rounded-xl text-xs font-bold text-foreground flex items-center justify-between">
                <span>{selectedDate}</span>
                <ChevronRight size={14} className="text-slate-400 rotate-90" />
              </div>
            </div>

            {/* Select Time Slot */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-2 flex items-center justify-between">
                <span>Select Time Slot</span>
                <Clock size={14} className="text-foreground" />
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                      selectedSlot === slot
                        ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                        : 'bg-card border-border text-foreground hover:bg-muted'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Address Selector & GPS Auto-Detection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-foreground">Service Address</label>
                <button
                  type="button"
                  onClick={detectExactLocation}
                  disabled={detectingLocation}
                  className="text-[11px] font-bold text-foreground hover:text-muted-foreground flex items-center gap-1 bg-muted hover:bg-accent px-2 py-0.5 rounded-md transition-colors"
                  title="Ask browser permission to detect exact current GPS location"
                >
                  {detectingLocation ? (
                    <Loader2 size={12} className="animate-spin text-foreground" />
                  ) : (
                    <Crosshair size={12} className="text-foreground" />
                  )}
                  {detectingLocation ? "Detecting..." : "Auto-Detect GPS"}
                </button>
              </div>

              <div className="p-3 bg-muted/60 border border-border rounded-xl space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-foreground shrink-0 mt-1" />
                  <input
                    type="text"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    placeholder="Enter street address or apartment"
                    className="w-full bg-card border border-border rounded-lg p-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                {locationStatus && (
                  <div className="text-[10px] font-semibold text-purple-700 pl-6 flex items-center gap-1">
                    <span>{locationStatus}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between py-2 border-y border-border">
              <span className="text-xs font-bold text-foreground">Quantity</span>
              <div className="flex items-center gap-3 bg-muted p-1 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 bg-card rounded-lg flex items-center justify-center text-foreground font-bold shadow-sm hover:bg-accent"
                >
                  <Minus size={14} />
                </button>
                <span className="text-xs font-bold text-foreground px-1">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 bg-card rounded-lg flex items-center justify-center text-foreground font-bold shadow-sm hover:bg-accent"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Total Price & Book Now Button */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Total Price</span>
                <span className="text-2xl font-black text-foreground">
                  ₹{(service.price * quantity).toLocaleString()}
                </span>
              </div>

              {bookingSuccess ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold text-center">
                  🎉 Booking Confirmed! Redirecting...
                </div>
              ) : (
                <Button
                  onClick={handleBookNow}
                  fullWidth
                  loading={loadingBooking}
                  size="lg"
                >
                  Book Now →
                </Button>
              )}
            </div>

            {/* Secure Payment Badge */}
            <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-500 font-semibold">
              <Shield size={14} className="text-emerald-600" />
              <span>Your payment is encrypted and secure.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
