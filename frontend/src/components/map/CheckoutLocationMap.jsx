import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Loader2, MapPin, CheckCircle2 } from 'lucide-react';
import { getAccurateGPSLocation, reverseGeocodeCoords, MACHERLA_DEFAULT } from '../../utils/geolocation';

export const CheckoutLocationMap = ({ coords, address, onLocationChange }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [detecting, setDetecting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const defaultLat = coords?.lat || 16.4800;
  const defaultLng = coords?.lng || 79.4300;

  // Initialize and update map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const lat = coords?.lat || defaultLat;
    const lng = coords?.lng || defaultLng;

    // If map already exists, smoothly pan & move pin
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], 15, { animate: true });
      mapInstanceRef.current.invalidateSize();
      return;
    }

    // Initialize Leaflet map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
    }).setView([lat, lng], 15);
    mapInstanceRef.current = map;

    // Place zoom control in bottom-left to prevent covering top interface elements
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    // Custom Draggable Emerald Pin
    const pinIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #059669; color: white; padding: 5px 9px; border-radius: 9999px; font-weight: 700; font-size: 11px; box-shadow: 0 8px 16px rgba(0,0,0,0.25); border: 2px solid white; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>📍 Service Pin</span>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #059669;"></div>
          <div style="width: 8px; height: 8px; background: #059669; border-radius: 50%; opacity: 0.6; margin-top: 1px;"></div>
        </div>
      `,
      iconSize: [0, 0],
    });

    const marker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
    markerRef.current = marker;

    // Handle pin drag end
    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      const nLat = Number(pos.lat.toFixed(6));
      const nLng = Number(pos.lng.toFixed(6));
      setStatusMsg('Resolving pin location address...');

      const newAddr = await reverseGeocodeCoords(nLat, nLng);
      setStatusMsg('📍 Pinned location updated');
      setTimeout(() => setStatusMsg(null), 3000);

      if (onLocationChange) {
        onLocationChange({ lat: nLat, lng: nLng, address: newAddr });
      }
    });

    // Handle click on map to reposition pin
    map.on('click', async (e) => {
      const nLat = Number(e.latlng.lat.toFixed(6));
      const nLng = Number(e.latlng.lng.toFixed(6));
      marker.setLatLng([nLat, nLng]);
      map.panTo([nLat, nLng]);
      setStatusMsg('Resolving clicked location...');

      const newAddr = await reverseGeocodeCoords(nLat, nLng);
      setStatusMsg('📍 Pin moved to clicked spot');
      setTimeout(() => setStatusMsg(null), 3000);

      if (onLocationChange) {
        onLocationChange({ lat: nLat, lng: nLng, address: newAddr });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [coords?.lat, coords?.lng]);

  const handleDetectGPS = async () => {
    setDetecting(true);
    setStatusMsg('Acquiring high-accuracy GPS...');

    try {
      const loc = await getAccurateGPSLocation();
      if (loc.isFallback) {
        setStatusMsg('📍 Pinned to Macherla (GPS signal unavailable indoors)');
        setTimeout(() => setStatusMsg(null), 4000);
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([loc.lat, loc.lng]);
          mapInstanceRef.current.setView([loc.lat, loc.lng], 15, { animate: true });
        }
        if (onLocationChange) {
          onLocationChange({ lat: loc.lat, lng: loc.lng, address: MACHERLA_DEFAULT.address });
        }
        return;
      }

      setStatusMsg(`Resolving street address (±${loc.accuracy}m)...`);

      const readableAddress = await reverseGeocodeCoords(loc.lat, loc.lng);
      setStatusMsg(`📍 GPS Locked (±${loc.accuracy}m)`);
      setTimeout(() => setStatusMsg(null), 4000);

      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([loc.lat, loc.lng]);
        mapInstanceRef.current.setView([loc.lat, loc.lng], 16, { animate: true });
      }

      if (onLocationChange) {
        onLocationChange({ lat: loc.lat, lng: loc.lng, address: readableAddress });
      }
    } catch (err) {
      setStatusMsg(err.message || 'GPS signal unavailable. You can click map or use Macherla pin.');
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setDetecting(false);
    }
  };

  const handleSetMacherla = () => {
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([MACHERLA_DEFAULT.lat, MACHERLA_DEFAULT.lng]);
      mapInstanceRef.current.setView([MACHERLA_DEFAULT.lat, MACHERLA_DEFAULT.lng], 15, { animate: true });
    }
    setStatusMsg('📍 Pinned to Macherla, AP');
    setTimeout(() => setStatusMsg(null), 3000);

    if (onLocationChange) {
      onLocationChange({
        lat: MACHERLA_DEFAULT.lat,
        lng: MACHERLA_DEFAULT.lng,
        address: MACHERLA_DEFAULT.address,
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <MapPin size={14} className="text-emerald-600" />
          <span>In-App Service Location Pin</span>
          <span className="text-[10px] font-normal text-slate-500">(Click or drag pin to adjust)</span>
        </div>

        <div className="flex items-center gap-2">
          {statusMsg && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md animate-fade-in flex items-center gap-1">
              <CheckCircle2 size={11} />
              {statusMsg}
            </span>
          )}

          <button
            type="button"
            onClick={handleSetMacherla}
            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-purple-200 cursor-pointer transition-colors active:scale-95"
            title="Quickly set location to Macherla, Palnadu District, AP"
          >
            <MapPin size={12} className="text-purple-600" />
            <span>Macherla</span>
          </button>

          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={detecting}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-emerald-200 cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
          >
            {detecting ? (
              <Loader2 size={12} className="animate-spin text-emerald-600" />
            ) : (
              <Crosshair size={12} className="text-emerald-600" />
            )}
            <span>{detecting ? 'Detecting...' : 'My Live GPS'}</span>
          </button>
        </div>
      </div>

      {/* In-App Map Canvas */}
      <div 
        className="relative w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xs z-0"
        style={{ height: '260px', minHeight: '260px', width: '100%' }}
      >
        <div ref={mapContainerRef} style={{ height: '260px', minHeight: '260px', width: '100%' }} />
      </div>
    </div>
  );
};
