import React, { useEffect, useState } from 'react';
import { fetchProducts, createOrder } from '../api';
import { ShoppingCart, PackageOpen, Award, Shield, Truck } from 'lucide-react';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(({ data }) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleBuyNow = async (product) => {
    try {
      if (!localStorage.getItem('token')) {
        alert("Please login to buy products");
        return;
      }
      await createOrder({
        products: [{ product: product._id, quantity: 1 }],
        totalAmount: product.price
      });
      alert('Order placed successfully!');
    } catch (err) {
      alert('Failed to place order');
    }
  };

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

      {/* Features Showcase */}
      <div className="max-w-7xl mx-auto px-6 mb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
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

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Featured Products
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-lg border border-gray-100 flex flex-col items-center">
             <div className="bg-indigo-50 p-6 rounded-full mb-6 text-indigo-300">
                <PackageOpen size={64} />
             </div>
             <h3 className="text-2xl font-bold text-gray-800 mb-2">No products available yet</h3>
             <p className="text-gray-500 max-w-md mx-auto">
               We're currently restocking our inventory with amazing new items. Please check back later!
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product._id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img 
                    src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'} 
                    alt={product.name} 
                    className="h-full w-full object-cover group-hover:scale-110 transition duration-500" 
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-emerald-600 shadow-sm">
                    In Stock
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-black text-indigo-900">${product.price}</span>
                    <button 
                      onClick={() => handleBuyNow(product)}
                      className="bg-indigo-600 text-white p-3 rounded-xl flex items-center justify-center hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
                      title="Buy Now"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
