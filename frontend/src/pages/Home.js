import React, { useEffect, useState, useCallback } from 'react';
import { fetchProducts, fetchTrendingProducts, fetchMLRecommendations, createOrder, fetchUserOrders } from '../api';
import {
  ShoppingCart, Award, Shield, Truck, Search,
  TrendingUp, Star, Monitor, Coffee, Home as HomeIcon, Mouse,
  Sparkles, Zap, Brain
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

/* ─────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────── */
const ProductCard = ({ product, onBuy, badge }) => (
  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
    <div className="relative aspect-square p-6 overflow-hidden bg-white border-b border-gray-50 flex items-center justify-center">
      <img
        src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
        alt={product.name}
        className="h-full w-full object-contain group-hover:scale-110 transition duration-500"
      />
      <div className="absolute top-3 right-3 bg-emerald-50 border border-emerald-100 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-600 shadow-sm uppercase tracking-wider">
        In Stock
      </div>
    </div>
    <div className="p-5 flex flex-col flex-grow">
      <h3 className="text-sm font-bold mb-1 text-gray-800 line-clamp-2" title={product.name}>{product.name}</h3>
      <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mb-2">{product.category}</p>
      <p className="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
      <div className="flex justify-between items-end mt-auto pt-4">
        <span className="text-2xl font-black text-slate-800">${product.price}</span>
        <button
          onClick={() => onBuy(product)}
          className="bg-slate-900 text-white p-2.5 rounded-xl flex items-center justify-center hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all active:scale-95"
          title="Buy Now"
        >
          <ShoppingCart size={18} />
        </button>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, title, subtitle, color = 'indigo' }) => (
  <div className="flex items-start gap-3 mb-8">
    <div className={`bg-${color}-100 p-2 rounded-xl text-${color}-600 mt-0.5`}>
      <Icon size={22} />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   AI RECOMMENDATION BANNER (logged-in users)
───────────────────────────────────────────── */
const AIRecommendBanner = ({ loading, items, onBuy }) => {
  if (loading) {
    return (
      <section className="relative rounded-3xl overflow-hidden mb-4"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 60%), radial-gradient(circle at 80% 20%, #2563eb 0%, transparent 50%)' }} />
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-purple-500/30 p-2 rounded-xl">
              <Brain size={22} className="text-purple-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Recommended For You</h2>
              <p className="text-sm text-purple-300 mt-0.5">AI is personalizing your feed…</p>
            </div>
          </div>
          <div className="flex gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-[240px] shrink-0 bg-white/5 rounded-2xl h-[340px] animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <section
      className="relative rounded-3xl overflow-hidden mb-4"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
    >
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #2563eb, transparent 70%)' }} />
        <div className="absolute top-1/2 left-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)' }} />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 p-8 md:p-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-purple-900/40">
              <Brain size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">Recommended For You</h2>
                <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={10} />AI Powered
                </span>
              </div>
              <p className="text-sm text-purple-300 mt-0.5">Personalized based on your purchase history</p>
            </div>
          </div>
          {/* Pulse indicator */}
          <div className="hidden md:flex items-center gap-2 text-purple-400 text-xs font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500" />
            </span>
            Live personalization
          </div>
        </div>

        {/* Horizontal scroll cards */}
        <div className="flex overflow-x-auto gap-5 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {items.map((p, i) => (
            <div
              key={p._id || p.product_id || i}
              className="w-[230px] sm:w-[250px] shrink-0 relative group"
            >
              {/* Glowing AI badge */}
              <div className="absolute -top-3 -left-2 z-20 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Zap size={9} />AI PICK
              </div>

              {/* Card wrapper with glow */}
              <div className="relative rounded-2xl p-[1.5px] transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(37,99,235,0.4))' }}>
                <div className="rounded-2xl overflow-hidden bg-white">
                  <ProductCard
                    product={{ ...p, _id: p._id || p.product_id }}
                    onBuy={onBuy}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────
   MAIN HOME COMPONENT
───────────────────────────────────────────── */
const Home = () => {
  const [products, setProducts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [mlRecommended, setMlRecommended] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingML, setLoadingML] = useState(false);
  const [recommendedForSearch, setRecommendedForSearch] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // ---- Category helpers ----
  const getTopProducts = useCallback((items, keywords) =>
    items
      .filter(p => keywords.some(kw => p.category?.toLowerCase().includes(kw)))
      .sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0))
      .slice(0, 15),
    []
  );

  // ---- Load initial data ----
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [allRes, trendRes] = await Promise.all([
          fetchProducts(),
          fetchTrendingProducts(),
        ]);
        setProducts(allRes.data || []);
        setTrending(trendRes.data || []);

        // Personalized ML recommendations only for logged-in users
        if (isLoggedIn) {
          setLoadingML(true);
          try {
            const userOrdersRes = await fetchUserOrders();
            const pastProducts = userOrdersRes.data.flatMap(o =>
              o.products.map(p => p.product).filter(Boolean)
            );

            if (pastProducts.length > 0) {
              // Build text corpus from purchased product names/descriptions/categories
              const texts = pastProducts
                .filter(p => p && p.name)
                .map(p => [p.name, p.category, p.description]
                  .filter(Boolean).join(' ').trim())
                .slice(0, 8)
                .filter(t => t.length > 0);

              if (texts.length > 0) {
                const mlRes = await fetchMLRecommendations(texts);
                const recs = mlRes.data.recommendations || [];
                setMlRecommended(recs.slice(0, 12));
              }
            }
          } catch (e) {
            // User has no orders or ML failed — show nothing (categories will still show)
            console.log('[ML] No personalized recs available:', e.message);
          } finally {
            setLoadingML(false);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPage(false);
      }
    };
    loadAll();
  }, [isLoggedIn]);

  // ---- Search-based ML recommendations ----
  useEffect(() => {
    if (!searchQuery || products.length === 0) {
      setRecommendedForSearch([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
    if (filtered.length > 0) {
      setLoadingSearch(true);
      const texts = filtered
        .slice(0, 3)
        .map(p => `${p.name || ''} ${p.description || ''}`.trim())
        .filter(t => t.length > 0);
      if (texts.length > 0) {
        fetchMLRecommendations(texts)
          .then(res => setRecommendedForSearch(res.data.recommendations || []))
          .catch(err => console.error(err))
          .finally(() => setLoadingSearch(false));
      } else {
        setLoadingSearch(false);
      }
    } else {
      setRecommendedForSearch([]);
    }
  }, [searchQuery, products]);

  // ---- Buy handler ----
  const handleBuyNow = async (product) => {
    if (!localStorage.getItem('token')) {
      alert('Please login to buy products');
      return;
    }
    try {
      await createOrder({ products: [{ product: product._id, quantity: 1 }], totalAmount: product.price });
      alert('Order placed successfully!');
    } catch (err) {
      alert('Failed to place order');
    }
  };

  // ---- Derived data ----
  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  const electronics        = getTopProducts(products, ['electronic']);
  const kitchen            = getTopProducts(products, ['kitchen', 'kichine']);
  const homeItems          = getTopProducts(products, ['home']);
  const computerAccessories = getTopProducts(products, ['computer', 'accessories', 'acessories']);

  // Show AI banner when: logged in AND (loading ML OR has recs)
  const showAISection = isLoggedIn && (loadingML || mlRecommended.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-teal-200">

      {/* ── Hero ── */}
      <div
        className="relative text-white overflow-hidden mb-12"
        style={{ backgroundColor: '#0d1b2a', minHeight: '100vh' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop')`,
            opacity: 0.35,
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, #0d1b2a 40%, rgba(13,27,42,0.75) 65%, rgba(13,27,42,0.25) 100%)' }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex flex-col justify-between pt-32 pb-12" style={{ minHeight: '100vh' }}>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs font-bold tracking-widest uppercase text-indigo-400 mb-5">New Collection</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-2xl leading-tight text-white">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Extraordinary</span> Products
            </h1>
            <p className="text-base md:text-lg text-blue-200/75 mb-10 max-w-xl leading-relaxed">
              Experience the future of shopping. Curated items, securely delivered to your door with unparalleled speed.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 bg-white text-gray-900 px-7 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md">
                Shop Now <span className="text-base">→</span>
              </button>
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-sm text-white px-7 py-3 rounded-lg font-semibold transition">
                Explore Deals
              </button>
            </div>
          </div>

          {/* ── Features Row (now inside Hero bottom) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl transition hover:bg-white/15 group">
              <div className="bg-indigo-500/20 p-3 rounded-xl text-indigo-300 group-hover:scale-110 transition-transform"><Truck size={24} /></div>
              <div>
                <h4 className="font-bold text-lg text-white">Fast Delivery</h4>
                <p className="text-sm text-indigo-200/60 font-medium">Free shipping on orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl transition hover:bg-white/15 group">
              <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-300 group-hover:scale-110 transition-transform"><Shield size={24} /></div>
              <div>
                <h4 className="font-bold text-lg text-white">Secure Checkout</h4>
                <p className="text-sm text-emerald-200/60 font-medium">100% protected payments</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl transition hover:bg-white/15 group">
              <div className="bg-amber-500/20 p-3 rounded-xl text-amber-300 group-hover:scale-110 transition-transform"><Award size={24} /></div>
              <div>
                <h4 className="font-bold text-lg text-white">Premium Quality</h4>
                <p className="text-sm text-amber-200/60 font-medium">Hand-picked and verified items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content (moved mt accordingly) ── */}
      <div className="mt-8"></div>

      {/* ── Main Content ── */}
      {loadingPage ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      ) : searchQuery ? (
        /* ── SEARCH RESULTS ── */
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Results for "{searchQuery}"</h2>
            <p className="text-gray-500 mt-1 text-sm">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</p>
          </div>
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="bg-indigo-50 p-6 rounded-full mb-6 text-indigo-300"><Search size={64} /></div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No results for "{searchQuery}"</h3>
              <p className="text-gray-500">Try a different keyword or browse all products below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {filteredProducts.map(p => <ProductCard key={p._id} product={p} onBuy={handleBuyNow} />)}
            </div>
          )}

          {/* ML Recommendations based on search */}
          {filteredProducts.length > 0 && (
            <div className="mt-12 border-t border-gray-100 pt-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-fuchsia-100 p-2 rounded-xl text-fuchsia-600"><Star size={22} /></div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Accessories & Alternatives</h2>
                  <p className="text-sm text-gray-500">AI-powered recommendations based on your search</p>
                </div>
              </div>
              {loadingSearch ? (
                <div className="flex gap-2 items-center text-fuchsia-600 font-medium py-10">
                  {[0, 75, 150].map(d => (
                    <div key={d} className="w-2 h-2 rounded-full bg-fuchsia-600 animate-ping" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              ) : recommendedForSearch.length > 0 ? (
                <div className="flex overflow-x-auto gap-6 pb-6 snap-x" style={{ scrollbarWidth: 'none' }}>
                  {recommendedForSearch.map((p, i) => (
                    <div key={p._id || p.product_id || i} className="w-[260px] sm:w-[280px] snap-start shrink-0 relative">
                      <div className="absolute -top-3 -left-2 z-10 bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        SMART MATCH
                      </div>
                      <ProductCard product={{ ...p, _id: p._id || p.product_id }} onBuy={handleBuyNow} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No specific recommendations found.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ── HOME FEED ── */
        <div className="max-w-7xl mx-auto px-6 pb-20 space-y-16">

          {/* ── AI "Recommended For You" — only for logged-in users with history ── */}
          {showAISection && (
            <AIRecommendBanner
              loading={loadingML}
              items={mlRecommended}
              onBuy={handleBuyNow}
            />
          )}

          {/* ── Trending Now ── */}
          {trending.length > 0 && (
            <section>
              <SectionHeader icon={TrendingUp} title="🔥 Trending Now" color="red" />
              <div className="flex overflow-x-auto gap-6 pb-6 snap-x" style={{ scrollbarWidth: 'none' }}>
                {trending.map(p => (
                  <div key={p._id} className="w-[260px] sm:w-[280px] snap-start shrink-0 relative">
                    <div className="absolute -top-3 -left-2 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">TRENDING</div>
                    <ProductCard product={p} onBuy={handleBuyNow} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Best Sellers: Electronics ── */}
          {electronics.length > 0 && (
            <section>
              <SectionHeader icon={Monitor} title="Best Sellers: Electronics" color="blue" />
              <div className="flex overflow-x-auto gap-6 pb-6 snap-x" style={{ scrollbarWidth: 'none' }}>
                {electronics.map(p => (
                  <div key={p._id} className="w-[260px] sm:w-[280px] snap-start shrink-0">
                    <ProductCard product={p} onBuy={handleBuyNow} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Best Selling: Kitchen ── */}
          {kitchen.length > 0 && (
            <section>
              <SectionHeader icon={Coffee} title="Best Selling: Kitchen" color="orange" />
              <div className="flex overflow-x-auto gap-6 pb-6 snap-x" style={{ scrollbarWidth: 'none' }}>
                {kitchen.map(p => (
                  <div key={p._id} className="w-[260px] sm:w-[280px] snap-start shrink-0">
                    <ProductCard product={p} onBuy={handleBuyNow} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Top Home Items ── */}
          {homeItems.length > 0 && (
            <section>
              <SectionHeader icon={HomeIcon} title="Top Home Items" color="teal" />
              <div className="flex overflow-x-auto gap-6 pb-6 snap-x" style={{ scrollbarWidth: 'none' }}>
                {homeItems.map(p => (
                  <div key={p._id} className="w-[260px] sm:w-[280px] snap-start shrink-0">
                    <ProductCard product={p} onBuy={handleBuyNow} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Best Selling: Computer Accessories ── */}
          {computerAccessories.length > 0 && (
            <section>
              <SectionHeader icon={Mouse} title="Best Selling: Computer Accessories" color="purple" />
              <div className="flex overflow-x-auto gap-6 pb-6 snap-x" style={{ scrollbarWidth: 'none' }}>
                {computerAccessories.map(p => (
                  <div key={p._id} className="w-[260px] sm:w-[280px] snap-start shrink-0">
                    <ProductCard product={p} onBuy={handleBuyNow} />
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}

      {/* ── Footer ── */}
      <footer className="bg-[#0d1b2a] text-white border-t border-white/10 mt-16 px-4">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="text-sm font-black text-teal-400 uppercase tracking-widest mb-6">Products</h4>
              <ul className="space-y-3">
                <li><a href="/" className="text-sm text-gray-400 hover:text-white transition-all">All Products</a></li>
                <li><a href="/" className="text-sm text-gray-400 hover:text-white transition-all">New Arrivals</a></li>
                <li><a href="/" className="text-sm text-gray-400 hover:text-white transition-all">Bestsellers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-teal-400 uppercase tracking-widest mb-6">Company</h4>
              <ul className="space-y-3">
                <li><a href="/" className="text-sm text-gray-400 hover:text-white transition-all">About</a></li>
                <li><a href="/" className="text-sm text-gray-400 hover:text-white transition-all">Careers</a></li>
                <li><a href="/" className="text-sm text-gray-400 hover:text-white transition-all">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-teal-400 uppercase tracking-widest mb-6">Support</h4>
              <ul className="space-y-3">
                <li><a href="/" className="text-sm text-gray-400 hover:text-white transition-all">Help Center</a></li>
                <li><a href="/" className="text-sm text-gray-400 hover:text-white transition-all">Returns</a></li>
                <li><a href="/" className="text-sm text-gray-400 hover:text-white transition-all">Shipping</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black text-teal-400 uppercase tracking-widest mb-6">Legal</h4>
              <ul className="space-y-3">
                <li><a href="/" className="text-sm text-gray-400 hover:text-white transition-all">Privacy</a></li>
                <li><a href="/" className="text-sm text-gray-400 hover:text-white transition-all">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 font-medium font-sans italic">© {new Date().getFullYear()} EcomStore. All rights reserved.</p>
            <div className="flex gap-6 text-gray-500 text-xs uppercase tracking-tighter">
              <span>Secure Payments</span>
              <span>Global Shipping</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Home;
