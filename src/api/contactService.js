import { getWixClient } from './wixClient.js';

/**
 * Dedicated live Wix Form ID provisioned on the current Wix project.
 */
export const WIX_CONTACT_FORM_ID = '9444e0cc-c0a0-456e-8df3-14c30449cad8';
export const WIX_CONTACT_FORM_NAMESPACE = 'wix.bookings.v2.bookings';

/**
 * Normalizes phone number into E.164 standard required by Wix Forms validator.
 * @param {string} phone 
 * @returns {string|null}
 */
export function normalizePhoneForWix(phone) {
  if (!phone || !phone.trim()) return null;
  const cleaned = phone.trim().replace(/[^\d+]/g, '');
  if (!cleaned) return null;
  // If already starts with +, ensure length is valid
  if (cleaned.startsWith('+')) {
    return cleaned.length >= 8 ? cleaned : null;
  }
  // Default to standard North America +1 if 10 digits without prefix
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  return `+${cleaned}`;
}

/**
 * Submits a contact inquiry to Wix Forms using the official @wix/forms SDK.
 * Uses client-side OAuthStrategy session - no Admin API key exposed.
 * 
 * @param {object} params
 * @param {string} params.name - Full name of sender
 * @param {string} params.email - Sender email address
 * @param {string} [params.phone] - Sender phone number
 * @param {string} [params.subject] - Subject or topic
 * @param {string} params.message - Inquiry message content
 * @returns {Promise<{ success: boolean, submissionId?: string, status?: string, message?: string }>}
 */
export async function submitContactInquiry({ name, email, phone, subject, message }) {
  if (!name || !name.trim()) {
    throw new Error('Please provide your name.');
  }
  if (!email || !email.trim()) {
    throw new Error('Please provide your email address.');
  }
  if (!message || !message.trim()) {
    throw new Error('Please provide your message.');
  }

  const client = getWixClient();

  // Split name into first and last name for Wix CRM mapping
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Friend';
  const lastName = nameParts.slice(1).join(' ') || (firstName ? '' : 'Visitor');

  // Format full inquiry message incorporating subject
  const formattedMessage = subject && subject.trim()
    ? `[Subject: ${subject.trim()}]\n\n${message.trim()}`
    : message.trim();

  // Construct payload adhering to the active Wix form schema
  const submissionFields = {
    first_name: firstName,
    email: email.trim(),
    add_your_message: formattedMessage,
  };

  if (lastName) {
    submissionFields.last_name = lastName;
  }

  const normalizedPhone = normalizePhoneForWix(phone);
  if (normalizedPhone) {
    submissionFields.phone = normalizedPhone;
  }

  console.log(`[Wix Forms] Submitting contact form to form ID: ${WIX_CONTACT_FORM_ID}...`);

  try {
    const response = await client.submissions.createSubmission({
      formId: WIX_CONTACT_FORM_ID,
      namespace: WIX_CONTACT_FORM_NAMESPACE,
      submissions: submissionFields,
    });

    const submissionId = response._id || response.id || `SUB-${Date.now()}`;
    console.log(`[Wix Forms] Submission successfully created! ID: ${submissionId}`);

    return {
      success: true,
      submissionId,
      status: response.status || 'CONFIRMED',
      message: 'Your message has been received! Our team will get back to you shortly.',
      raw: response,
    };
  } catch (err) {
    console.error('[Wix Forms] createSubmission error:', err);
    throw new Error(err.message || 'Failed to submit contact inquiry to Wix Forms.');
  }
}
