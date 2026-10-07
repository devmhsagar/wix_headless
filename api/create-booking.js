import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { bookings, availabilityTimeSlots } from '@wix/bookings';

/**
 * Vercel Serverless Function: Real Wix Booking Creation
 * 
 * SECURITY:
 * Runs strictly server-side. WIX_API_KEY is never exposed to the client.
 */
export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Parse body if string
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // fallback
      }
    }
    body = body || {};

    const { service, slot, contactDetails, numberOfParticipants = 1 } = body;

    if (!service || (!service.id && !service._id)) {
      return res.status(400).json({ error: 'Service is required' });
    }

    if (!contactDetails || !contactDetails.email) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    const apiKey = process.env.WIX_API_KEY;
    const siteId = process.env.WIX_SITE_ID || '1c6ae045-e46e-43d4-adfb-3beb1beaac3e';
    const accountId = process.env.WIX_ACCOUNT_ID || '456351de-45e0-479b-829a-e50e747b2bec';

    if (!apiKey) {
      return res.status(500).json({
        error: 'Server configuration error: WIX_API_KEY is not configured on server environment'
      });
    }

    const adminClient = createClient({
      modules: { bookings, availabilityTimeSlots },
      auth: ApiKeyStrategy({
        apiKey,
        siteId,
        accountId
      })
    });

    const serviceId = service.id || service._id;
    const bookedEntity = {};

    if (slot && slot.localStartDate) {
      // 1. Fetch exact availability details to retrieve real staff resource
      let primaryResource = null;
      let resourceTypeId = null;

      try {
        const slotDetail = await adminClient.availabilityTimeSlots.getAvailabilityTimeSlot(
          serviceId,
          slot.localStartDate,
          slot.localEndDate,
          'Asia/Dhaka',
          slot.location || { locationType: 'BUSINESS' },
          {}
        );
        const resourcesGroup = slotDetail?.timeSlot?.availableResources?.[0];
        if (resourcesGroup?.resources?.length > 0) {
          primaryResource = resourcesGroup.resources[0];
          resourceTypeId = resourcesGroup.resourceTypeId;
        }
      } catch (err) {
        console.warn('[create-booking] getAvailabilityTimeSlot fallback:', err.message);
      }

      // Map locationType to valid enum (OWNER_BUSINESS)
      const location = {
        locationType: 'OWNER_BUSINESS',
        id: slot.location?._id || slot.location?.id,
        name: slot.location?.name,
      };

      const slotPayload = {
        serviceId,
        scheduleId: slot.scheduleId || service.scheduleId,
        startDate: new Date(slot.localStartDate).toISOString(),
        endDate: new Date(slot.localEndDate).toISOString(),
        location,
      };

      if (primaryResource) {
        slotPayload.resource = {
          id: primaryResource._id,
          name: primaryResource.name,
        };
        if (resourceTypeId) {
          slotPayload.resourceSelections = [
            {
              resourceTypeId,
              selectionMethod: 'SPECIFIC_RESOURCE',
            },
          ];
        }
      }

      bookedEntity.slot = slotPayload;
    } else if (service.scheduleId) {
      bookedEntity.schedule = {
        scheduleId: service.scheduleId,
      };
    } else {
      bookedEntity.slot = {
        serviceId,
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

    console.log('[create-booking] Submitting booking to Wix with payload:', JSON.stringify(bookingPayload, null, 2));

    const resBooking = await adminClient.bookings.createBooking(
      bookingPayload,
      {
        flowControlSettings: {
          skipAvailabilityValidation: true,
          skipBusinessConfirmation: true,
        }
      }
    );

    const created = resBooking.booking || resBooking;
    console.log('[create-booking] Successfully created booking in Wix! ID:', created._id, 'Status:', created.status);

    return res.status(200).json({
      success: true,
      bookingId: created._id,
      status: created.status || 'CREATED',
      booking: created,
      message: 'Booking successfully accepted and confirmed by Wix Bookings!',
    });
  } catch (err) {
    console.error('[create-booking error]:', err);
    const errorCode = err.details?.applicationError?.code || err.details?.validationError?.fieldViolations?.[0]?.description || 'BOOKING_FAILED';
    const errorDesc = err.details?.applicationError?.description || err.message || 'Wix rejected the booking request.';
    return res.status(500).json({
      success: false,
      errorCode,
      message: errorDesc,
      error: err.message,
      details: err.details,
    });
  }
}
