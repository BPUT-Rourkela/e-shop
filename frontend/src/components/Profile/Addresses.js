import React, { useState } from 'react';
import { addAddress, updateAddress, deleteAddress } from '../../api';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase } from 'lucide-react';

const Addresses = ({ addresses, refreshProfile }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', house: '', city: '', state: '', postalCode: '', type: 'Home', isDefault: false
  });

  const handleOpenForm = (address = null) => {
    if (address) {
      setFormData(address);
      setEditingId(address._id);
    } else {
      setFormData({ name: '', phone: '', house: '', city: '', state: '', postalCode: '', type: 'Home', isDefault: false });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAddress(editingId, formData);
      } else {
        await addAddress(formData);
      }
      setShowForm(false);
      refreshProfile();
    } catch (err) {
      alert("Error saving address");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(id);
        refreshProfile();
      } catch (err) {
        alert("Error deleting address");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Manage Addresses</h3>
        <button 
          onClick={() => handleOpenForm()} 
          className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 transition-colors"
        >
          <Plus size={18} /> Add New
        </button>
      </div>

      {showForm ? (
        <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
          <h4 className="text-xl font-bold mb-4">{editingId ? 'Edit Address' : 'Add New Address'}</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200" />
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200" />
            <input type="text" name="house" value={formData.house} onChange={handleChange} placeholder="House / Street / Area" required className="w-full px-4 py-3 rounded-xl border border-gray-200 md:col-span-2 focus:ring-2 focus:ring-indigo-200" />
            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200" />
            <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200" />
            <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal Code" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200" />
            <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200">
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
            </select>
            <div className="md:col-span-2 flex items-center gap-3">
              <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded" />
              <label>Set as default address</label>
            </div>
            <div className="md:col-span-2 flex gap-3 mt-4">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700">Save Address</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.length === 0 && !showForm ? (
          <div className="col-span-2 text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <p>No addresses saved yet.</p>
          </div>
        ) : (
          addresses.map(addr => (
            <div key={addr._id} className="border border-gray-200 rounded-2xl p-5 hover:border-indigo-300 transition-colors relative bg-white">
              {addr.isDefault && (
                <span className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">Default</span>
              )}
              <div className="flex items-center gap-3 mb-3 text-indigo-600">
                {addr.type === 'Office' ? <Briefcase size={20} /> : <Home size={20} />}
                <h4 className="font-bold text-gray-900">{addr.name}</h4>
              </div>
              <p className="text-gray-600 text-sm mb-1">{addr.house}</p>
              <p className="text-gray-600 text-sm mb-1">{addr.city}, {addr.state} {addr.postalCode}</p>
              <p className="text-gray-600 text-sm mb-4">Phone: {addr.phone}</p>
              
              <div className="flex gap-2 border-t border-gray-100 pt-4 mt-2">
                <button onClick={() => handleOpenForm(addr)} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1"><Edit2 size={16} /> Edit</button>
                <button onClick={() => handleDelete(addr._id)} className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1 ml-auto"><Trash2 size={16} /> Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Addresses;
