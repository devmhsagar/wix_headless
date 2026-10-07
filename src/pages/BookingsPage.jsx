import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Clock, 
  Sparkles,
  ArrowDown
} from 'lucide-react';
import { BookingCard } from '../components/BookingCard';
import { BookingSection } from '../components/BookingSection';
import { 
  LoadingSkeleton, 
  ErrorState 
} from '../components/StatusStates';

export function BookingsPage({
  services = [],
  loading = false,
  error = null,
  onRefresh,
}) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);

  // Auto-select first appointment service if none selected initially
  useEffect(() => {
    if (!selectedService && services.length > 0) {
      const defaultAppt = services.find((s) => s.type === 'APPOINTMENT') || services[0];
      setSelectedService(defaultAppt);
    }
  }, [services, selectedService]);

  const filteredServices = useMemo(() => {
    let list = [...services];

    if (filterType !== 'ALL') {
      list = list.filter((s) => s.type === filterType);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tagLine.toLowerCase().includes(q)
      );
    }

    return list;
  }, [services, filterType, searchTerm]);

  const handleSelectServiceAndScroll = (service) => {
    setSelectedService(service);
    const target = document.getElementById('booking-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bookings-page" id="page-bookings">
      {/* Bookings Header Section */}
      <section className="page-header-section" style={{ paddingTop: '3.5rem', paddingBottom: '2.5rem' }}>
        <div className="container">
          <div className="page-header-content">
            <span className="section-eyebrow">Advisory &amp; Services</span>
            <h1 className="page-title" style={{ marginTop: '0.4rem', marginBottom: '0.75rem' }}>
              Schedule an Advisory Session
            </h1>
            <p className="page-subtitle" style={{ maxWidth: '680px' }}>
              Select an engagement model to view real-time calendar availability. We offer dedicated architectural reviews, 
              hands-on workshops, and strategic consulting sessions.
            </p>
          </div>
        </div>
      </section>

      {/* Main Catalog & Filter Section */}
      <section className="catalog-section" style={{ paddingBottom: '3.5rem' }}>
        <div className="container">
          {/* Controls Bar: Type Filter & Search */}
          <div className="catalog-controls-bar" style={{ marginBottom: '2.5rem' }}>
            {/* Filter Pills */}
            <div className="booking-filter-pills">
              <button
                type="button"
                className={`filter-pill ${filterType === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterType('ALL')}
              >
                All Services ({services.length})
              </button>
              <button
                type="button"
                className={`filter-pill ${filterType === 'APPOINTMENT' ? 'active' : ''}`}
                onClick={() => setFilterType('APPOINTMENT')}
              >
                1-on-1 Consultations
              </button>
              <button
                type="button"
                className={`filter-pill ${filterType === 'COURSE' ? 'active' : ''}`}
                onClick={() => setFilterType('COURSE')}
              >
                Workshops &amp; Cohorts
              </button>
            </div>

            {/* Search Input */}
            <div className="search-input-wrap" style={{ maxWidth: '340px' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search advisory engagements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Catalog State Management */}
          {loading && services.length === 0 ? (
            <LoadingSkeleton count={3} />
          ) : error ? (
            <ErrorState error={error} onRetry={onRefresh} />
          ) : filteredServices.length === 0 ? (
            <div className="state-box">
              <div className="state-icon-wrapper info">
                <Calendar size={32} />
              </div>
              <h3 className="state-title">No Advisory Services Found</h3>
              <p className="state-description">
                {searchTerm
                  ? `No services matched "${searchTerm}". Try resetting your filter.`
                  : 'No active advisory services found.'}
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('ALL');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="bookings-grid">
              {filteredServices.map((service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div 
                    key={service.id} 
                    className={`booking-card-wrapper ${isSelected ? 'selected-card-ring' : ''}`}
                    style={{ position: 'relative' }}
                  >
                    <BookingCard
                      service={service}
                      onBook={handleSelectServiceAndScroll}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Dedicated Separate Date & Time Booking Section */}
      <BookingSection
        selectedService={selectedService}
        onSelectService={setSelectedService}
        services={services}
      />
    </div>
  );
}

export default BookingsPage;
