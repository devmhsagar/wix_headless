import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  CalendarCheck,
  Sparkles,
  RefreshCw,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { fetchServiceTimeSlots, createServiceBooking, getSlotVerification } from '../api/bookingService';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function BookingSection({ 
  selectedService, 
  onSelectService, 
  services = [] 
}) {
  const sectionRef = useRef(null);

  // Active step flow: 1: Service -> 2: Date & Time -> 3: Customer Details -> 4: Confirmation
  // Real Slots state for current service
  const [allSlots, setAllSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Calendar View Month Navigation (Defaults to current month)
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Customer Contact Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Submission & Result States
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  // Auto-scroll to booking section when a service is selected
  useEffect(() => {
    if (selectedService && sectionRef.current) {
      // Clear past booking success when selecting a new service
      setBookingSuccess(null);
      setErrorNotice(null);
    }
  }, [selectedService?.id]);

  // Load REAL Wix Time Slots V2 availability for appointment services
  useEffect(() => {
    if (!selectedService || selectedService.type === 'COURSE') {
      setAllSlots([]);
      setSelectedDateKey(null);
      setSelectedSlot(null);
      setLoadingSlots(false);
      return;
    }

    let isMounted = true;
    async function loadRealSlots() {
      setLoadingSlots(true);
      setErrorNotice(null);
      try {
        const slots = await fetchServiceTimeSlots(selectedService.id, 45);
        if (isMounted) {
          setAllSlots(slots);

          // Group by date
          const dateMap = {};
          slots.forEach((s) => {
            if (s.dateKey) {
              if (!dateMap[s.dateKey]) dateMap[s.dateKey] = [];
              dateMap[s.dateKey].push(s);
            }
          });

          const availableKeys = Object.keys(dateMap).sort();
          if (availableKeys.length > 0) {
            const firstDateKey = availableKeys[0];
            setSelectedDateKey(firstDateKey);
            if (dateMap[firstDateKey]?.length > 0) {
              setSelectedSlot(dateMap[firstDateKey][0]);
            }
            // Navigate calendar month to first available date
            const [y, m] = firstDateKey.split('-').map(Number);
            setViewDate(new Date(y, m - 1, 1));
          } else {
            setSelectedDateKey(null);
            setSelectedSlot(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[BookingSection] Error loading real slots:', err);
          setErrorNotice('Could not retrieve real-time availability from Wix Bookings.');
        }
      } finally {
        if (isMounted) setLoadingSlots(false);
      }
    }

    loadRealSlots();
    return () => { isMounted = false; };
  }, [selectedService?.id, selectedService?.type]);

  // Group real bookable slots by date key (YYYY-MM-DD)
  const slotsByDate = useMemo(() => {
    const map = {};
    allSlots.forEach((slot) => {
      if (!slot.dateKey) return;
      if (!map[slot.dateKey]) map[slot.dateKey] = [];
      map[slot.dateKey].push(slot);
    });
    return map;
  }, [allSlots]);

  // Monthly Calendar cells computation
  const monthData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const monthName = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ blank: true, key: `blank-${i}` });
    }

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

    return { monthName, days };
  }, [viewDate, slotsByDate]);

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDateKey) return [];
    return slotsByDate[selectedDateKey] || [];
  }, [selectedDateKey, slotsByDate]);

  const selectedDateFormatted = useMemo(() => {
    if (!selectedDateKey) return '';
    const [y, m, d] = selectedDateKey.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  }, [selectedDateKey]);

  const handleSelectDate = (dateKey) => {
    setSelectedDateKey(dateKey);
    const daySlots = slotsByDate[dateKey] || [];
    if (daySlots.length > 0) {
      setSelectedSlot(daySlots[0]);
    } else {
      setSelectedSlot(null);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedService) {
      setErrorNotice('Please select an advisory service first.');
      return;
    }
    if (!email.trim()) {
      setErrorNotice('Please enter a valid email address.');
      return;
    }
    if (selectedService.type !== 'COURSE' && !selectedSlot) {
      setErrorNotice('Please choose an available date and time slot from the calendar.');
      return;
    }

    setSubmitting(true);
    setErrorNotice(null);

    try {
      const result = await createServiceBooking({
        service: selectedService,
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
        setErrorNotice(result.message || 'Unable to confirm booking with Wix Bookings.');
      }
    } catch (err) {
      setErrorNotice(err.message || 'An unexpected error occurred during booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section 
      id="booking-section" 
      ref={sectionRef} 
      className="dedicated-booking-section"
      style={{
        paddingTop: '3.5rem',
        paddingBottom: '5rem',
        borderTop: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, rgba(8, 12, 20, 0.4) 0%, rgba(14, 21, 38, 0.75) 100%)',
      }}
    >
      <div className="container">
        {/* Step Progression Header */}
        <div className="booking-stepper-header" style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div className="badge badge-neutral" style={{ padding: '4px 12px', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
            <CalendarCheck size={13} style={{ color: 'var(--brand-accent)' }} />
            <span>Dedicated Booking Experience</span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
            Schedule Your Advisory Engagement
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', fontSize: '0.95rem' }}>
            Real-time synchronization with our Wix Studio enterprise calendar. Choose your date, select a verified open time slot, and finalize your booking.
          </p>

          {/* Stepper Breadcrumb Pills */}
          <div className="stepper-pills-row" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <div className={`stepper-pill ${selectedService ? 'completed' : 'active'}`}>
              <span className="step-num">1</span>
              <span>Select Service</span>
            </div>
            <div className="stepper-arrow">&rarr;</div>
            <div className={`stepper-pill ${selectedSlot || selectedService?.type === 'COURSE' ? 'completed' : selectedService ? 'active' : ''}`}>
              <span className="step-num">2</span>
              <span>Choose Date &amp; Time</span>
            </div>
            <div className="stepper-arrow">&rarr;</div>
            <div className={`stepper-pill ${firstName && email ? 'completed' : selectedSlot || selectedService?.type === 'COURSE' ? 'active' : ''}`}>
              <span className="step-num">3</span>
              <span>Attendee Details</span>
            </div>
            <div className="stepper-arrow">&rarr;</div>
            <div className={`stepper-pill ${bookingSuccess ? 'completed' : ''}`}>
              <span className="step-num">4</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {/* Success View */}
        {bookingSuccess ? (
          <div className="booking-success-box" style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem', background: 'rgba(14, 21, 38, 0.95)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div className="state-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', margin: '0 auto 1.25rem', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Booking Confirmed by Wix!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '1.75rem' }}>
              {bookingSuccess.message}
            </p>

            <div className="booking-summary-card" style={{ textAlign: 'left', background: 'rgba(255, 255, 255, 0.03)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1.5rem' }}>
              <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Service</span>
                <strong>{selectedService.name}</strong>
              </div>
              {selectedSlot ? (
                <>
                  <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Date</span>
                    <strong>{selectedSlot.formattedDate}</strong>
                  </div>
                  <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Time</span>
                    <strong>{selectedSlot.formattedTime}</strong>
                  </div>
                </>
              ) : null}
              <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Wix Booking ID</span>
                <code style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--brand-accent)', padding: '2px 6px', borderRadius: '4px' }}>{bookingSuccess.bookingId}</code>
              </div>
              <div className="summary-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Attendee</span>
                <strong>{firstName} {lastName} ({email})</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setBookingSuccess(null);
                setFirstName('');
                setLastName('');
                setEmail('');
                setPhone('');
              }}
            >
              Book Another Engagement
            </button>
          </div>
        ) : !selectedService ? (
          /* Empty state when no service is selected */
          <div className="booking-choose-service-prompt" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'rgba(14, 21, 38, 0.6)', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--brand-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Sparkles size={26} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
              Step 1: Choose an Advisory Service Above
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
              Select any consultation or workshop card from the catalog above to open its live monthly calendar and real Wix time slots.
            </p>
            {services.length > 0 && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onSelectService(services[0])}
              >
                <span>Select &ldquo;{services[0].name}&rdquo;</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        ) : (
          /* Dedicated Service + Date & Time Section Layout */
          <div className="dedicated-booking-layout" style={{ maxWidth: '1040px', margin: '0 auto' }}>
            {/* Selected Service Card Ribbon */}
            <div className="selected-service-ribbon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(14, 21, 38, 0.95)', border: '1px solid var(--border-medium)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="badge badge-booking-type">{selectedService.typeLabel}</span>
                  <span className="badge badge-neutral" style={{ padding: '2px 8px' }}>
                    <Clock size={11} />
                    <span>{selectedService.durationFormatted}</span>
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{selectedService.name}</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedService.tagLine || selectedService.description}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--brand-accent)' }}>
                  {selectedService.formattedPrice}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const nextService = services.find(s => s.id !== selectedService.id);
                    if (nextService) onSelectService(nextService);
                  }}
                  title="Switch to another service"
                >
                  <RefreshCw size={13} />
                  <span>Switch</span>
                </button>
              </div>
            </div>

            {errorNotice && (
              <div className="checkout-notice error" style={{ marginBottom: '1.5rem', padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fca5a5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{errorNotice}</span>
                </div>
              </div>
            )}

            {/* Check whether Service is Course or Appointment */}
            {selectedService.type === 'COURSE' ? (
              /* Course / Cohort Workshop Flow */
              <div className="course-schedule-card" style={{ background: 'rgba(14, 21, 38, 0.95)', border: '1px solid var(--border-medium)', padding: '2rem', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <Layers size={20} style={{ color: 'var(--brand-accent)' }} />
                  <h4 style={{ margin: 0, fontSize: '1.15rem' }}>Multi-Session Workshop Cohort</h4>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  This engagement is structured as a cohort workshop. Registration enrolls you in all scheduled sessions. Duration: {selectedService.durationFormatted} across the curriculum.
                </p>

                <div className="course-spec-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Structure</span>
                    <strong style={{ display: 'block', marginTop: '2px' }}>Cohort Curriculum</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Capacity</span>
                    <strong style={{ display: 'block', marginTop: '2px' }}>Limited to {selectedService.capacity || 10} seats</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Policy</span>
                    <strong style={{ display: 'block', marginTop: '2px' }}>{selectedService.policyName}</strong>
                  </div>
                </div>
              </div>
            ) : (
              /* Real Monthly Calendar + Wix Time Slots V2 for Appointments */
              <div className="booking-datetime-panel" style={{ background: 'rgba(14, 21, 38, 0.95)', border: '1px solid var(--border-medium)', padding: '1.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}>
                    Step 2: Choose Date &amp; Available Time Slot
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    Dates with verified bookable slots are highlighted. Select an available date to view opening times.
                  </p>
                </div>

                {loadingSlots ? (
                  <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <span className="status-dot pulse" style={{ display: 'inline-block', marginRight: '8px' }} />
                    <span>Synchronizing real-time Wix Studio calendar availability...</span>
                  </div>
                ) : (
                  <div className="booking-datetime-grid">
                    {/* Left Column: Monthly Calendar */}
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

                      {/* Weekday Header */}
                      <div className="calendar-weekdays-row">
                        {WEEKDAYS.map((wd) => (
                          <div key={wd} className="calendar-weekday-cell">
                            {wd}
                          </div>
                        ))}
                      </div>

                      {/* Days Grid */}
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
                              title={isAvailable ? `${item.slotsCount} bookable slot(s) on ${item.dateKey}` : 'No available slots'}
                            >
                              <span className="day-number">{item.dayNum}</span>
                              {isAvailable ? (
                                <span className="availability-dot" title={`${item.slotsCount} slot(s)`} />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="calendar-legend">
                        <span className="legend-item">
                          <span className="availability-dot" style={{ display: 'inline-block' }} /> Available
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
                          <span>Real Available Slots</span>
                        </h4>
                        {selectedDateFormatted && (
                          <span className="selected-date-badge">{selectedDateFormatted}</span>
                        )}
                      </div>

                      {allSlots.length === 0 ? (
                        <div className="slots-empty-notice">
                          No open slots currently available in the 45-day window for this service.
                        </div>
                      ) : !selectedDateKey ? (
                        <div className="slots-empty-notice">
                          Please select a highlighted date on the calendar.
                        </div>
                      ) : slotsForSelectedDate.length === 0 ? (
                        <div className="slots-empty-notice">
                          No open slots on this date. Please pick another highlighted date on the calendar.
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
                                {isSelected && (
                                  <span className="slot-check-indicator">
                                    <Check size={12} />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attendee Details & Submission Form */}
            <form onSubmit={handleSubmitBooking} className="booking-customer-form" style={{ background: 'rgba(14, 21, 38, 0.95)', border: '1px solid var(--border-medium)', padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 700 }}>
                  Step 3: Attendee Contact Details
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Enter your details to receive calendar invitations and direct consultant communications.
                </p>
              </div>

              <div className="form-grid-2">
                <div className="config-input-group">
                  <label>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text"
                    className="config-input"
                    placeholder="e.g. Jonathan"
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
                    placeholder="e.g. Sterling"
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
                    placeholder="jonathan@company.com"
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

              {/* Dynamic Live Selection Summary Bar */}
              {selectedSlot ? (
                <div className="booking-selected-summary-bar" style={{ marginTop: '1rem' }}>
                  <CalendarCheck size={16} style={{ color: 'var(--brand-accent)' }} />
                  <span>
                    Ready to book: <strong>{selectedService.name}</strong> on <strong>{selectedSlot.formattedDate}</strong> at <strong>{selectedSlot.formattedTime}</strong> ({selectedService.formattedPrice})
                  </span>
                </div>
              ) : selectedService.type === 'COURSE' ? (
                <div className="booking-selected-summary-bar" style={{ marginTop: '1rem' }}>
                  <CalendarCheck size={16} style={{ color: 'var(--brand-accent)' }} />
                  <span>
                    Ready to register: <strong>{selectedService.name}</strong> workshop curriculum ({selectedService.formattedPrice})
                  </span>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="booking-form-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={15} style={{ color: '#4ade80' }} />
                  <span>Verified Real Wix Headless Bookings Engine</span>
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary ${submitting ? 'loading' : ''}`}
                  disabled={submitting || (selectedService.type !== 'COURSE' && !selectedSlot)}
                  id="btn-confirm-booking-page"
                  style={{ minWidth: '220px' }}
                >
                  <span>{submitting ? 'Confirming with Wix...' : 'Confirm Real Booking'}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

export default BookingSection;
