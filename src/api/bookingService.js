import { media } from '@wix/sdk';
import { getWixClient } from './wixClient.js';

/**
 * Resolves Wix media URI to full CDN URL for booking services.
 * @param {string|object} rawImage
 * @returns {string|null}
 */
export function resolveBookingImageUrl(rawImage) {
  if (!rawImage) return null;

  if (typeof rawImage === 'string') {
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      return rawImage;
    }
    if (rawImage.startsWith('wix:image://')) {
      try {
        const resolved = media.getImageUrl(rawImage);
        if (resolved && resolved.url) return resolved.url;
      } catch {
        const uri = rawImage.replace('wix:image://v1/', '').split('/')[0].split('#')[0];
        return `https://static.wixstatic.com/media/${uri}`;
      }
    }
  }

  if (typeof rawImage === 'object') {
    if (rawImage.url) return rawImage.url;
    if (rawImage.src) return resolveBookingImageUrl(rawImage.src);
    if (rawImage.image?.url) return rawImage.image.url;
    if (rawImage.id) return `https://static.wixstatic.com/media/${rawImage.id}`;
  }

  return null;
}

/**
 * Formats duration in minutes to human-friendly string.
 * @param {number} minutes
 * @returns {string}
 */
export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return 'Flexible';
  if (minutes < 60) return `${minutes} mins`;
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs} hr${hrs > 1 ? 's' : ''}`;
}

/**
 * Standardizes a Wix Bookings service object.
 * @param {object} raw
 * @returns {object}
 */
export function formatService(raw) {
  if (!raw) return null;

  const image =
    resolveBookingImageUrl(raw.media?.mainMedia?.image) ||
    (raw.media?.items && raw.media.items[0] && resolveBookingImageUrl(raw.media.items[0].image)) ||
    null;

  const durationMinutes =
    raw.schedule?.availabilityConstraints?.durations?.[0]?.minutes ||
    raw.schedule?.availabilityConstraints?.sessionDurations?.[0] ||
    raw.schedule?.duration?.minutes ||
    60;

  const priceValue = raw.payment?.fixed?.price?.value;
  const currency = raw.payment?.fixed?.price?.currency || 'BDT';
  const formattedPrice = priceValue ? `${currency} ${priceValue}` : 'Free / Inquire';
  const numericPrice = parseFloat(priceValue || 0);

  let typeLabel = 'Appointment';
  if (raw.type === 'COURSE') typeLabel = 'Course / Workshop';
  else if (raw.type === 'CLASS') typeLabel = 'Class Session';
  else if (raw.type === 'INDIVIDUAL' || raw.type === 'APPOINTMENT') typeLabel = '1-on-1 Consultation';

  return {
    id: raw._id || raw.id,
    name: raw.name || 'Untitled Service',
    tagLine: raw.tagLine || '',
    description: raw.description || 'Professional consultation and dedicated service session.',
    type: raw.type || 'APPOINTMENT',
    typeLabel,
    formattedPrice,
    numericPrice,
    currency,
    durationMinutes,
    durationFormatted: formatDuration(durationMinutes),
    capacity: raw.defaultCapacity || 1,
    image,
    slug: raw.mainSlug?.name || raw.slug || raw._id,
    scheduleId: raw.schedule?._id || null,
    policyName: raw.bookingPolicy?.name || 'Standard Cancellation Policy',
    raw,
  };
}

/**
 * Dynamically queries booking services from Wix Bookings.
 * @returns {Promise<{ services: Array<object>, total: number, rawResponse: any }>}
 */
export async function fetchBookingServices() {
  const client = getWixClient();

  const res = await client.services.queryServices().find();
  const rawList = res.items || [];
  const formatted = rawList.map(formatService);

  console.log(`[Wix Bookings] Retrieved ${formatted.length} service(s) from catalog:`);
  formatted.forEach((s, idx) => {
    console.log(`  ${idx + 1}. "${s.name}" (${s.typeLabel}) - ${s.formattedPrice} - Duration: ${s.durationFormatted}`);
  });

  return {
    services: formatted,
    total: res.totalCount ?? formatted.length,
    rawResponse: res,
  };
}

/**
 * Fetches a single service by ID.
 * @param {string} serviceId
 * @returns {Promise<object>}
 */
export async function fetchServiceById(serviceId) {
  if (!serviceId) throw new Error('Service ID is required');

  const client = getWixClient();
  const raw = await client.services.getService(serviceId);
  return formatService(raw.service || raw);
}

/**
 * Retrieves real available time slots for a specific service.
 * @param {string} serviceId
 * @param {number} [daysAhead=14]
 * @returns {Promise<Array<object>>}
 */
export async function fetchServiceTimeSlots(serviceId, daysAhead = 45) {
  if (!serviceId) return [];

  const client = getWixClient();

  const now = new Date();
  const future = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);

  const fromLocalDate = `${now.toISOString().split('T')[0]}T00:00:00`;
  const toLocalDate = `${future.toISOString().split('T')[0]}T23:59:59`;

  try {
    const res = await client.availabilityTimeSlots.listAvailabilityTimeSlots({
      serviceId,
      fromLocalDate,
      toLocalDate,
    });

    const rawSlots = res.timeSlots || [];
    // Filter to ensure only REAL bookable slots are exposed
    const bookableSlots = rawSlots.filter((slot) => slot.bookable !== false && slot.openSpots !== 0);

    return bookableSlots.map((slot, index) => {
      const startDate = new Date(slot.localStartDate);
      const endDate = new Date(slot.localEndDate);

      const formattedDate = startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const formattedTime = `${startDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })} - ${endDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`;

      const dateKey = slot.localStartDate ? slot.localStartDate.split('T')[0] : '';
      const startTimeFormatted = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const endTimeFormatted = endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

      return {
        id: `${slot.scheduleId}-${slot.localStartDate}-${index}`,
        serviceId: slot.serviceId,
        scheduleId: slot.scheduleId,
        dateKey,
        localStartDate: slot.localStartDate,
        localEndDate: slot.localEndDate,
        formattedDate,
        formattedTime,
        startTimeFormatted,
        endTimeFormatted,
        bookable: true,
        openSpots: slot.openSpots,
        location: slot.location,
        raw: slot,
      };
    });
  } catch (err) {
    console.warn(`[Wix Bookings] Slots query for service ${serviceId}:`, err.message);
    return [];
  }
}

/**
 * Verifies real availability and available resources for a specific slot using Wix Time Slots V2 API.
 * @param {string} serviceId
 * @param {string} localStartDate
 * @param {string} localEndDate
 * @param {object} [location]
 * @returns {Promise<object|null>}
 */
export async function getSlotVerification(serviceId, localStartDate, localEndDate, location) {
  if (!serviceId || !localStartDate || !localEndDate) return null;
  const client = getWixClient();
  try {
    const loc = location || { locationType: 'BUSINESS' };
    const res = await client.availabilityTimeSlots.getAvailabilityTimeSlot(
      serviceId,
      localStartDate,
      localEndDate,
      'Asia/Dhaka',
      loc,
      {}
    );
    return res;
  } catch (err) {
    console.warn('[Wix Bookings] getAvailabilityTimeSlot notice:', err.message);
    return null;
  }
}

/**
 * Books an available service time slot using Wix Bookings API.
 * @param {object} params
 * @param {object} params.service
 * @param {object} [params.slot]
 * @param {object} params.contactDetails
 * @param {number} [params.numberOfParticipants=1]
 * @returns {Promise<{ success: boolean, bookingId?: string, status?: string, message: string, booking?: object, errorCode?: string }>}
 */
export async function createServiceBooking({ service, slot, contactDetails, numberOfParticipants = 1 }) {
  if (!service || !service.id) {
    throw new Error('Service information is required to create a booking.');
  }

  console.log(`[Wix Bookings] Initiating real booking for "${service.name}"...`);

  // 1. Primary: Use secure serverless endpoint with elevated admin credentials
  try {
    const response = await fetch('/api/create-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service,
        slot,
        contactDetails,
        numberOfParticipants,
      }),
    });

    if (response.status !== 404) {
      const result = await response.json();
      if (response.ok && result.success) {
        console.log(`[Wix Bookings] Real Booking Confirmed via Server! ID: ${result.bookingId}`);
        return {
          success: true,
          bookingId: result.bookingId,
          status: result.status || 'CONFIRMED',
          booking: result.booking,
          message: 'Your booking has been successfully accepted and confirmed by Wix Bookings!',
        };
      }

      console.warn('[Wix Bookings] Serverless booking error:', result);
      return {
        success: false,
        errorCode: result.errorCode || 'BOOKING_FAILED',
        message: result.message || 'Wix Bookings could not confirm this reservation.',
      };
    }
  } catch (netErr) {
    console.warn('[Wix Bookings] Serverless booking request failed, attempting direct client fallback:', netErr.message);
  }

  // 2. Fallback: Client-side OAuthStrategy SDK (with correct OWNER_BUSINESS locationType)
  const client = getWixClient();
  const bookedEntity = {};

  if (slot && slot.localStartDate) {
    const slotPayload = {
      serviceId: service.id,
      scheduleId: slot.scheduleId || service.scheduleId,
      location: {
        locationType: 'OWNER_BUSINESS',
        id: slot.location?._id || slot.location?.id,
        name: slot.location?.name,
      },
      startDate: new Date(slot.localStartDate).toISOString(),
      endDate: new Date(slot.localEndDate).toISOString(),
    };

    bookedEntity.slot = slotPayload;
  } else if (service.scheduleId) {
    bookedEntity.schedule = {
      scheduleId: service.scheduleId,
    };
  } else {
    bookedEntity.slot = {
      serviceId: service.id,
      location: { locationType: 'OWNER_BUSINESS' },
    };
  }

  const bookingPayload = {
    bookedEntity,
    contactDetails: {
      firstName: contactDetails.firstName || 'Client',
      lastName: contactDetails.lastName || 'Guest',
      email: contactDetails.email,
      phone: contactDetails.phone || '',
    },
    numberOfParticipants: Number(numberOfParticipants) || 1,
  };

  try {
    const res = await client.bookings.createBooking(bookingPayload);
    const created = res.booking || res;

    console.log(`[Wix Bookings] Real Booking Confirmed via Client SDK! ID: ${created._id}`);
    return {
      success: true,
      bookingId: created._id,
      status: created.status || 'CONFIRMED',
      booking: created,
      message: 'Your booking has been successfully accepted and confirmed by Wix Bookings!',
    };
  } catch (apiErr) {
    console.error('[Wix Bookings] createBooking API failure:', apiErr.message, apiErr.details || '');
    const errorCode = apiErr.details?.applicationError?.code || 'BOOKING_REJECTED';
    const errorDesc = apiErr.details?.applicationError?.description || apiErr.message || 'Booking was not accepted by Wix Bookings.';

    return {
      success: false,
      errorCode,
      message: `Wix Bookings could not confirm this reservation: ${errorDesc}`,
    };
  }
}

