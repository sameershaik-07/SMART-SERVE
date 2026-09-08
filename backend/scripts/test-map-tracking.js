/**
 * Automated Verification Script for Dual-Location Map & Tracking
 * Tests:
 * 1. Locality geocoding resolution
 * 2. Haversine distance, urban route multiplier, and duration calculation
 * 3. Universal Google Maps turn-by-turn directions link generation
 * 4. Database booking tracking resolution for real bookings
 */

const mapService = require("../src/services/map.service");
const prisma = require("../src/config/prisma");

async function runTests() {
  console.log("==================================================");
  console.log("🗺️  SERVICEHUB DUAL-LOCATION MAP & TRACKING TESTS");
  console.log("==================================================\n");

  try {
    // 1. Test Geocoding for Customer and Provider localities
    console.log("Step 1: Testing locality geocoding...");
    const customerLoc = await mapService.geocodeAddress("12th Main, Indiranagar, Bengaluru");
    const providerLoc = await mapService.geocodeAddress("4th Block, Koramangala, Bengaluru");

    console.log("  📍 Customer (Indiranagar):", customerLoc);
    console.log("  🛠️ Provider (Koramangala):", providerLoc);

    if (!customerLoc.lat || !customerLoc.lng || !providerLoc.lat || !providerLoc.lng) {
      throw new Error("Geocoding failed to return valid coordinates.");
    }
    console.log("  ✅ Geocoding verified successfully.\n");

    // 2. Test Route & Navigation link generation
    console.log("Step 2: Testing route calculation & ETA...");
    const route = mapService.calculateRoute(
      providerLoc,
      customerLoc,
      providerLoc.formattedAddress,
      customerLoc.formattedAddress
    );

    console.log("  📏 Driving Distance:", route.formattedDistance);
    console.log("  ⏱️  Estimated Arrival:", route.formattedDuration);
    console.log("  🔗 Google Maps URL:", route.directionsUrl);

    if (route.distanceKm <= 0 || route.durationMinutes <= 0 || !route.directionsUrl.includes("google.com/maps/dir")) {
      throw new Error("Route calculation or directions URL generation failed.");
    }
    console.log("  ✅ Route calculation verified successfully.\n");

    // 3. Test Database Booking Tracking
    console.log("Step 3: Testing database booking tracking retrieval...");
    const booking = await prisma.booking.findFirst({
      include: { customer: true, provider: true }
    });

    if (booking) {
      const tracking = await mapService.getBookingTracking(booking.id, {
        userId: booking.customer.userId,
        role: "CUSTOMER"
      });

      console.log(`  📦 Retrieved Tracking for Booking #${booking.id}:`);
      console.log(`     - Customer: ${tracking.customer.name} @ [${tracking.customer.coordinates.lat}, ${tracking.customer.coordinates.lng}]`);
      console.log(`     - Provider: ${tracking.provider.name} @ [${tracking.provider.coordinates.lat}, ${tracking.provider.coordinates.lng}]`);
      console.log(`     - Route: ${tracking.route.formattedDistance} (~${tracking.route.formattedDuration})`);
      console.log("  ✅ Database tracking integration verified.\n");
    } else {
      console.log("  ℹ️ No bookings in database to inspect, skipping DB step.\n");
    }

    console.log("==================================================");
    console.log("🎉 ALL MAP & TRACKING TESTS PASSED 100%!");
    console.log("==================================================");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

runTests();
