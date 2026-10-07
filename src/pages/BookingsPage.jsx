import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Search, 
  Clock, 
  Sparkles
} from 'lucide-react';
import { BookingCard } from '../components/BookingCard';
import { BookingModal } from '../components/BookingModal';
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
              Select an engagement model to view real-time availability. We offer dedicated architectural reviews, 
              hands-on workshops, and strategic consulting sessions.
            </p>
          </div>
        </div>
      </section>

      {/* Main Catalog & Filter Section */}
      <section className="catalog-section" style={{ paddingBottom: '5rem' }}>
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
              {filteredServices.map((service) => (
                <BookingCard
                  key={service.id}
                  service={service}
                  onBook={setSelectedService}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Scheduling Modal (Real Monthly Calendar + Wix Time Slots V2) */}
      {selectedService && (
        <BookingModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}

export default BookingsPage;
