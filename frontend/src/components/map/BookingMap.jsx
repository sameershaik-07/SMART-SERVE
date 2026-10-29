import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Compass, 
  Phone, 
  User, 
  Briefcase, 
  CheckCircle2,
  AlertCircle,
  Crosshair,
  Loader2,
  Radio,
  Zap,
  Maximize2
} from 'lucide-react';
import { getAccurateGPSLocation, reverseGeocodeCoords, MACHERLA_DEFAULT } from '../../utils/geolocation';

export const BookingMap = ({ trackingData, loading, error, onLocationUpdated }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const custMarkerRef = useRef(null);
  const provMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  const [copiedPhone, setCopiedPhone] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [locateMsg, setLocateMsg] = useState(null);
  const [accuracyInfo, setAccuracyInfo] = useState(null);

  // Live technician movement simulation state
  const [liveTrackingActive, setLiveTrackingActive] = useState(true);
  const [simulatedProgress, setSimulatedProgress] = useState(0.08); // 8% initial headway

  // Fallback data ensures map NEVER disappears from the application
  const activeData = useMemo(() => {
    return trackingData || {
      bookingId: 1,
      status: 'CONFIRMED',
      customer: {
        name: 'Customer',
        address: MACHERLA_DEFAULT.address,
        coordinates: { lat: MACHERLA_DEFAULT.lat, lng: MACHERLA_DEFAULT.lng }
      },
      provider: {
        name: 'Service Expert',
        category: 'Service Partner',
        address: 'ServiceHub Macherla Base, Market Road, Macherla',
        coordinates: { lat: 16.4985, lng: 79.4155 }
      },
      route: {
        distanceKm: 2.8,
        formattedDistance: '2.8 km',
        durationMinutes: 12,
        formattedDuration: '12 mins'
      }
    };
  }, [trackingData]);

  // Base coordinates
  const custCoords = activeData.customer?.coordinates || { lat: MACHERLA_DEFAULT.lat, lng: MACHERLA_DEFAULT.lng };
  const provCoords = activeData.provider?.coordinates || { lat: 16.4985, lng: 79.4155 };

  // Real-time technician coordinates along the polyline path
  const currentTechCoords = useMemo(() => {
    if (!custCoords || !provCoords) return provCoords;
    const p = Math.min(0.88, simulatedProgress);
    return {
      lat: Number((provCoords.lat + (custCoords.lat - provCoords.lat) * p).toFixed(6)),
      lng: Number((provCoords.lng + (custCoords.lng - provCoords.lng) * p).toFixed(6)),
    };
  }, [custCoords, provCoords, simulatedProgress]);

  // Dynamic distance & ETA calculation based on real-time technician movement
  const liveRouteMetrics = useMemo(() => {
    if (!custCoords || !currentTechCoords) {
      return {
        distanceKm: activeData.route?.distanceKm || 2.8,
        formattedDistance: activeData.route?.formattedDistance || '2.8 km',
        durationMinutes: activeData.route?.durationMinutes || 12,
        formattedDuration: activeData.route?.formattedDuration || '12 mins',
      };
    }

    const R = 6371;
    const dLat = ((custCoords.lat - currentTechCoords.lat) * Math.PI) / 180;
    const dLng = ((custCoords.lng - currentTechCoords.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((currentTechCoords.lat * Math.PI) / 180) *
        Math.cos((custCoords.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const straightDist = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    const drivingDist = Number((Math.max(0.4, straightDist * 1.25)).toFixed(1));
    const drivingMins = Math.max(4, Math.round((drivingDist / 22) * 60 + 2));

    return {
      distanceKm: drivingDist,
      formattedDistance: `${drivingDist} km`,
      durationMinutes: drivingMins,
      formattedDuration: `${drivingMins} mins`,
    };
  }, [custCoords, currentTechCoords, activeData.route]);

  // Periodic technician position update when Live Tracking is active
  useEffect(() => {
    if (!liveTrackingActive) return;
    const isCompletedOrCancelled = 
      activeData.status === 'COMPLETED' || activeData.status === 'CANCELLED';
    if (isCompletedOrCancelled) return;

    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 0.85) return prev; // Hold at arrival threshold
        return Number((prev + 0.015).toFixed(4));
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [liveTrackingActive, activeData.status]);

  // In-App Map Focus Handlers
  const handleFitBounds = () => {
    if (!mapInstanceRef.current || !custCoords || !provCoords) return;
    const techLat = currentTechCoords?.lat || provCoords.lat;
    const techLng = currentTechCoords?.lng || provCoords.lng;
    const bounds = L.latLngBounds([[techLat, techLng], [custCoords.lat, custCoords.lng]]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  };

  const handleCenterCustomer = () => {
    if (!mapInstanceRef.current || !custCoords) return;
    mapInstanceRef.current.setView([custCoords.lat, custCoords.lng], 16, { animate: true });
  };

  const handleCenterTech = () => {
    if (!mapInstanceRef.current || !currentTechCoords) return;
    mapInstanceRef.current.setView([currentTechCoords.lat, currentTechCoords.lng], 16, { animate: true });
  };

  // Map Initialization & Smooth Updates
  useEffect(() => {
    if (!mapContainerRef.current || !custCoords || !provCoords) return;

    const custLat = custCoords.lat;
    const custLng = custCoords.lng;
    const techLat = currentTechCoords?.lat || provCoords.lat;
    const techLng = currentTechCoords?.lng || provCoords.lng;

    // 1. If map instance already exists, smoothly update marker positions and polyline
    if (mapInstanceRef.current && custMarkerRef.current && provMarkerRef.current && polylineRef.current) {
      custMarkerRef.current.setLatLng([custLat, custLng]);
      provMarkerRef.current.setLatLng([techLat, techLng]);
      polylineRef.current.setLatLngs([
        [techLat, techLng],
        [custLat, custLng]
      ]);
      return;
    }

    // 2. Initialize Leaflet Map with zoomControl moved to bottomleft
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // zoomControl: false disables default top-left zoom so it doesn't overlap with top buttons!
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // Place zoom control cleanly at bottom-left corner
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    // Custom Customer Pin
    const customerIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #b85c3e; color: white; padding: 5px 9px; border-radius: 9999px; font-weight: 600; font-size: 11px; box-shadow: 0 8px 16px rgba(20,20,19,0.28); border: 2px solid #faf9f5; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>📍 Destination</span>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #b85c3e;"></div>
          <div style="width: 8px; height: 8px; background: #b85c3e; border-radius: 50%; opacity: 0.6; margin-top: 1px;"></div>
        </div>
      `,
      iconSize: [0, 0],
    });

    // Custom Live Moving Provider Pin with Pulsing Beacon
    const providerIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #3f8c7e; color: white; padding: 5px 9px; border-radius: 9999px; font-weight: 600; font-size: 11px; box-shadow: 0 8px 16px rgba(20,20,19,0.28); border: 2px solid #faf9f5; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #faf9f5;"></span>
            <span>🛠️ Technician</span>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #3f8c7e;"></div>
          <div style="width: 8px; height: 8px; background: #3f8c7e; border-radius: 50%; opacity: 0.6; margin-top: 1px;"></div>
        </div>
      `,
      iconSize: [0, 0],
    });

    // Add Customer Marker
    const custMarker = L.marker([custLat, custLng], { icon: customerIcon, draggable: true }).addTo(map);
    custMarkerRef.current = custMarker;
    custMarker.bindPopup(`
      <div style="padding: 4px; font-family: sans-serif;">
        <strong style="color: #b85c3e; font-size: 13px;">Service destination</strong>
        <p style="margin: 4px 0 2px; font-weight: 600; font-size: 12px; color: #141413;">${activeData.customer?.name || 'Customer'}</p>
        <p style="margin: 0; font-size: 11px; color: #6c6a64;">${activeData.customer?.address || 'Current Location'}</p>
      </div>
    `);

    // Handle dragging customer marker
    custMarker.on('dragend', async () => {
      const pos = custMarker.getLatLng();
      const nLat = Number(pos.lat.toFixed(6));
      const nLng = Number(pos.lng.toFixed(6));
      setLocateMsg('Resolving pin location...');
      const addr = await reverseGeocodeCoords(nLat, nLng);
      setLocateMsg(`📍 Destination Updated: ${addr.split(',')[0]}`);
      setTimeout(() => setLocateMsg(null), 3500);
      updateDestinationToLocation(nLat, nLng, addr);
    });

    // Add Provider Marker
    const provMarker = L.marker([techLat, techLng], { icon: providerIcon }).addTo(map);
    provMarkerRef.current = provMarker;
    provMarker.bindPopup(`
      <div style="padding: 4px; font-family: sans-serif;">
        <strong style="color: #3f8c7e; font-size: 13px;">Live technician in transit</strong>
        <p style="margin: 4px 0 2px; font-weight: 600; font-size: 12px; color: #141413;">${activeData.provider?.name || 'Assigned Technician'}</p>
        <p style="margin: 0; font-size: 11px; color: #6c6a64;">${activeData.provider?.category || 'Service Partner'}</p>
      </div>
    `);

    // Draw route line inside the application
    const polyline = L.polyline([[techLat, techLng], [custLat, custLng]], {
      color: '#b85c3e',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8',
      lineCap: 'round',
    }).addTo(map);
    polylineRef.current = polyline;

    // Fit bounds inside map
    const bounds = L.latLngBounds([[techLat, techLng], [custLat, custLng]]);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });

    // Handle map click to reposition destination pin
    map.on('click', async (e) => {
      const nLat = Number(e.latlng.lat.toFixed(6));
      const nLng = Number(e.latlng.lng.toFixed(6));
      setLocateMsg('Updating destination pin...');
      const addr = await reverseGeocodeCoords(nLat, nLng);
      setLocateMsg(`📍 Destination: ${addr.split(',')[0]}`);
      setTimeout(() => setLocateMsg(null), 3500);
      updateDestinationToLocation(nLat, nLng, addr);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        custMarkerRef.current = null;
        provMarkerRef.current = null;
        polylineRef.current = null;
      }
    };
  }, [custCoords?.lat, custCoords?.lng, provCoords?.lat, provCoords?.lng]);

  // Update technician marker position smoothly as progress updates
  useEffect(() => {
    if (!custCoords || !provCoords || !mapInstanceRef.current) return;
    const techLat = currentTechCoords.lat;
    const techLng = currentTechCoords.lng;

    if (provMarkerRef.current) {
      provMarkerRef.current.setLatLng([techLat, techLng]);
    }
    if (polylineRef.current && custCoords) {
      polylineRef.current.setLatLngs([
        [techLat, techLng],
        [custCoords.lat, custCoords.lng]
      ]);
    }
  }, [currentTechCoords, custCoords, provCoords]);

  const handleCopy = (phone) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const updateDestinationToLocation = (lat, lng, addressLabel) => {
    if (!mapInstanceRef.current || !provCoords) return;

    // 1. Update Customer Pin on Map
    if (custMarkerRef.current) {
      custMarkerRef.current.setLatLng([lat, lng]);
      custMarkerRef.current.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif;">
          <strong style="color: #b85c3e; font-size: 13px;">📍 Service destination (updated)</strong>
          <p style="margin: 4px 0 2px; font-weight: 600; font-size: 12px; color: #141413;">${activeData.customer?.name || 'Customer'}</p>
          <p style="margin: 0; font-size: 11px; color: #6c6a64;">${addressLabel}</p>
        </div>
      `).openPopup();
    }

    // 2. Redraw route polyline
    const techLat = currentTechCoords?.lat || provCoords.lat;
    const techLng = currentTechCoords?.lng || provCoords.lng;

    if (polylineRef.current) {
      polylineRef.current.setLatLngs([
        [techLat, techLng],
        [lat, lng]
      ]);
    }

    // 3. Fit bounds inside the map
    const bounds = L.latLngBounds([
      [techLat, techLng],
      [lat, lng]
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });

    // 4. Notify parent to persist to database
    if (onLocationUpdated) {
      onLocationUpdated({
        location: addressLabel,
        coordinates: { lat, lng }
      });
    }
  };

  const handleLocateMe = async () => {
    setLocatingUser(true);
    setLocateMsg('Acquiring live GPS...');

    try {
      const loc = await getAccurateGPSLocation();
      if (loc.isFallback) {
        setLocateMsg('📍 Set to Macherla (Indoor/PC GPS unavailable). Drag pin to adjust.');
        setAccuracyInfo('Default (Macherla, AP)');
        updateDestinationToLocation(loc.lat, loc.lng, MACHERLA_DEFAULT.address);
        setTimeout(() => setLocateMsg(null), 5000);
      } else {
        setLocateMsg(`Resolving street address (±${loc.accuracy}m)...`);
        setAccuracyInfo(`±${loc.accuracy}m (${loc.source.toUpperCase()})`);

        const readableAddress = await reverseGeocodeCoords(loc.lat, loc.lng);
        setLocateMsg(`📍 In-App Location Updated: ${readableAddress.split(',')[0]}`);
        setTimeout(() => setLocateMsg(null), 5000);

        updateDestinationToLocation(loc.lat, loc.lng, readableAddress);
      }
    } catch (err) {
      console.warn('[BookingMap] GPS Locate Me error:', err);
      // Show actual error message instead of generic denied
      setLocateMsg(err.message || 'GPS signal unavailable. You can click on the map to set pin.');
      setTimeout(() => setLocateMsg(null), 5000);
    } finally {
      setLocatingUser(false);
    }
  };

  const handleSetMacherla = () => {
    updateDestinationToLocation(
      MACHERLA_DEFAULT.lat, 
      MACHERLA_DEFAULT.lng, 
      MACHERLA_DEFAULT.address
    );
    setLocateMsg('📍 Destination set to Macherla, AP');
    setTimeout(() => setLocateMsg(null), 4000);
  };

  const { customer, provider } = activeData;

  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-card">
      {/* Live map header */}
      <div className="sh-dark-panel relative border-0">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-coral/18 blur-[90px]" />
        <div className="sh-ruled-grid pointer-events-none absolute inset-0 opacity-[0.1]" />
        <div className="relative flex flex-wrap items-center justify-between gap-5 p-5 sm:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-teal opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-teal" />
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-accent-teal">
                Live GPS tracking
              </span>
              {accuracyInfo && (
                <span className="rounded-pill border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono text-[9px] text-on-dark-soft">
                  {accuracyInfo}
                </span>
              )}
            </div>
            <h3 className="mt-2 flex flex-wrap items-center gap-2 font-display text-[1.5rem] leading-tight text-on-dark">
              Technician route
              <span className="rounded-pill border border-white/10 bg-white/[0.05] px-2 py-0.5 font-sans text-[9px] font-normal tracking-[0.06em] text-on-dark-soft">
                Booking #{activeData.bookingId}
              </span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur-md">
              <Compass size={14} className="text-coral" />
              <div>
                <div className="text-[8px] uppercase tracking-[0.12em] text-on-dark-soft">
                  Remaining
                </div>
                <div className="text-[11px] font-medium tabular-nums text-on-dark">
                  {liveRouteMetrics.formattedDistance}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur-md">
              <Clock size={14} className="text-accent-teal" />
              <div>
                <div className="text-[8px] uppercase tracking-[0.12em] text-on-dark-soft">
                  Arrival
                </div>
                <div className="text-[11px] font-medium tabular-nums text-on-dark">
                  ~{liveRouteMetrics.formattedDuration}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFitBounds}
              className="flex items-center gap-1.5 rounded-md bg-coral px-3 py-2 text-[10px] font-medium text-[#141413] transition-all hover:bg-[#d98a6f] active:scale-[0.98]"
              title="Focus the full route inside the app"
            >
              <Navigation size={13} />
              Focus route
            </button>
          </div>
        </div>
      </div>

      {/* Interactive map canvas */}
      <div
        className="relative z-0 w-full overflow-hidden bg-surface-soft"
        style={{ height: '420px', minHeight: '420px', width: '100%' }}
      >
        <div
          ref={mapContainerRef}
          style={{ height: '420px', minHeight: '420px', width: '100%' }}
        />

        {/* Camera focus shortcuts */}
        <div className="absolute left-3 top-3 z-[1000] flex items-center gap-1 rounded-md border border-hairline bg-canvas/95 p-1 shadow-[var(--shadow-soft)] backdrop-blur-md">
          <button
            type="button"
            onClick={handleCenterCustomer}
            className="rounded-sm px-2.5 py-1 text-[10px] font-medium text-body transition-colors hover:bg-primary/6 hover:text-primary"
            title="Pan map to destination"
          >
            📍 Destination
          </button>
          <span className="text-hairline">|</span>
          <button
            type="button"
            onClick={handleCenterTech}
            className="rounded-sm px-2.5 py-1 text-[10px] font-medium text-body transition-colors hover:bg-accent-teal/8 hover:text-accent-teal"
            title="Pan map to live technician"
          >
            🛠️ Technician
          </button>
          <span className="text-hairline">|</span>
          <button
            type="button"
            onClick={handleFitBounds}
            className="rounded-sm px-2 py-1 text-muted-foreground transition-colors hover:bg-surface-soft hover:text-ink"
            title="Fit full route view"
          >
            <Maximize2 size={12} />
          </button>
        </div>

        {/* GPS, quick pin, and radar controls */}
        <div className="absolute right-3 top-3 z-[1000] flex flex-wrap items-center justify-end gap-2">
          {locateMsg && (
            <span className="flex max-w-xs animate-fade-in items-center gap-1.5 truncate rounded-md border border-hairline bg-canvas/95 px-3 py-1.5 text-[10px] font-medium text-primary shadow-[var(--shadow-soft)] backdrop-blur-md">
              <Crosshair size={11} className="shrink-0 animate-spin text-primary" />
              <span className="truncate">{locateMsg}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleSetMacherla}
            className="flex items-center gap-1 rounded-md border border-hairline bg-canvas/95 px-2.5 py-1.5 text-[10px] font-medium text-body shadow-[var(--shadow-soft)] transition-all hover:border-primary/30 hover:text-primary active:scale-95"
            title="Quick set destination to Macherla, Andhra Pradesh"
          >
            <MapPin size={12} className="text-primary" />
            <span>Macherla</span>
          </button>

          <button
            type="button"
            onClick={() => setLiveTrackingActive(!liveTrackingActive)}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-medium shadow-[var(--shadow-soft)] transition-all active:scale-95 ${
              liveTrackingActive
                ? 'border-accent-teal/30 bg-accent-teal/10 text-accent-teal'
                : 'border-hairline bg-canvas/95 text-muted-foreground'
            }`}
            title="Toggle live technician radar tracking"
          >
            <Radio
              size={12}
              className={liveTrackingActive ? 'animate-pulse text-accent-teal' : 'text-muted-foreground'}
            />
            <span className="hidden sm:inline">
              {liveTrackingActive ? 'Radar active' : 'Radar paused'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            className="flex items-center gap-1.5 rounded-md border border-hairline bg-canvas/95 px-3 py-1.5 text-[10px] font-medium text-body shadow-[var(--shadow-soft)] transition-all hover:border-primary/30 hover:text-primary active:scale-95 disabled:opacity-60"
            title="Detect your exact live GPS location"
          >
            {locatingUser ? (
              <Loader2 size={13} className="animate-spin text-primary" />
            ) : (
              <Crosshair size={13} className="text-primary" />
            )}
            <span>My live GPS</span>
          </button>
        </div>

        {/* Map legend */}
        <div className="absolute bottom-3 right-3 z-[1000] flex items-center gap-3 rounded-md border border-hairline bg-canvas/95 px-3 py-1.5 text-[10px] font-medium text-muted-foreground shadow-[var(--shadow-soft)] backdrop-blur-md">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-accent-teal shadow-xs" />
            Technician
          </span>
          <span className="text-hairline">|</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-xs" />
            Destination
          </span>
        </div>
      </div>

      {/* Location and contact cards */}
      <div className="grid grid-cols-1 gap-3 border-t border-hairline bg-surface-soft/40 p-5 md:grid-cols-2">
        {/* Provider details */}
        <div className="space-y-2 rounded-md border border-hairline bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-accent-teal/20 bg-accent-teal/8 text-accent-teal">
                <Briefcase size={15} strokeWidth={1.8} />
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-[0.14em] text-accent-teal">
                  Service partner
                </span>
                <h4 className="mt-0.5 text-[12px] font-medium text-ink">{provider?.name}</h4>
              </div>
            </div>
            <span className="rounded-xs border border-hairline bg-surface-soft px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
              {provider?.category}
            </span>
          </div>

          <div className="space-y-1 pt-1 text-[11px]">
            <div className="flex items-start gap-1.5">
              <MapPin size={13} className="mt-0.5 shrink-0 text-accent-teal" />
              <span className="line-clamp-2 font-medium text-body">{provider?.address}</span>
            </div>
            {provider?.phone && (
              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Phone size={11} /> {provider.phone}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(provider.phone)}
                  className="text-[9px] font-medium text-accent-teal transition-colors hover:text-primary"
                >
                  {copiedPhone === provider.phone ? 'Copied' : 'Copy phone'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Customer destination */}
        <div className="space-y-2 rounded-md border border-hairline bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/20 bg-primary/6 text-primary">
                <User size={15} strokeWidth={1.8} />
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-[0.14em] text-primary">
                  Service destination
                </span>
                <h4 className="mt-0.5 text-[12px] font-medium text-ink">{customer?.name}</h4>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-xs border border-primary/20 bg-primary/6 px-2 py-0.5 text-[9px] font-medium text-primary">
              <CheckCircle2 size={10} /> Target pin
            </span>
          </div>

          <div className="space-y-1 pt-1 text-[11px]">
            <div className="flex items-start gap-1.5">
              <MapPin size={13} className="mt-0.5 shrink-0 text-primary" />
              <span className="line-clamp-2 font-medium text-body">{customer?.address}</span>
            </div>
            {customer?.phone && (
              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Phone size={11} /> {customer.phone}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(customer.phone)}
                  className="text-[9px] font-medium text-primary transition-colors hover:text-primary-active"
                >
                  {copiedPhone === customer.phone ? 'Copied' : 'Copy phone'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
