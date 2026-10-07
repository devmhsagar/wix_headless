import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  Sparkles, 
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  CalendarCheck
} from 'lucide-react';
import { fetchServiceTimeSlots, createServiceBooking } from '../api/bookingService';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function BookingModal({ service, onClose }) {
  if (!service) return null;

  // Real Slots & Dates State from Wix Time Slots V2 API
  const [allSlots, setAllSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Calendar View Month Navigation (Default to today's month)
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Attendee Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  // Fetch real Wix Bookings time slots for next 45 days
  useEffect(() => {
    let isMounted = true;
    async function loadSlots() {
      setLoadingSlots(true);
      setErrorNotice(null);
      try {
        const slots = await fetchServiceTimeSlots(service.id, 45);
        if (isMounted) {
          setAllSlots(slots);

          // Build date map
          const dateMap = {};
          slots.forEach((s) => {
            if (s.dateKey) {
              if (!dateMap[s.dateKey]) dateMap[s.dateKey] = [];
              dateMap[s.dateKey].push(s);
            }
          });

          // Default selection to first available date
          const availableKeys = Object.keys(dateMap).sort();
          if (availableKeys.length > 0) {
            const firstDateKey = availableKeys[0];
            setSelectedDateKey(firstDateKey);
            if (dateMap[firstDateKey]?.length > 0) {
              setSelectedSlot(dateMap[firstDateKey][0]);
            }

            // Sync calendar view to first available date's month
            const [y, m] = firstDateKey.split('-').map(Number);
            setViewDate(new Date(y, m - 1, 1));
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[BookingModal] Error fetching slots:', err);
          setErrorNotice('Could not retrieve real-time availability from Wix Bookings.');
        }
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }
    loadSlots();
    return () => { isMounted = false; };
  }, [service.id]);

  // Group real slots by date key (YYYY-MM-DD)
  const slotsByDate = useMemo(() => {
    const map = {};
    allSlots.forEach((slot) => {
      if (!slot.dateKey) return;
      if (!map[slot.dateKey]) map[slot.dateKey] = [];
      map[slot.dateKey].push(slot);
    });
    return map;
  }, [allSlots]);

  // Calculate monthly calendar grid cells for current viewDate
  const monthData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // First day of month & number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    const totalDays = lastDay.getDate();

    // Today in local format for past-date comparison
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Month label
    const monthName = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Days grid
    const days = [];
    // Padding blanks
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ blank: true, key: `blank-${i}` });
    }

    // Days 1..totalDays
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const slotsCount = slotsByDate[dateKey]?.length || 0;
      const isPast = dateKey < todayStr;
      const hasAvailability = slotsCount > 0 && !isPast;

      days.push({
        blank: false,
        key: dateKey,
        dayNum,
        dateKey,
        isPast,
        hasAvailability,
        slotsCount,
      });
    }

    return {
      monthName,
      days,
    };
  }, [viewDate, slotsByDate]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Slots available on currently selected date
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDateKey) return [];
    return slotsByDate[selectedDateKey] || [];
  }, [selectedDateKey, slotsByDate]);

  // Formatted date string for display
  const selectedDateFormatted = useMemo(() => {
    if (!selectedDateKey) return '';
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  }, [selectedDateKey]);

  // Date selection click handler
  const handleSelectDate = (dateKey) => {
    setSelectedDateKey(dateKey);
    const daySlots = slotsByDate[dateKey] || [];
    if (daySlots.length > 0) {
      setSelectedSlot(daySlots[0]);
    } else {
      setSelectedSlot(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorNotice('Please provide a valid email address.');
      return;
    }

    setSubmitting(true);
    setErrorNotice(null);

    try {
      const result = await createServiceBooking({
        service,
        slot: selectedSlot,
        contactDetails: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },
      });

      if (result.success) {
        setBookingSuccess(result);
      } else {
        setErrorNotice(result.message || 'Unable to complete booking.');
      }
    } catch (err) {
      setErrorNotice(err.message || 'An unexpected error occurred during booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="booking-modal">
      <div 
        className="modal-content booking-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', width: '95%' }}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close booking modal"
        >
          <X size={20} />
        </button>

        {bookingSuccess ? (
          /* Booking Success View */
          <div className="booking-success-view">
            <div className="state-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', margin: '0 auto 1.25rem' }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Booking Confirmed!
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
              {bookingSuccess.message}
            </p>

            <div className="booking-summary-card">
              <div className="summary-item">
                <span className="summary-label">Service</span>
                <strong className="summary-value">{service.name}</strong>
              </div>

              {selectedSlot ? (
                <>
                  <div className="summary-item">
                    <span className="summary-label">Date</span>
                    <strong className="summary-value">{selectedSlot.formattedDate}</strong>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Time</span>
                    <strong className="summary-value">{selectedSlot.formattedTime}</strong>
                  </div>
                </>
              ) : null}

              <div className="summary-item">
                <span className="summary-label">Booking Reference</span>
                <code className="summary-code">{bookingSuccess.bookingId}</code>
              </div>

              <div className="summary-item">
                <span className="summary-label">Status</span>
                <span className="badge badge-connected" style={{ padding: '2px 8px' }}>
                  {bookingSuccess.status}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Attendee</span>
                <strong className="summary-value">{firstName} {lastName} ({email})</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
              style={{ marginTop: '1.5rem', width: '100%' }}
            >
              Done
            </button>
          </div>
        ) : (
          /* Interactive Booking Flow View */
          <div className="booking-modal-body">
            {/* Header info */}
            <div className="booking-modal-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-booking-type">{service.typeLabel}</span>
                <span className="badge badge-neutral" style={{ padding: '2px 8px' }}>
                  <Clock size={11} />
                  <span>{service.durationFormatted}</span>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
                <h2 className="booking-modal-title" style={{ margin: 0 }}>{service.name}</h2>
                <span className="booking-modal-price" style={{ fontSize: '1.3rem' }}>{service.formattedPrice}</span>
              </div>

              <p className="booking-modal-desc" style={{ marginTop: '0.4rem', marginBottom: 0 }}>{service.description}</p>
            </div>

            {errorNotice ? (
              <div className="checkout-notice error" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{errorNotice}</span>
                </div>
              </div>
            ) : null}

            {loadingSlots ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <span className="status-dot pulse" style={{ display: 'inline-block', marginRight: '8px' }} />
                <span>Checking real-time calendar availability...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="booking-form">
                {/* Two-Column Date & Time Selection Panel */}
                <div className="booking-datetime-grid">
                  {/* Left Column: Monthly Calendar Picker */}
                  <div className="monthly-calendar-container">
                    <div className="calendar-header-bar">
                      <span className="calendar-month-title">
                        <CalendarIcon size={16} style={{ color: 'var(--brand-accent)' }} />
                        <span>{monthData.monthName}</span>
                      </span>

                      <div className="calendar-nav-buttons">
                        <button
                          type="button"
                          className="calendar-nav-btn"
                          onClick={handlePrevMonth}
                          aria-label="Previous month"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          className="calendar-nav-btn"
                          onClick={handleNextMonth}
                          aria-label="Next month"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Weekday Labels Header */}
                    <div className="calendar-weekdays-row">
                      {WEEKDAYS.map((wd) => (
                        <div key={wd} className="calendar-weekday-cell">
                          {wd}
                        </div>
                      ))}
                    </div>

                    {/* Month Days Grid */}
                    <div className="calendar-days-grid">
                      {monthData.days.map((item) => {
                        if (item.blank) {
                          return <div key={item.key} className="calendar-day-cell blank" />;
                        }

                        const isSelected = selectedDateKey === item.dateKey;
                        const isAvailable = item.hasAvailability;

                        return (
                          <button
                            key={item.key}
                            type="button"
                            className={`calendar-day-cell ${isSelected ? 'selected' : ''} ${isAvailable ? 'available' : 'disabled'}`}
                            onClick={() => isAvailable && handleSelectDate(item.dateKey)}
                            disabled={!isAvailable}
                            title={isAvailable ? `${item.slotsCount} slot(s) available on ${item.dateKey}` : 'No available slots'}
                          >
                            <span className="day-number">{item.dayNum}</span>
                            {isAvailable ? (
                              <span className="availability-dot" title={`${item.slotsCount} slot(s)`} />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>

                    <div className="calendar-legend">
                      <span className="legend-item">
                        <span className="availability-dot" style={{ display: 'inline-block' }} /> Available Date
                      </span>
                      <span className="legend-item">
                        <span className="legend-box selected" /> Selected
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Time Slots for Selected Date */}
                  <div className="time-slots-container">
                    <div className="time-slots-header">
                      <h4 className="step-section-title" style={{ margin: 0, fontSize: '0.9rem' }}>
                        <Clock size={15} />
                        <span>Available Time Slots</span>
                      </h4>
                      {selectedDateFormatted ? (
                        <span className="selected-date-badge">{selectedDateFormatted}</span>
                      ) : null}
                    </div>

                    {allSlots.length === 0 ? (
                      <div className="slots-empty-notice">
                        No recurring time slots found for this service. You can still confirm a session request below.
                      </div>
                    ) : !selectedDateKey ? (
                      <div className="slots-empty-notice">
                        Please choose an available highlighted date from the calendar.
                      </div>
                    ) : slotsForSelectedDate.length === 0 ? (
                      <div className="slots-empty-notice">
                        No open time slots on this date. Please pick another highlighted date on the calendar.
                      </div>
                    ) : (
                      <div className="slots-grid-scroll">
                        {slotsForSelectedDate.map((slot) => {
                          const isSelected = selectedSlot?.id === slot.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              className={`slot-pill-btn ${isSelected ? 'selected' : ''}`}
                              onClick={() => setSelectedSlot(slot)}
                            >
                              <span className="slot-time">{slot.formattedTime}</span>
                              {isSelected ? (
                                <span className="slot-check-indicator">
                                  <Check size={12} />
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Attendee Details Form Section */}
                <div className="booking-step-section" style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <h4 className="step-section-title" style={{ marginBottom: '1rem' }}>
                    <User size={15} />
                    <span>Attendee Information</span>
                  </h4>

                  <div className="form-grid-2">
                    <div className="config-input-group">
                      <label>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="text"
                        className="config-input"
                        placeholder="e.g. John"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>

                    <div className="config-input-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        className="config-input"
                        placeholder="e.g. Smith"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="config-input-group">
                      <label>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="email"
                        className="config-input"
                        placeholder="john@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="config-input-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        className="config-input"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Live Selection Summary Bar */}
                {selectedSlot ? (
                  <div className="booking-selected-summary-bar">
                    <CalendarCheck size={16} style={{ color: '#38bdf8' }} />
                    <span>
                      Booking: <strong>{service.name}</strong> on <strong>{selectedSlot.formattedDate}</strong> at <strong>{selectedSlot.formattedTime}</strong>
                    </span>
                  </div>
                ) : null}

                {/* Action Buttons */}
                <div className="booking-form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={onClose}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className={`btn btn-primary ${submitting ? 'loading' : ''}`}
                    disabled={submitting}
                    id="btn-confirm-booking"
                  >
                    <span>{submitting ? 'Confirming Reservation...' : 'Confirm Reservation'}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
