import React, { useState } from 'react';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { addPaymentMethod, deletePaymentMethod } from '../../api';

const PaymentMethods = ({ paymentMethods, refreshProfile }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ type: 'Card', details: '', isDefault: false });

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addPaymentMethod(formData);
      setShowForm(false);
      setFormData({ type: 'Card', details: '', isDefault: false });
      refreshProfile();
    } catch (err) {
      alert("Failed to add payment method");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Remove this payment method?")) {
      try {
        await deletePaymentMethod(id);
        refreshProfile();
      } catch (err) {
        alert("Action failed");
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Saved Payment Methods</h3>
        <button 
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 transition-colors"
        >
          <Plus size={18} /> Add New
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
          <form onSubmit={handleAdd} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select 
                value={formData.type} 
                onChange={(e) => setFormData({...formData, type: e.target.value})} 
                className="w-full p-3 rounded-xl border border-gray-200"
              >
                <option value="Card">Credit/Debit Card</option>
                <option value="UPI">UPI ID</option>
                <option value="NetBanking">Net Banking</option>
                <option value="Wallet">Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Details (Masked Info / ID)</label>
              <input 
                type="text" 
                value={formData.details} 
                onChange={(e) => setFormData({...formData, details: e.target.value})} 
                placeholder="e.g. Visa ending in 4242 or user@upi" 
                required 
                className="w-full p-3 rounded-xl border border-gray-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={formData.isDefault} 
                onChange={(e) => setFormData({...formData, isDefault: e.target.checked})} 
                className="w-5 h-5 text-indigo-600 rounded" 
              />
              <label>Set as default</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {paymentMethods.length === 0 && !showForm ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
          <p>No payment methods saved.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map(pm => (
            <div key={pm._id} className="flex justify-between items-center border border-gray-200 rounded-2xl p-5 bg-white">
              <div className="flex items-center gap-4">
                <div className="h-12 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-indigo-500 font-bold border border-gray-200">
                  {pm.type === 'Card' && 'VISA'}
                  {pm.type !== 'Card' && pm.type}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{pm.type}</h4>
                  <p className="text-gray-500 text-sm font-mono">{pm.details}</p>
                </div>
                {pm.isDefault && <span className="ml-4 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Primary</span>}
              </div>
              <button onClick={() => handleDelete(pm._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
