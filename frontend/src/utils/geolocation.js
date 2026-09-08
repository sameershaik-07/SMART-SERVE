/**
 * ServiceHub Geolocation & Live GPS Tracking Utility
 * Uses direct device GPS / WiFi positioning (NO misleading IP fallbacks like Maharashtra)
 * and OpenStreetMap reverse geocoding.
 */

// Macherla, Palnadu District, Andhra Pradesh coordinates
export const MACHERLA_DEFAULT = {
  lat: 16.4800,
  lng: 79.4300,
  address: 'Macherla, Palnadu District, Andhra Pradesh 522426',
};

/**
 * Acquire user's accurate GPS location from device hardware/WiFi
 * Uses balanced accuracy with cached position support to prevent timeouts on laptops.
 */
export const getAccurateGPSLocation = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser.'));
    }

    // Step 1: Try device positioning with generous cache and sensible timeout
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy || 15),
          source: position.coords.accuracy && position.coords.accuracy < 30 ? 'gps' : 'wifi',
        });
      },
      (err) => {
        console.warn('[Geolocation] Initial positioning attempt error:', err.code, err.message);

        // Step 2: Retry with high-accuracy satellite search if first attempt failed
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: Number(pos.coords.latitude.toFixed(6)),
              lng: Number(pos.coords.longitude.toFixed(6)),
              accuracy: Math.round(pos.coords.accuracy || 20),
              source: 'gps',
            });
          },
          (finalErr) => {
            console.warn('[Geolocation] Final positioning error:', finalErr.code, finalErr.message);
            if (finalErr.code === 1) {
              // Permission explicitly denied
              reject(new Error('Location permission is disabled in browser. Click map or select Macherla.'));
            } else {
              // Code 2 (POSITION_UNAVAILABLE) or Code 3 (TIMEOUT)
              // Resolve gracefully to Macherla instead of throwing a blocking error
              resolve({
                lat: MACHERLA_DEFAULT.lat,
                lng: MACHERLA_DEFAULT.lng,
                accuracy: 150,
                source: 'macherla_fallback',
                isFallback: true,
              });
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 180000,
          }
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000, // Reuse recent location within 5 mins for instant response
      }
    );
  });
};

/**
 * Reverse geocodes latitude & longitude into a human-readable street address
 * Uses OpenStreetMap Nominatim with structured locality parsing
 */
export const reverseGeocodeCoords = async (lat, lng) => {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return MACHERLA_DEFAULT.address;
  }

  // If coordinates match Macherla area (~16.3 to 16.65 Lat, ~79.2 to 79.6 Lng)
  const isMacherlaArea = lat >= 16.35 && lat <= 16.65 && lng >= 79.25 && lng <= 79.60;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const a = data.address;
        
        const street = a.road || a.pedestrian || a.street || a.neighbourhood || '';
        const area = a.suburb || a.residential || a.subdistrict || a.village || '';
        const city = a.city || a.town || a.county || a.district || (isMacherlaArea ? 'Macherla' : '');
        const state = a.state || (isMacherlaArea ? 'Andhra Pradesh' : '');
        const postcode = a.postcode || (isMacherlaArea ? '522426' : '');

        const parts = [];
        if (street) parts.push(street);
        if (area && area !== street && area !== city) parts.push(area);
        if (city) parts.push(city);
        if (state && state !== city) parts.push(state);
        if (postcode) parts.push(postcode);

        if (parts.length > 0) {
          return parts.join(', ');
        }
        if (data.display_name) {
          return data.display_name.split(',').slice(0, 4).map(s => s.trim()).join(', ');
        }
      }
    }
  } catch (err) {
    console.warn('[Geolocation] Reverse geocoding failed or timed out:', err.message);
  }

  if (isMacherlaArea) {
    return `Macherla, Palnadu District, Andhra Pradesh 522426`;
  }

  return `Live GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
};

/**
 * Watch live GPS movements continuously
 */
export const watchLivePosition = (onSuccess, onError) => {
  if (!navigator.geolocation) {
    if (onError) onError(new Error('Geolocation not supported'));
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      onSuccess({
        lat: Number(pos.coords.latitude.toFixed(6)),
        lng: Number(pos.coords.longitude.toFixed(6)),
        accuracy: Math.round(pos.coords.accuracy || 10),
        heading: pos.coords.heading,
        speed: pos.coords.speed,
      });
    },
    (err) => {
      if (onError) onError(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
};
