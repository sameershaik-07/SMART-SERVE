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

    // Custom draggable coral pin
    const pinIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
          <div style="background-color: #b85c3e; color: white; padding: 5px 9px; border-radius: 9999px; font-weight: 600; font-size: 11px; box-shadow: 0 8px 16px rgba(20,20,19,0.28); border: 2px solid #faf9f5; display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>📍 Service pin</span>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid #b85c3e;"></div>
          <div style="width: 8px; height: 8px; background: #b85c3e; border-radius: 50%; opacity: 0.6; margin-top: 1px;"></div>
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-body">
          <MapPin size={13} className="text-primary" />
          <span>Service location pin</span>
          <span className="hidden text-[9px] font-normal text-muted-foreground sm:inline">
            (click or drag to adjust)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {statusMsg && (
            <span className="flex animate-fade-in items-center gap-1 rounded-xs border border-accent-teal/20 bg-accent-teal/8 px-2 py-0.5 text-[9px] font-medium text-accent-teal">
              <CheckCircle2 size={10} />
              {statusMsg}
            </span>
          )}

          <button
            type="button"
            onClick={handleSetMacherla}
            className="flex items-center gap-1 rounded-xs border border-hairline bg-canvas px-2 py-1 text-[9px] font-medium text-body transition-colors hover:border-primary/30 hover:text-primary active:scale-95"
            title="Quickly set location to Macherla, Palnadu District, AP"
          >
            <MapPin size={10} className="text-primary" />
            <span>Macherla</span>
          </button>

          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={detecting}
            className="flex items-center gap-1 rounded-xs border border-primary/25 bg-primary/6 px-2 py-1 text-[9px] font-medium text-primary transition-colors hover:bg-primary/10 active:scale-95 disabled:opacity-50"
          >
            {detecting ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <Crosshair size={10} />
            )}
            <span>{detecting ? 'Detecting…' : 'My live GPS'}</span>
          </button>
        </div>
      </div>

      {/* In-app map canvas */}
      <div
        className="relative z-0 w-full overflow-hidden rounded-md border border-hairline bg-surface-soft shadow-xs"
        style={{ height: '260px', minHeight: '260px', width: '100%' }}
      >
        <div
          ref={mapContainerRef}
          style={{ height: '260px', minHeight: '260px', width: '100%' }}
        />
      </div>
    </div>
  );
};
