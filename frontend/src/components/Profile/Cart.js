import React, { useState } from 'react';
import { ShoppingCart, Trash2, CreditCard, MapPin, CheckCircle, Info, Shield } from 'lucide-react';
import { removeFromCart, clearCart, createOrder } from '../../api';

const Cart = ({ cartItems, addresses = [], refreshProfile }) => {
  const [checkingOut, setCheckingOut] = useState(false);
  const [step, setStep] = useState(1); // 1 = Address, 2 = Payment
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // Credit Card dummy state
  const [ccDetails, setCcDetails] = useState({ number: '', expiry: '', cvv: '' });

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
        <ShoppingCart size={48} className="mb-4 opacity-50 text-indigo-300" />
        <p className="text-xl font-medium">Your cart is empty.</p>
        <p className="text-sm mt-2">Looks like you haven't added anything yet.</p>
      </div>
    );
  }

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      refreshProfile();
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  const handleClear = async () => {
    try {
      if (window.confirm("Are you sure you want to clear your cart?")) {
        await clearCart();
        refreshProfile();
      }
    } catch (err) {
      alert("Failed to clear cart");
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const startCheckout = () => {
    setCheckingOut(true);
    setStep(1);
  };

  const submitOrder = async () => {
    try {
      await createOrder({
        products: cartItems.map(c => ({
          product: c.product,
          quantity: c.quantity,
          name: c.name,
          category: c.category || '',
          description: c.description || '',
          price: c.price,
          image: c.image
        })),
        totalAmount
      });
      await clearCart();
      alert('Order Placed Successfully using ' + paymentMethod + '!');
      refreshProfile();
      setCheckingOut(false);
    } catch (err) {
      alert('Failed to place order from cart.');
    }
  };

  if (checkingOut) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
          <p className="font-bold text-indigo-800">Total Amount: ${totalAmount.toFixed(2)}</p>
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="font-bold text-lg text-gray-800">Step 1: Select Shipping Address</h3>
            
            {addresses.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <Info size={24} className="text-amber-500 mx-auto mb-3" />
                <h4 className="font-bold text-amber-800 mb-1">No Addresses Found</h4>
                <p className="text-sm text-amber-700 mb-4">You need to add a shipping address in your Profile before you can checkout.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition"
                >
                  Go to Addresses Tab
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map(addr => (
                  <div 
                    key={addr._id} 
                    onClick={() => setSelectedAddress(addr)}
                    className={`border-2 rounded-xl p-4 cursor-pointer relative transition-all ${selectedAddress?._id === addr._id ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 hover:border-indigo-300'}`}
                  >
                    {selectedAddress?._id === addr._id && <CheckCircle size={20} className="text-indigo-600 absolute top-4 right-4" />}
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className={selectedAddress?._id === addr._id ? 'text-indigo-600' : 'text-gray-400'} />
                      <span className="font-bold text-gray-800">{addr.type}</span>
                    </div>
                    <p className="font-medium text-gray-900 text-sm mb-1">{addr.name} ({addr.phone})</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{addr.house}, {addr.city}</p>
                    <p className="text-gray-500 text-sm">{addr.state} - {addr.postalCode}</p>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={() => setStep(2)}
              disabled={!selectedAddress}
              className="w-full bg-[#0d1b2a] text-white py-4 rounded-xl font-bold hover:bg-indigo-600 transition disabled:opacity-50 mt-4 active:scale-[0.98]"
            >
              Continue to Payment
            </button>
            <button onClick={() => setCheckingOut(false)} className="w-full text-center text-gray-500 py-2 hover:text-gray-800 font-bold mt-2">
              Cancel Checkout
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="font-bold text-lg text-gray-800">Step 2: Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Credit Card', 'Cash on Delivery', 'UPI'].map(method => (
                <div 
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`border-2 rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center transition-all ${paymentMethod === method ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                  <CreditCard className={`mb-2 ${paymentMethod === method ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm text-center">{method}</span>
                </div>
              ))}
            </div>

            {paymentMethod === 'Credit Card' && (
              <div className="bg-white border rounded-xl p-6 mt-4 shadow-sm space-y-4 animate-fadeIn">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">Card Number</label>
                  <input type="text" maxLength="19" value={ccDetails.number} onChange={e => setCcDetails({...ccDetails, number: e.target.value})} placeholder="0000 0000 0000 0000" className="w-full border border-gray-200 rounded-lg p-3 font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">Expiry (MM/YY)</label>
                    <input type="text" maxLength="5" value={ccDetails.expiry} onChange={e => setCcDetails({...ccDetails, expiry: e.target.value})} placeholder="MM/YY" className="w-full border border-gray-200 rounded-lg p-3 font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1 uppercase tracking-wider">CVV</label>
                    <input type="password" maxLength="3" value={ccDetails.cvv} onChange={e => setCcDetails({...ccDetails, cvv: e.target.value})} placeholder="123" className="w-full border border-gray-200 rounded-lg p-3 font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center mt-2 flex items-center justify-center gap-1"><Shield size={12}/> Connection is Secure & Encrypted</p>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="bg-white border-2 border-dashed border-indigo-200 rounded-xl p-6 flex flex-col items-center justify-center mt-4 bg-indigo-50/30">
                <p className="text-sm font-bold text-indigo-900 mb-4">Scan QR Code to Pay</p>
                <div className="w-48 h-48 bg-white rounded-xl shadow-sm border p-2 flex items-center justify-center">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=dummy@upi&pn=EcomStore" alt="Dummy UPI QR" className="w-full h-full opacity-90" />
                </div>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-4 text-center">We automatically verify payment upon scan</p>
              </div>
            )}

            <button 
              onClick={submitOrder}
              disabled={!paymentMethod || (paymentMethod === 'Credit Card' && (!ccDetails.number || !ccDetails.expiry || !ccDetails.cvv))}
              className="w-full bg-[#0d1b2a] text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-600 transition mt-6 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <ShoppingCart size={20} /> Place Order • ${totalAmount.toFixed(2)}
            </button>

            <button onClick={() => setStep(1)} className="w-full text-center text-gray-500 py-2 hover:text-gray-800 text-sm mt-2">
              Back to Address
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
        <button onClick={handleClear} className="text-sm text-red-500 hover:text-red-700 font-medium">
          Clear All
        </button>
      </div>
      
      <div className="space-y-4 mb-8">
        {cartItems.map((item, i) => (
          <div key={`cart-${item.product}-${i}`} className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm relative group">
            <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} className="w-24 h-24 object-contain rounded-lg bg-white p-2" />
            <div className="flex-grow text-center sm:text-left">
              <h3 className="font-bold text-gray-800 leading-tight mb-1">{item.name}</h3>
              <p className="text-indigo-600 font-extrabold">${item.price}</p>
              <p className="text-xs text-gray-500 mt-2">Qty: {item.quantity}</p>
            </div>
            <button onClick={() => handleRemove(item.product)} className="absolute top-4 right-4 sm:relative sm:top-0 sm:right-0 opacity-100 sm:opacity-50 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity" title="Remove Item">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 pt-6">
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-500 text-lg">Total Items: {cartItems.reduce((acc, i) => acc + i.quantity, 0)}</span>
          <span className="text-3xl font-black text-slate-800">${totalAmount.toFixed(2)}</span>
        </div>
        <button onClick={startCheckout} className="w-full bg-[#0d1b2a] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1b2b40] transition shadow-lg shadow-[#0d1b2a]/20 flex items-center justify-center gap-3">
          <ShoppingCart size={22} /> Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
