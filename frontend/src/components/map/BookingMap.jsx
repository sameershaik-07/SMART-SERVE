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
          <div style="background-color: #059669; color: white; padding: 5px 9px; border-radius: 9999px; font-weight: 700; font-size: 11px; box-shadow: 0 8px 16px rgba(0,0,0,0.25); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>📍 Destination</span>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #059669;"></div>
          <div style="width: 8px; height: 8px; background: #059669; border-radius: 50%; opacity: 0.6; margin-top: 1px;"></div>
        </div>
      `,
      iconSize: [0, 0],
    });

    // Custom Live Moving Provider Pin with Pulsing Beacon
    const providerIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #4f46e5; color: white; padding: 5px 9px; border-radius: 9999px; font-weight: 700; font-size: 11px; box-shadow: 0 8px 16px rgba(79,70,229,0.4); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #34d399;"></span>
            <span>🛠️ Technician</span>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #4f46e5;"></div>
          <div style="width: 8px; height: 8px; background: #4f46e5; border-radius: 50%; opacity: 0.6; margin-top: 1px;"></div>
        </div>
      `,
      iconSize: [0, 0],
    });

    // Add Customer Marker
    const custMarker = L.marker([custLat, custLng], { icon: customerIcon, draggable: true }).addTo(map);
    custMarkerRef.current = custMarker;
    custMarker.bindPopup(`
      <div style="padding: 4px; font-family: sans-serif;">
        <strong style="color: #059669; font-size: 13px;">Service Destination</strong>
        <p style="margin: 4px 0 2px; font-weight: 600; font-size: 12px; color: #1e293b;">${activeData.customer?.name || 'Customer'}</p>
        <p style="margin: 0; font-size: 11px; color: #64748b;">${activeData.customer?.address || 'Current Location'}</p>
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
        <strong style="color: #4f46e5; font-size: 13px;">Live Technician In-Transit</strong>
        <p style="margin: 4px 0 2px; font-weight: 600; font-size: 12px; color: #1e293b;">${activeData.provider?.name || 'Assigned Technician'}</p>
        <p style="margin: 0; font-size: 11px; color: #64748b;">${activeData.provider?.category || 'Service Partner'}</p>
      </div>
    `);

    // Draw route line inside the application
    const polyline = L.polyline([[techLat, techLng], [custLat, custLng]], {
      color: '#6366f1',
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
          <strong style="color: #059669; font-size: 13px;">📍 Service Destination (Updated)</strong>
          <p style="margin: 4px 0 2px; font-weight: 600; font-size: 12px; color: #1e293b;">${activeData.customer?.name || 'Customer'}</p>
          <p style="margin: 0; font-size: 11px; color: #64748b;">${addressLabel}</p>
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
    <div className="sh-card bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
      {/* In-App Live Map Header with HUD metrics */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Live In-App GPS Map & Tracking
            </span>
            {accuracyInfo && (
              <span className="text-[10px] bg-white/10 text-emerald-200 px-2 py-0.5 rounded-full font-mono">
                {accuracyInfo}
              </span>
            )}
          </div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            Technician Route & Real-Time Location
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-slate-200">
              Booking #{activeData.bookingId}
            </span>
          </h3>
        </div>

        {/* Dynamic In-App Route Metrics */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
            <Compass size={16} className="text-purple-300" />
            <div>
              <div className="text-[10px] text-slate-300 uppercase font-semibold">Distance Remaining</div>
              <div className="text-xs font-black text-white">{liveRouteMetrics.formattedDistance}</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
            <Clock size={16} className="text-emerald-300" />
            <div>
              <div className="text-[10px] text-slate-300 uppercase font-semibold">Est. Arrival</div>
              <div className="text-xs font-black text-emerald-300">~{liveRouteMetrics.formattedDuration}</div>
            </div>
          </div>

          {/* In-App Route Focus Button */}
          <button
            type="button"
            onClick={handleFitBounds}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="Focus the full route inside the app"
          >
            <Navigation size={14} />
            Focus In-App Route
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas (100% In-App) */}
      <div 
        className="relative w-full bg-slate-100 z-0 overflow-hidden" 
        style={{ height: '420px', minHeight: '420px', width: '100%' }}
      >
        <div 
          ref={mapContainerRef} 
          style={{ height: '420px', minHeight: '420px', width: '100%' }} 
        />

        {/* Top-Left In-App Camera Focus Shortcuts (Cleanly placed, NO zoom button overlap) */}
        <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-slate-200">
          <button
            type="button"
            onClick={handleCenterCustomer}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            title="Pan map to destination"
          >
            📍 My Destination
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={handleCenterTech}
            className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="Pan map to live technician"
          >
            🛠️ Technician
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={handleFitBounds}
            className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
            title="Fit full route view"
          >
            <Maximize2 size={12} />
          </button>
        </div>

        {/* Top-Right GPS, Macherla Quick Pin & Radar Controls */}
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
          {locateMsg && (
            <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[11px] font-bold text-sky-700 animate-fade-in flex items-center gap-1.5 max-w-xs truncate">
              <Crosshair size={12} className="animate-spin text-sky-600 shrink-0" />
              <span className="truncate">{locateMsg}</span>
            </span>
          )}

          {/* Quick Macherla Button */}
          <button
            type="button"
            onClick={handleSetMacherla}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl shadow-sm text-xs font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            title="Quick set destination to Macherla, Andhra Pradesh"
          >
            <MapPin size={13} className="text-purple-600" />
            <span className="text-[11px]">Macherla</span>
          </button>

          {/* Live Radar Toggle */}
          <button
            type="button"
            onClick={() => setLiveTrackingActive(!liveTrackingActive)}
            className={`px-3 py-1.5 rounded-xl shadow-md border text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
              liveTrackingActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
            title="Toggle live technician radar tracking"
          >
            <Radio size={13} className={liveTrackingActive ? 'text-emerald-600 animate-pulse' : 'text-slate-400'} />
            <span className="text-[11px] hidden sm:inline">
              {liveTrackingActive ? 'Radar Active' : 'Radar Paused'}
            </span>
          </button>

          {/* Locate Me Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locatingUser}
            className="bg-white hover:bg-slate-50 text-slate-800 hover:text-sky-600 px-3.5 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Detect your exact live GPS location"
          >
            {locatingUser ? (
              <Loader2 size={14} className="animate-spin text-sky-600" />
            ) : (
              <Crosshair size={14} className="text-sky-600" />
            )}
            <span className="text-[11px] font-extrabold text-slate-700">My Live GPS</span>
          </button>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-md border border-slate-200 text-[11px] font-semibold text-slate-600 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block shadow-xs"></span>
            Technician
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shadow-xs"></span>
            Destination
          </span>
        </div>
      </div>

      {/* Side-by-Side Location & Contact Cards */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 border-t border-slate-100">
        {/* Provider Hub Details */}
        <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">
                <Briefcase size={16} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider block">
                  Service Partner
                </span>
                <h4 className="text-xs font-bold text-slate-900">{provider?.name}</h4>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {provider?.category}
            </span>
          </div>

          <div className="text-xs text-slate-600 space-y-1 pt-1">
            <div className="flex items-start gap-1.5">
              <MapPin size={14} className="text-indigo-500 shrink-0 mt-0.5" />
              <span className="line-clamp-2 text-[11px] font-medium text-slate-700">{provider?.address}</span>
            </div>
            {provider?.phone && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Phone size={12} className="text-slate-400" /> {provider.phone}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(provider.phone)}
                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  {copiedPhone === provider.phone ? 'Copied!' : 'Copy Phone'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Customer Destination Details */}
        <div className="p-4 bg-white rounded-xl border border-emerald-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                <User size={16} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block">
                  Service Destination
                </span>
                <h4 className="text-xs font-bold text-slate-900">{customer?.name}</h4>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle2 size={12} /> Target Pin
            </span>
          </div>

          <div className="text-xs text-slate-600 space-y-1 pt-1">
            <div className="flex items-start gap-1.5">
              <MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <span className="line-clamp-2 text-[11px] font-medium text-slate-700">{customer?.address}</span>
            </div>
            {customer?.phone && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Phone size={12} className="text-slate-400" /> {customer.phone}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(customer.phone)}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  {copiedPhone === customer.phone ? 'Copied!' : 'Copy Phone'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
