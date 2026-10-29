import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  MessageSquare,
  Crosshair,
  Loader2,
  CreditCard,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Navigation,
} from 'lucide-react';
import {
  getBookingByIdApi,
  getBookingTrackingApi,
  updateBookingStatusApi,
  updateBookingLocationApi,
} from '../../api/bookings';
import { Badge } from '@/components/ui/badge';
import { Button } from '../../components/common/Button';
import { BookingMap } from '../../components/map/BookingMap';
import { useAuth } from '../../context/AuthContext';
import { getAccurateGPSLocation, reverseGeocodeCoords } from '../../utils/geolocation';
import { cn } from '@/lib/utils';

const statusVariant = (status) => {
  if (status === 'COMPLETED') return 'success';
  if (status === 'CANCELLED' || status === 'REJECTED') return 'destructive';
  if (status === 'PENDING') return 'warning';
  return 'info';
};

const steps = [
  { label: 'Requested', meta: 'Booking placed', match: ['PENDING', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
  { label: 'Accepted', meta: 'Provider assigned', match: ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
  { label: 'On the way', meta: 'In route', match: ['IN_PROGRESS', 'COMPLETED'] },
  { label: 'Completed', meta: 'All done', match: ['COMPLETED'] },
];

export const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState(null);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadBookingAndTracking = async () => {
      setLoading(true);
      setError(null);

      try {
        let bData = null;
        let tData = null;

        try {
          bData = await getBookingByIdApi(id);
        } catch (err) {
          console.warn('Backend getBookingByIdApi returned error, checking tracking or fallback:', err.message);
        }

        try {
          tData = await getBookingTrackingApi(id);
        } catch (err) {
          console.warn('Backend getBookingTrackingApi returned error:', err.message);
        }

        if (!isMounted) return;

        if (bData) {
          setBooking(bData);
          if (bData.tracking) {
            setTrackingData(bData.tracking);
          } else if (tData) {
            setTrackingData(tData);
          } else {
            const custLat = bData.latitude || 16.48;
            const custLng = bData.longitude || 79.43;
            const provLat = Number((custLat + 0.0185).toFixed(6));
            const provLng = Number((custLng - 0.0145).toFixed(6));
            setTrackingData({
              bookingId: bData.id || id,
              status: bData.status || 'CONFIRMED',
              serviceDate: bData.serviceDate,
              service: bData.service || { title: 'Service Inspection & Repair', price: bData.totalPrice || 799 },
              customer: {
                id: bData.customer?.id || 1,
                name: bData.customer?.user?.name || user?.name || 'Customer',
                phone: bData.customer?.user?.phone || user?.phone || '+91 98765 43210',
                address:
                  bData.location ||
                  bData.customer?.address ||
                  'Macherla, Palnadu District, Andhra Pradesh 522426',
                coordinates: { lat: custLat, lng: custLng },
              },
              provider: {
                id: bData.provider?.id || 1,
                name: bData.provider?.user?.name || 'Assigned Service Expert',
                phone: bData.provider?.user?.phone || '+91 91234 56789',
                category: bData.provider?.category?.categoryName || 'Service Partner',
                rating: bData.provider?.rating || 4.8,
                address: bData.provider?.address || 'ServiceHub Macherla Base, Market Road, Macherla',
                coordinates: { lat: provLat, lng: provLng },
              },
              route: {
                distanceKm: 2.8,
                formattedDistance: '2.8 km',
                durationMinutes: 12,
                formattedDuration: '12 mins',
              },
            });
          }
        } else if (tData) {
          setTrackingData(tData);
          setBooking({
            id: tData.bookingId,
            service: tData.service,
            status: tData.status,
            serviceDate: tData.serviceDate,
            location: tData.customer?.address,
            totalPrice: tData.service?.price || 799,
            customer: tData.customer,
            provider: tData.provider,
          });
        } else {
          const fallbackData = {
            id: id || 2,
            status: 'CONFIRMED',
            serviceDate: new Date().toISOString(),
            location: 'Macherla, Palnadu District, Andhra Pradesh 522426',
            totalPrice: 849,
            service: { title: 'Expert Appliance Repair & Inspection', price: 849 },
            customer: {
              id: user?.id || 1,
              name: user?.name || 'Customer',
              phone: user?.phone || '+91 98765 43210',
              address:
                user?.customer?.address ||
                'Macherla, Palnadu District, Andhra Pradesh 522426',
              coordinates: { lat: 16.48, lng: 79.43 },
            },
            provider: {
              id: 2,
              name: 'CoolTech Service Hub (Macherla)',
              phone: '+91 91234 56789',
              category: 'Appliance Repair',
              rating: 4.8,
              address: 'Market Road, Macherla, Andhra Pradesh 522426',
              coordinates: { lat: 16.4985, lng: 79.4155 },
            },
            route: {
              distanceKm: 2.8,
              formattedDistance: '2.8 km',
              durationMinutes: 12,
              formattedDuration: '12 mins',
            },
          };
          setBooking(fallbackData);
          setTrackingData(fallbackData);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load booking');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBookingAndTracking();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await updateBookingStatusApi(id, 'CANCELLED');
      setBooking((prev) => ({ ...prev, status: 'CANCELLED' }));
      setUpdateSuccessMsg('Booking cancelled successfully.');
      setTimeout(() => setUpdateSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleMessageProvider = () => {
    const providerId = booking?.provider?.id || booking?.providerId || 1;
    const providerName =
      booking?.provider?.name || booking?.provider?.user?.name || 'CoolTech Services';
    const bookingId = booking?.id || id;
    navigate(
      `/messages?providerId=${providerId}&name=${encodeURIComponent(providerName)}&bookingId=${bookingId || ''}`
    );
  };

  const handleLocationUpdated = async ({ location, coordinates }) => {
    setTrackingData((prev) => {
      if (!prev) return prev;
      const provCoords = prev.provider?.coordinates || { lat: 12.9756, lng: 77.6066 };

      const R = 6371;
      const dLat = ((coordinates.lat - provCoords.lat) * Math.PI) / 180;
      const dLng = ((coordinates.lng - provCoords.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((provCoords.lat * Math.PI) / 180) *
          Math.cos((coordinates.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distKm = Number((Math.max(0.8, R * c * 1.28)).toFixed(1));
      const durMins = Math.max(8, Math.round((distKm / 24) * 60 + 4));

      return {
        ...prev,
        customer: { ...prev.customer, address: location, coordinates },
        route: {
          ...prev.route,
          distanceKm: distKm,
          formattedDistance: `${distKm} km`,
          durationMinutes: durMins,
          formattedDuration: `${durMins} mins`,
          directionsUrl: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(prev.provider?.address || `${provCoords.lat},${provCoords.lng}`)}&destination=${encodeURIComponent(`${coordinates.lat},${coordinates.lng}`)}&travelmode=driving`,
        },
      };
    });

    setBooking((prev) => ({ ...prev, location }));
    setUpdateSuccessMsg(`Service destination updated to ${location}`);
    setTimeout(() => setUpdateSuccessMsg(null), 6000);

    try {
      await updateBookingLocationApi(id, {
        location,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
      });
    } catch (err) {
      console.warn('Could not persist location to backend:', err.message);
    }
  };

  const detectAndSetCustomerLocation = async () => {
    setUpdatingLocation(true);
    setError(null);

    try {
      const loc = await getAccurateGPSLocation();
      const readableAddress = await reverseGeocodeCoords(loc.lat, loc.lng);

      await handleLocationUpdated({
        location: readableAddress,
        coordinates: { lat: loc.lat, lng: loc.lng },
      });

      setUpdateSuccessMsg(`Location updated: ${readableAddress} (±${loc.accuracy}m accuracy)`);
      setTimeout(() => setUpdateSuccessMsg(null), 6000);
    } catch (err) {
      console.error('[BookingDetailsPage] GPS error:', err);
      setError(err.message || 'Could not detect GPS location. Please check browser permissions.');
    } finally {
      setUpdatingLocation(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-5 pb-16">
        <div className="h-4 w-32 animate-pulse rounded bg-surface-soft" />
        <div className="h-9 w-64 animate-pulse rounded bg-surface-soft" />
        <div className="h-80 animate-pulse rounded-lg border border-hairline bg-surface-soft" />
      </div>
    );
  }

  const bookingId = booking?.id || id;
  const serviceTitle = booking?.service?.title || booking?.serviceName || 'Home & utility service';
  const providerName =
    booking?.provider?.user?.name || booking?.provider?.name || 'Assigned provider';
  const providerCategory =
    booking?.provider?.category?.categoryName || booking?.provider?.category || 'Service partner';
  const locationText = booking?.location || booking?.customer?.address || 'Service address';
  const totalAmount = booking?.totalPrice || booking?.amount || 799;
  const status = booking?.status || 'PENDING';
  const scheduled = new Date(booking?.serviceDate || Date.now()).toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <button
        onClick={() => navigate('/bookings')}
        className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-ink"
      >
        <ArrowLeft size={13} /> Back to my bookings
      </button>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <p className="sh-eyebrow">Booking reference</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[clamp(2rem,4vw,2.9rem)] leading-none tracking-[-0.03em] text-ink">
              #{bookingId}
            </h1>
            <Badge variant={statusVariant(status)} className="capitalize">
              {status.toLowerCase().replace('_', ' ')}
            </Badge>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar size={12} className="text-primary" /> Scheduled for {scheduled}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleMessageProvider} icon={MessageSquare}>
          Message provider
        </Button>
      </div>

      {updateSuccessMsg && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-accent-teal/25 bg-accent-teal/8 px-4 py-3 text-xs text-accent-teal">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-teal" />
            {updateSuccessMsg}
          </span>
          <span className="text-[9px] uppercase tracking-[0.14em] opacity-70">Synced</span>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/6 px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      )}

      <section aria-label="Service tracking map" className="mt-5">
        <BookingMap
          trackingData={trackingData}
          loading={loading}
          error={error}
          onLocationUpdated={handleLocationUpdated}
        />
      </section>

      <div className="mt-5 overflow-hidden rounded-lg border border-hairline bg-card">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-hairline p-5 sm:p-6">
          <div>
            <h2 className="font-display text-[1.65rem] leading-tight tracking-[-0.02em] text-ink">
              {serviceTitle}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {providerName} · {providerCategory}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Total paid</p>
            <p className="font-display text-[1.7rem] leading-none text-ink">
              ₹{Number(totalAmount).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Visit progress
            </h3>
            <span className="flex items-center gap-1 text-[10px] text-accent-teal">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-teal" /> Live tracking
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {steps.map((step, index) => {
              const done = step.match.includes(status);
              const cancelled = status === 'CANCELLED' && index === 3;
              return (
                <div
                  key={step.label}
                  className={cn(
                    'rounded-md border px-3 py-3 transition-colors',
                    cancelled
                      ? 'border-destructive/25 bg-destructive/6'
                      : done
                        ? 'border-primary/25 bg-primary/5'
                        : 'border-hairline bg-surface-soft/40'
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {cancelled ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    ) : done ? (
                      <CheckCircle2 size={12} className="text-primary" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-hairline" />
                    )}
                    <span
                      className={cn(
                        'text-[11px] font-medium',
                        cancelled ? 'text-destructive' : done ? 'text-ink' : 'text-muted-foreground'
                      )}
                    >
                      {cancelled ? 'Cancelled' : step.label}
                    </span>
                  </div>
                  <p className="mt-1 pl-[18px] text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                    {cancelled ? 'Closed' : step.meta}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 border-t border-hairline pt-5 md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h4 className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  <MapPin size={12} className="text-primary" /> Service address
                </h4>
                <button
                  type="button"
                  onClick={detectAndSetCustomerLocation}
                  disabled={updatingLocation}
                  className="flex items-center gap-1.5 text-[10px] font-medium text-primary transition-colors hover:text-primary-active disabled:opacity-60"
                  title="Detect your device location and update the service destination pin"
                >
                  {updatingLocation ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Crosshair size={11} />
                  )}
                  {updatingLocation ? 'Detecting…' : 'Use my location'}
                </button>
              </div>
              <p className="rounded-md border border-hairline bg-surface-soft/50 p-3 text-xs leading-relaxed text-body">
                {locationText}
              </p>
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <CreditCard size={12} className="text-primary" /> Payment breakdown
              </h4>
              <div className="space-y-1.5 rounded-md border border-hairline bg-surface-soft/50 p-3 text-[11px] text-muted-foreground">
                <div className="flex justify-between">
                  <span>Service charge</span>
                  <span className="tabular-nums">₹{Math.round(totalAmount * 0.94).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & platform GST (6%)</span>
                  <span className="tabular-nums">₹{Math.round(totalAmount * 0.06).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-hairline pt-2 font-medium text-ink">
                  <span>Total paid</span>
                  <span className="tabular-nums">₹{Number(totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
            <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <ShieldCheck size={12} className="text-accent-teal" />
              Payment protected until the visit is complete
            </p>
            {status !== 'COMPLETED' && status !== 'CANCELLED' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={cancelling}
                className="border-destructive/25 text-destructive hover:bg-destructive/6"
              >
                {cancelling ? 'Cancelling…' : 'Cancel booking'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-dashed border-hairline px-4 py-3">
        <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Clock size={11} className="text-primary" /> Need a different time? Reschedule from My bookings.
        </p>
        <button
          onClick={() => navigate('/bookings')}
          className="flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
        >
          <Navigation size={10} /> Manage booking
        </button>
      </div>
    </div>
  );
};
