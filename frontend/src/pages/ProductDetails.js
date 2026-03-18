import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchProductById, createOrder, fetchProductReviews, addReview, addToCart, getUserProfile } from '../api';
import { ShoppingCart, Star, StarHalf, Truck, Shield, Award, ArrowLeft, Send, TrendingUp, CreditCard, X, MapPin, Zap, CheckCircle, Info } from 'lucide-react';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedProduct = location.state;

  const [product, setProduct] = useState(passedProduct || null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(!passedProduct);
  const [buying, setBuying] = useState(false);

  // Single Item Checkout Modal
  const [checkoutStep, setCheckoutStep] = useState(0); // 0 = closed, 1 = address, 2 = payment
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [ccDetails, setCcDetails] = useState({ number: '', expiry: '', cvv: '' });

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // If we didn't get the product from location.state, try to fetch it
        if (!passedProduct) {
          try {
            const prodRes = await fetchProductById(id);
            setProduct(prodRes.data);
          } catch (e) {
            console.log("Could not fetch product locally. Might be ML only.");
          }
        }
        
        // For ML ASINs, the reviews fetch will return 500 if the backend strict ObjectId check fails.
        // We gracefully catch it and set reviews to empty array.
        try {
          const revRes = await fetchProductReviews(id);
          setReviews(revRes.data || []);
        } catch (e) {
          console.log("No reviews found for this item (or not locally stored).");
          setReviews([]);
        }

      } catch (err) {
        console.error("Error loading product details:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, passedProduct]);

  const handleAddToCartOnly = async () => {
    if (!localStorage.getItem('token')) {
      alert('Please login to add to cart');
      navigate('/login');
      return;
    }
    setBuying(true);
    try {
      await addToCart({ 
        product: product._id, 
        quantity: 1,
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        image: product.image
      });
      alert('Product added to your Cart! You can view it in your Profile.');
    } catch (err) {
      alert('Failed to add to cart');
    } finally {
      setBuying(false);
    }
  };

  const handleBuyNowStart = async () => {
    if (!localStorage.getItem('token')) {
      alert('Please login to buy products');
      navigate('/login');
      return;
    }
    setBuying(true);
    try {
      const { data } = await getUserProfile();
      setAddresses(data.addresses || []);
      setCheckoutStep(1);
      setSelectedAddress(null);
      setPaymentMethod('');
    } catch (err) {
      alert('Failed to load profile for checkout.');
    } finally {
      setBuying(false);
    }
  };

  const submitSingleOrder = async () => {
    setBuying(true);
    try {
      await createOrder({ 
        products: [{ 
          product: product._id, 
          quantity: 1,
          name: product.name,
          category: product.category,
          description: product.description,
          price: product.price,
          image: product.image
        }], 
        totalAmount: product.price 
      });
      alert(`Order placed successfully using ${paymentMethod}!`);
      setCheckoutStep(0);
    } catch (err) {
      alert('Failed to place order');
    } finally {
      setBuying(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      alert('Please login to leave a review');
      navigate('/login');
      return;
    }
    setSubmittingReview(true);
    try {
      await addReview({ productId: product._id, rating, comment });
      alert('Review submitted successfully!');
      setComment('');
      setRating(5);
      // Reload reviews
      const revRes = await fetchProductReviews(id);
      setReviews(revRes.data || []);
    } catch (err) {
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (ratingValue) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(<Star key={i} size={16} fill="currentColor" className="text-yellow-400" />);
      } else if (i - 0.5 === ratingValue) {
        stars.push(<StarHalf key={i} size={16} fill="currentColor" className="text-yellow-400" />);
      } else {
        stars.push(<Star key={i} size={16} className="text-gray-200" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
        <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-2">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20">
      
      {/* ── Breadcrumb & Back ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button onClick={() => navigate(-1)} className="text-sm font-semibold text-gray-500 hover:text-indigo-600 transition flex items-center gap-2 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Shopping
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* ── Left Column: Image Area ── */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-[2rem] p-10 flex items-center justify-center border border-gray-100 shadow-sm relative aspect-square overflow-hidden group">
            <div className="absolute top-6 left-6 bg-slate-100 text-slate-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
              {product.category}
            </div>
            {product.isTrending && (
              <div className="absolute top-6 right-6 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10 flex items-center gap-1">
                <TrendingUp size={12} /> Trending
              </div>
            )}
            <img 
              src={product.image || FALLBACK_IMG} 
              alt={product.name}
              onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Quick feature highlights mapped from hero */}
            <div className="bg-indigo-50/50 border border-indigo-100/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
              <Truck size={20} className="text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-900">Fast Delivery</span>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-100/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
              <Shield size={20} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-900">Secure Pay</span>
            </div>
            <div className="bg-amber-50/50 border border-amber-100/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
              <Award size={20} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-900">Guaranteed</span>
            </div>
          </div>
        </div>

        {/* ── Right Column: Details ── */}
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {renderStars(avgRating)}
            </div>
            <span className="text-sm font-bold text-gray-700">{avgRating} <span className="text-gray-400 font-medium">({reviews.length} reviews)</span></span>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">In Stock</span>
          </div>

          <div className="text-5xl font-black text-indigo-600 mb-8 tracking-tighter">
            ${product.price}
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">About this item</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description || "No description available for this product."}
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-auto">
            <button 
              onClick={handleAddToCartOnly}
              disabled={buying}
              className="w-full bg-indigo-50 text-indigo-700 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-100 transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed border-2 border-indigo-100 uppercase tracking-wide"
            >
              {buying ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-700"></div> : <><ShoppingCart size={22} /> Add to Cart</>}
            </button>
            
            <button 
              onClick={handleBuyNowStart}
              className="w-full bg-[#0d1b2a] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#1a2d42] transition-all shadow-lg shadow-[#0d1b2a]/20 flex items-center justify-center gap-3 active:scale-[0.98] uppercase tracking-wide"
            >
              <Zap size={22} /> Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* ── Checkout Modal Overlay ── */}
      {checkoutStep > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center border-b border-gray-100">
              <h3 className="font-extrabold text-xl text-gray-900">Secure Checkout</h3>
              <button onClick={() => setCheckoutStep(0)} className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <img src={product.image || FALLBACK_IMG} alt="" className="w-16 h-16 object-contain mix-blend-multiply bg-white rounded-xl p-1" />
                <div className="flex-grow">
                  <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{product.name}</h4>
                  <p className="text-xl font-black text-indigo-600">${product.price}</p>
                </div>
              </div>

              {checkoutStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2"><MapPin size={18} className="text-indigo-500"/> Select Shipping Address</h4>
                  
                  {addresses.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center mt-2">
                      <Info size={24} className="text-amber-500 mx-auto mb-3" />
                      <h4 className="font-bold text-amber-800 mb-1">No Addresses Found</h4>
                      <p className="text-sm text-amber-700 mb-4">You need to save a shipping address in your Profile before ordering.</p>
                      <button 
                        onClick={() => navigate('/profile?tab=addresses')} 
                        className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition"
                      >
                        Go to Profile
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 pr-2 max-h-48 overflow-y-auto">
                      {addresses.map(addr => (
                        <div 
                          key={addr._id} 
                          onClick={() => setSelectedAddress(addr)}
                          className={`border-2 rounded-xl p-3 cursor-pointer relative transition-all ${selectedAddress?._id === addr._id ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 hover:border-indigo-300'}`}
                        >
                          {selectedAddress?._id === addr._id && <CheckCircle size={18} className="text-indigo-600 absolute top-3 right-3" />}
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin size={14} className={selectedAddress?._id === addr._id ? 'text-indigo-600' : 'text-gray-400'} />
                            <span className="font-bold text-gray-800 text-sm">{addr.type}</span>
                          </div>
                          <p className="font-medium text-gray-900 text-xs truncate">{addr.name}</p>
                          <p className="text-gray-500 text-[11px] leading-relaxed truncate">{addr.house}, {addr.city}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={() => setCheckoutStep(2)}
                    disabled={!selectedAddress}
                    className="w-full bg-[#0d1b2a] text-white py-4 rounded-xl font-bold hover:bg-indigo-600 transition disabled:opacity-50 mt-4 active:scale-[0.98]"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {checkoutStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2"><CreditCard size={18} className="text-indigo-500"/> Select Payment Method</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Credit Card', 'Cash on Delivery', 'UPI'].map(method => (
                      <div 
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`border-2 rounded-xl p-3 cursor-pointer flex flex-col items-center justify-center transition-all ${paymentMethod === method ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-gray-200 hover:border-indigo-300 text-gray-600 hover:bg-gray-50'}`}
                      >
                        <CreditCard className={`mb-2 ${paymentMethod === method ? 'text-indigo-600' : 'text-gray-400'}`} size={24} />
                        <span className="font-bold text-xs text-center">{method}</span>
                      </div>
                    ))}
                  </div>

                  {paymentMethod === 'Credit Card' && (
                    <div className="bg-white border rounded-xl p-5 mt-4 shadow-sm space-y-3 animate-fadeIn">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">Card Number</label>
                        <input type="text" maxLength="19" value={ccDetails.number} onChange={e => setCcDetails({...ccDetails, number: e.target.value})} placeholder="0000 0000 0000 0000" className="w-full border border-gray-200 rounded-lg p-3 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">Expiry (MM/YY)</label>
                          <input type="text" maxLength="5" value={ccDetails.expiry} onChange={e => setCcDetails({...ccDetails, expiry: e.target.value})} placeholder="MM/YY" className="w-full border border-gray-200 rounded-lg p-3 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">CVV</label>
                          <input type="password" maxLength="3" value={ccDetails.cvv} onChange={e => setCcDetails({...ccDetails, cvv: e.target.value})} placeholder="123" className="w-full border border-gray-200 rounded-lg p-3 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center mt-2 flex items-center justify-center gap-1"><Shield size={10}/> Security Encrypted</p>
                    </div>
                  )}

                  {paymentMethod === 'UPI' && (
                    <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-6 flex flex-col items-center justify-center mt-2 bg-indigo-50/30">
                      <p className="text-sm font-bold text-indigo-900 mb-3">Scan QR Code to Pay</p>
                      <div className="w-40 h-40 bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center p-2 mb-2">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=dummy@upi&pn=EcomStore" alt="Dummy UPI QR" className="w-full h-full opacity-90" />
                      </div>
                      <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">Safe & Secure</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-8">
                    <button onClick={() => setCheckoutStep(1)} className="w-1/3 text-gray-500 font-bold py-4 rounded-xl hover:bg-gray-100 transition active:scale-[0.98]">
                      Back
                    </button>
                    <button 
                      onClick={submitSingleOrder}
                      disabled={!paymentMethod || buying || (paymentMethod === 'Credit Card' && (!ccDetails.number || !ccDetails.expiry || !ccDetails.cvv))}
                      className="w-2/3 bg-[#0d1b2a] text-white py-4 rounded-xl font-bold hover:bg-indigo-600 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
                    >
                      {buying ? 'Processing...' : `Confirm & Pay $${product.price}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Reviews Section ── */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Star size={24} className="text-indigo-500" fill="currentColor" /> 
            Customer Reviews
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* Left: Review Form */}
            <div className="md:col-span-5 bg-gray-50 rounded-3xl p-8 h-fit">
              <h3 className="text-lg font-bold text-gray-800 mb-6 w-full pb-4 border-b border-gray-200">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star size={26} className={star <= rating ? "text-yellow-400" : "text-gray-300"} fill={star <= rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Your Experience</label>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows="4"
                    placeholder="What did you like or dislike? What did you use this product for?"
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none font-medium text-gray-800 placeholder-gray-400"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submittingReview}
                  className="bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {submittingReview ? 'Submitting...' : <><Send size={18} /> Submit Review</>}
                </button>
              </form>
            </div>

            {/* Right: Reviews List */}
            <div className="md:col-span-7 flex flex-col gap-6">
              {reviews.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-6 border-2 border-dashed border-gray-100 rounded-3xl">
                  <div className="bg-indigo-50 text-indigo-400 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Star size={28} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-800 mb-1">No reviews yet</h4>
                  <p className="text-gray-500 text-sm max-w-[250px]">Be the first to share your thoughts and help other shoppers make informed decisions.</p>
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review._id} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{review.userName}</p>
                          <p className="text-xs text-gray-400 font-medium">{new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric'})}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg border border-yellow-100/50">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ProductDetails;
