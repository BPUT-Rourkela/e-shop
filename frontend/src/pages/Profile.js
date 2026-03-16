import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Package, Heart, CreditCard, LogOut } from 'lucide-react';
import PersonalInfo from '../components/Profile/PersonalInfo';
import Addresses from '../components/Profile/Addresses';
import MyOrders from '../components/Profile/MyOrders';
import Wishlist from '../components/Profile/Wishlist';
import PaymentMethods from '../components/Profile/PaymentMethods';
import { getUserProfile } from '../api';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await getUserProfile();
      setProfileData(data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  if (!profileData) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-80px)]">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 flex flex-col items-center">
              <div className="h-20 w-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold mb-4 overflow-hidden shadow-inner">
                {profileData.profilePicture ? (
                  <img src={profileData.profilePicture} alt={profileData.name} className="h-full w-full object-cover" />
                ) : (
                  profileData.name.charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="text-lg font-bold text-gray-900 text-center">{profileData.name}</h2>
              <p className="text-sm text-gray-500 text-center truncate w-full">{profileData.email}</p>
            </div>
            
            <nav className="flex flex-col p-2 space-y-1">
              <button onClick={() => setActiveTab('personal')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'personal' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <User size={18} /> Personal Information
              </button>
              <button onClick={() => setActiveTab('addresses')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'addresses' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <MapPin size={18} /> Addresses
              </button>
              <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Package size={18} /> My Orders
              </button>
              <button onClick={() => setActiveTab('wishlist')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'wishlist' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Heart size={18} /> Wishlist
              </button>
              <button onClick={() => setActiveTab('payments')} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'payments' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <CreditCard size={18} /> Payment Methods
              </button>
              <div className="border-t border-gray-100 my-2"></div>
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={18} /> Log Out
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
          {activeTab === 'personal' && <PersonalInfo profile={profileData} refreshProfile={fetchProfile} />}
          {activeTab === 'addresses' && <Addresses addresses={profileData.addresses || []} refreshProfile={fetchProfile} />}
          {activeTab === 'orders' && <MyOrders />}
          {activeTab === 'wishlist' && <Wishlist wishlist={profileData.wishlist || []} refreshProfile={fetchProfile} />}
          {activeTab === 'payments' && <PaymentMethods paymentMethods={profileData.paymentMethods || []} refreshProfile={fetchProfile} />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
