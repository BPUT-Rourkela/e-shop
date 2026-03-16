import React, { useEffect, useState } from 'react';
import { fetchProducts, fetchTrendingProducts, fetchRecommendedProducts, createOrder } from '../api';
import { ShoppingCart, PackageOpen, Award, Shield, Truck, Search, TrendingUp, Star } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const ProductCard = ({ product, onBuy }) => (
  <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1">
    <div className="relative h-56 overflow-hidden bg-gray-100">
      <img
        src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
        alt={product.name}
        className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
      />
      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-emerald-600 shadow-sm">
        In Stock
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-lg font-bold mb-1 text-gray-800 line-clamp-1">{product.name}</h3>
      <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide mb-2">{product.category}</p>
      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-black text-indigo-900">${product.price}</span>
        <button
          onClick={() => onBuy(product)}
          className="bg-indigo-600 text-white p-3 rounded-xl flex items-center justify-center hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
          title="Buy Now"
        >
          <ShoppingCart size={18} />
        </button>
      </div>
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title, color = 'indigo' }) => (
  <div className="flex items-center gap-3 mb-8">
    <div className={`bg-${color}-100 p-2 rounded-xl text-${color}-600`}>
      <Icon size={22} />
    </div>
    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
  </div>
);

const Home = () => {
  const [products, setProducts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [allRes, trendRes, recRes] = await Promise.all([
          fetchProducts(),
          fetchTrendingProducts(),
          fetchRecommendedProducts()
        ]);
        setProducts(allRes.data || []);
        setTrending(trendRes.data || []);
        setRecommended(recRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const handleBuyNow = async (product) => {
    try {
      if (!localStorage.getItem('token')) {
        alert("Please login to buy products");
        return;
      }
      await createOrder({ products: [{ product: product._id, quantity: 1 }], totalAmount: product.price });
      alert('Order placed successfully!');
    } catch (err) {
      alert('Failed to place order');
    }
  };

  const filteredProducts = products.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-teal-200">

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white py-20 px-6 sm:px-12 lg:px-24 rounded-b-[3rem] shadow-2xl mb-12">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Extraordinary</span> Products
          </h1>
          <p className="text-lg md:text-2xl text-purple-200 mb-10 max-w-3xl">
            Experience the future of shopping. Curated items, securely delivered to your door with unparalleled speed.
          </p>
          <div className="flex gap-4">
            <button className="bg-teal-500 hover:bg-teal-400 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-teal-500/30 transition transform hover:-translate-y-1">
              Shop Now
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full font-bold transition">
              Explore Deals
            </button>
          </div>
        </div>
      </div>

      {/* Features Row */}
      <div className="max-w-7xl mx-auto px-6 mb-14 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><Truck size={24} /></div>
          <div><h4 className="font-bold text-lg">Fast Delivery</h4><p className="text-sm text-gray-500">Free shipping on orders over $50</p></div>
        </div>
        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600"><Shield size={24} /></div>
          <div><h4 className="font-bold text-lg">Secure Checkout</h4><p className="text-sm text-gray-500">100% protected payments</p></div>
        </div>
        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="bg-amber-100 p-3 rounded-xl text-amber-600"><Award size={24} /></div>
          <div><h4 className="font-bold text-lg">Premium Quality</h4><p className="text-sm text-gray-500">Hand-picked and verified items</p></div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : searchQuery ? (
        /* --- SEARCH RESULTS --- */
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map(p => <ProductCard key={p._id} product={p} onBuy={handleBuyNow} />)}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 pb-20 space-y-16">

          {/* --- TRENDING SECTION --- */}
          {trending.length > 0 && (
            <section>
              <SectionHeader icon={TrendingUp} title="🔥 Trending Now" color="red" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {trending.map(p => (
                  <div key={p._id} className="relative">
                    <div className="absolute -top-3 -left-2 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">TRENDING</div>
                    <ProductCard product={p} onBuy={handleBuyNow} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- RECOMMENDED SECTION --- */}
          {recommended.length > 0 && (
            <section>
              <SectionHeader icon={Star} title="⭐ Recommended For You" color="amber" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {recommended.map(p => (
                  <div key={p._id} className="relative">
                    <div className="absolute -top-3 -left-2 z-10 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">RECOMMENDED</div>
                    <ProductCard product={p} onBuy={handleBuyNow} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* --- ALL PRODUCTS --- */}
          <section>
            <SectionHeader icon={ShoppingCart} title="Featured Products" color="indigo" />
            {products.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="bg-indigo-50 p-6 rounded-full mb-6 text-indigo-300"><PackageOpen size={64} /></div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No products available yet</h3>
                <p className="text-gray-500 max-w-md">We're restocking our inventory. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map(p => <ProductCard key={p._id} product={p} onBuy={handleBuyNow} />)}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Home;
