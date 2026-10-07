import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ConfigModal } from './components/ConfigModal';
import { PostDetailModal } from './components/PostDetailModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { BlogPage } from './pages/BlogPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { ProductsPage } from './pages/ProductsPage';
import { BookingsPage } from './pages/BookingsPage';
import { ContactPage } from './pages/ContactPage';
import { isWixConfigured } from './api/wixClient';
import { fetchPublishedPosts } from './api/blogService';
import { fetchPublishedTestimonials } from './api/testimonialService';
import { fetchProducts } from './api/productService';
import { fetchBookingServices } from './api/bookingService';
import { 
  getCurrentCart, 
  addToCart, 
  updateCartQuantity, 
  removeFromCart, 
  clearCart, 
  createCheckoutRedirect 
} from './api/cartService';

export function App() {
  const [activePage, setActivePage] = useState('home');

  // Blog Posts State (Phase 1)
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Testimonials State (Phase 2)
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [testimonialsError, setTestimonialsError] = useState(null);
  const [testimonialsLastUpdated, setTestimonialsLastUpdated] = useState(null);

  // Products State (Phase 3 eCommerce)
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [productsLastUpdated, setProductsLastUpdated] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addingProductId, setAddingProductId] = useState(null);

  // Bookings State (Phase 4 Bookings)
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);
  const [servicesLastUpdated, setServicesLastUpdated] = useState(null);

  // Cart State (Phase 3 eCommerce)
  const [cart, setCart] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals & General State
  const [selectedPost, setSelectedPost] = useState(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configured, setConfigured] = useState(isWixConfigured());

  // Dynamic Blog Fetcher
  const loadPosts = useCallback(async () => {
    const isNowConfigured = isWixConfigured();
    setConfigured(isNowConfigured);

    if (!isNowConfigured) {
      setPosts([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchPublishedPosts();
      setPosts(data.posts || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('[Wix SDK Blog Error]:', err);
      setError(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Dynamic Testimonials Fetcher (Wix CMS)
  const loadTestimonials = useCallback(async () => {
    const isNowConfigured = isWixConfigured();
    setConfigured(isNowConfigured);

    if (!isNowConfigured) {
      setTestimonials([]);
      setTestimonialsLoading(false);
      setTestimonialsError(null);
      return;
    }

    setTestimonialsLoading(true);
    setTestimonialsError(null);

    try {
      const data = await fetchPublishedTestimonials();
      setTestimonials(data.testimonials || []);
      setTestimonialsLastUpdated(new Date());
    } catch (err) {
      console.error('[Wix SDK Testimonials Error]:', err);
      setTestimonialsError(err);
      setTestimonials([]);
    } finally {
      setTestimonialsLoading(false);
    }
  }, []);

  // Dynamic Products Fetcher (Wix Stores)
  const loadProducts = useCallback(async () => {
    const isNowConfigured = isWixConfigured();
    setConfigured(isNowConfigured);

    if (!isNowConfigured) {
      setProducts([]);
      setProductsLoading(false);
      setProductsError(null);
      return;
    }

    setProductsLoading(true);
    setProductsError(null);

    try {
      const data = await fetchProducts();
      setProducts(data.products || []);
      setProductsLastUpdated(new Date());
    } catch (err) {
      console.error('[Wix SDK Stores Error]:', err);
      setProductsError(err);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Dynamic Bookings Fetcher (Wix Bookings)
  const loadServices = useCallback(async () => {
    const isNowConfigured = isWixConfigured();
    setConfigured(isNowConfigured);

    if (!isNowConfigured) {
      setServices([]);
      setServicesLoading(false);
      setServicesError(null);
      return;
    }

    setServicesLoading(true);
    setServicesError(null);

    try {
      const data = await fetchBookingServices();
      setServices(data.services || []);
      setServicesLastUpdated(new Date());
    } catch (err) {
      console.error('[Wix SDK Bookings Error]:', err);
      setServicesError(err);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  // Dynamic Cart Fetcher (Wix eCommerce)
  const loadCart = useCallback(async () => {
    if (!isWixConfigured()) return;
    try {
      const current = await getCurrentCart();
      setCart(current);
    } catch (err) {
      console.warn('[Wix SDK Cart Error]:', err);
    }
  }, []);

  // Initial Fetch on Mount
  useEffect(() => {
    loadPosts();
    loadTestimonials();
    loadProducts();
    loadServices();
    loadCart();
  }, [loadPosts, loadTestimonials, loadProducts, loadServices, loadCart]);

  // Cart Handlers
  const handleAddToCart = async (product, quantity = 1, options = {}) => {
    setAddingProductId(product.id);
    try {
      const updated = await addToCart(product, quantity, options);
      setCart(updated);
      setIsCartOpen(true);
    } catch (err) {
      console.error('[Wix Add To Cart Error]:', err);
      alert(`Could not add to cart: ${err.message}`);
    } finally {
      setAddingProductId(null);
    }
  };

  const handleUpdateQuantity = async (lineItemId, quantity) => {
    try {
      const updated = await updateCartQuantity(lineItemId, quantity);
      setCart(updated);
    } catch (err) {
      console.error('[Wix Update Qty Error]:', err);
    }
  };

  const handleRemoveFromCart = async (lineItemId) => {
    try {
      const updated = await removeFromCart(lineItemId);
      setCart(updated);
    } catch (err) {
      console.error('[Wix Remove Line Item Error]:', err);
    }
  };

  const handleClearCart = async () => {
    try {
      const empty = await clearCart();
      setCart(empty);
    } catch (err) {
      console.error('[Wix Clear Cart Error]:', err);
    }
  };

  const handleCheckout = async () => {
    return await createCheckoutRedirect();
  };

  // Navigation Handler
  const handleNavigate = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'blog') {
      loadPosts();
    } else if (page === 'testimonials') {
      loadTestimonials();
    } else if (page === 'products') {
      loadProducts();
      loadCart();
    } else if (page === 'bookings') {
      loadServices();
    }
  };

  const handleConfigSaved = () => {
    loadPosts();
    loadTestimonials();
    loadProducts();
    loadServices();
    loadCart();
  };

  const handleGeneralRefresh = () => {
    if (activePage === 'products') {
      loadProducts();
      loadCart();
    } else if (activePage === 'bookings') {
      loadServices();
    } else if (activePage === 'testimonials') {
      loadTestimonials();
    } else {
      loadPosts();
    }
  };

  return (
    <div className="app-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        postCount={posts.length}
        testimonialCount={testimonials.length}
        productCount={products.length}
        bookingCount={services.length}
        cartItemCount={cart?.totalItems || 0}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activePage === 'home' ? (
          <HomePage
            posts={posts}
            loading={loading}
            error={error}
            testimonials={testimonials}
            testimonialsLoading={testimonialsLoading}
            products={products}
            productsLoading={productsLoading}
            services={services}
            servicesLoading={servicesLoading}
            onAddToCart={handleAddToCart}
            addingProductId={addingProductId}
            onSelectProduct={setSelectedProduct}
            onNavigate={handleNavigate}
            onSelectPost={setSelectedPost}
          />
        ) : activePage === 'products' ? (
          <ProductsPage
            products={products}
            loading={productsLoading}
            error={productsError}
            onRefresh={loadProducts}
            onAddToCart={handleAddToCart}
            addingProductId={addingProductId}
          />
        ) : activePage === 'bookings' ? (
          <BookingsPage
            services={services}
            loading={servicesLoading}
            error={servicesError}
            onRefresh={loadServices}
          />
        ) : activePage === 'contact' ? (
          <ContactPage />
        ) : activePage === 'blog' ? (
          <BlogPage
            posts={posts}
            loading={loading}
            error={error}
            onRefresh={loadPosts}
            onSelectPost={setSelectedPost}
          />
        ) : (
          <TestimonialsPage
            testimonials={testimonials}
            loading={testimonialsLoading}
            error={testimonialsError}
            onRefresh={loadTestimonials}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Modals & Drawers */}
      {selectedPost ? (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      ) : null}

      {selectedProduct ? (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          isAddingToCart={addingProductId === selectedProduct.id}
        />
      ) : null}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onCheckout={handleCheckout}
        onNavigateToProducts={() => handleNavigate('products')}
      />

      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSaved={handleConfigSaved}
      />
    </div>
  );
}

export default App;
