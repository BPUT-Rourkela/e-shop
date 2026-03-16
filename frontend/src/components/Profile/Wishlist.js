import React from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { toggleWishlist } from '../../api';

const Wishlist = ({ wishlist, refreshProfile }) => {
  
  const handleRemove = async (id) => {
    try {
      await toggleWishlist(id);
      refreshProfile();
    } catch (err) {
      alert("Failed to update wishlist");
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Heart className="text-rose-500" /> My Wishlist
      </h3>
      
      {wishlist.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium">Your wishlist is empty.</p>
          <p className="text-sm mt-2 max-w-sm mx-auto">Save items you love here and purchase them when you're ready.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map(product => (
            <div key={product._id} className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all group">
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <img src={product.image || 'https://via.placeholder.com/300x200'} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button 
                  onClick={() => handleRemove(product._id)}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full text-red-500 shadow-md hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h4>
                <div className="text-lg font-bold text-indigo-600 mb-4">${product.price}</div>
                <button className="w-full bg-indigo-50 text-indigo-700 py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-indigo-600 hover:text-white transition-colors">
                  <ShoppingCart size={18} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
