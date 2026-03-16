import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  fetchProducts, addProduct, updateProduct, deleteProduct,
  toggleTrending, toggleRecommended,
  fetchAdminStats, fetchAdminOrders, updateOrderStatus,
  fetchAdminCustomers, fetchCustomerOrders,
  fetchAdminTransactions, fetchAdminAnalytics, fetchAdminReviews,
  updateReviewSentiment
} from '../api';
import {
  LayoutDashboard, Package, Users, CreditCard, ShoppingBag,
  TrendingUp, Star, BarChart2, Trash2, Edit3, Check, X,
  ThumbsUp, ThumbsDown, Minus, RefreshCw,LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

// ========== SIDEBAR ==========
const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: CreditCard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'recommendations', label: 'Recommendations', icon: TrendingUp },
  { id: 'reviews', label: 'Reviews & Sentiment', icon: Star },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

const StatusBadge = ({ status }) => {
  const colors = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Processing: 'bg-blue-100 text-blue-700',
    Shipped: 'bg-indigo-100 text-indigo-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

const SentimentBadge = ({ sentiment }) => {
  const map = {
    Positive: { color: 'bg-green-100 text-green-700', icon: <ThumbsUp size={12} /> },
    Negative: { color: 'bg-red-100 text-red-700', icon: <ThumbsDown size={12} /> },
    Neutral: { color: 'bg-gray-100 text-gray-600', icon: <Minus size={12} /> },
    Pending: { color: 'bg-yellow-100 text-yellow-700', icon: <RefreshCw size={12} /> },
  };
  const s = map[sentiment] || map.Pending;
  return <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${s.color}`}>{s.icon}{sentiment}</span>;
};

// ========== OVERVIEW TAB ==========
const OverviewTab = ({ stats }) => {
  if (!stats) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-indigo-600"></div></div>;
  const cards = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue?.toFixed(2) || '0.00'}`, color: 'from-indigo-500 to-purple-600' },
    { label: 'Total Orders', value: stats.totalOrders || 0, color: 'from-teal-500 to-emerald-600' },
    { label: 'Customers', value: stats.totalUsers || 0, color: 'from-amber-500 to-orange-600' },
    { label: 'Products', value: stats.totalProducts || 0, color: 'from-pink-500 to-rose-600' },
  ];
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-6 text-white shadow-lg`}>
            <p className="text-white/70 text-sm font-medium mb-1">{c.label}</p>
            <p className="text-3xl font-extrabold">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg text-gray-800 mb-6">Revenue (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={stats.salesByDay || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Fallback AreaChart using LineChart
const AreaChart = ({ data, children, ...rest }) => <LineChart data={data} {...rest}>{children}</LineChart>;

// ========== ORDERS TAB ==========
const OrdersTab = ({ orders, setOrders }) => {
  const [expandedId, setExpandedId] = useState(null);
  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o._id === id ? data : o));
    } catch { alert('Failed to update status'); }
  };
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">All Orders ({orders.length})</h2>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              {['Order ID', 'Customer', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {orders.map(o => (
              <React.Fragment key={o._id}>
                <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedId(expandedId === o._id ? null : o._id)}>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{o._id?.slice(-8)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{o.user?.name || 'N/A'}</div>
                    <div className="text-gray-400 text-xs">{o.user?.email}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-indigo-700">${o.totalAmount?.toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.status}
                      onChange={(e) => { e.stopPropagation(); handleStatusChange(o._id, e.target.value); }}
                      className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      onClick={e => e.stopPropagation()}
                    >
                      {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
                {expandedId === o._id && (
                  <tr>
                    <td colSpan="6" className="px-4 py-3 bg-indigo-50">
                      <div className="space-y-2">
                        {o.products?.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <img src={item.product?.image || 'https://via.placeholder.com/40'} alt="" className="h-10 w-10 rounded-lg object-cover" />
                            <span className="font-medium">{item.product?.name}</span>
                            <span className="text-gray-500">x{item.quantity}</span>
                            <span className="font-bold text-indigo-700">${item.product?.price}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========== CUSTOMERS TAB ==========
const CustomersTab = ({ customers }) => {
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const loadHistory = async (id) => {
    setSelected(id);
    try { const { data } = await fetchCustomerOrders(id); setHistory(data); } catch { setHistory([]); }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <div className="md:col-span-2 space-y-3">
        <h2 className="font-bold text-xl text-gray-800">Customers ({customers.length})</h2>
        {customers.map(c => (
          <div
            key={c._id}
            onClick={() => loadHistory(c._id)}
            className={`p-4 rounded-xl cursor-pointer border transition ${selected === c._id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-white hover:border-indigo-200'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                {c.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400">{c.email}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs font-bold text-indigo-600">{c.orderCount} orders</p>
                <p className="text-xs text-gray-400">${c.totalSpend?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="md:col-span-3">
        {selected ? (
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-4">Purchase History</h3>
            {history.length === 0 ? (
              <p className="text-gray-400 text-sm">No orders yet.</p>
            ) : history.map(o => (
              <div key={o._id} className="bg-white rounded-xl border border-gray-100 p-4 mb-3 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-xs text-gray-400">#{o._id?.slice(-8)}</span>
                  <StatusBadge status={o.status} />
                  <span className="font-bold text-indigo-700">${o.totalAmount?.toFixed(2)}</span>
                  <span className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
                {o.products?.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{item.product?.name}</span>
                    <span className="text-gray-400">x{item.quantity}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 pt-16">
            <Users size={48} className="mb-3 opacity-30" />
            <p>Select a customer to view their purchase history</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ========== TRANSACTIONS TAB ==========
const TransactionsTab = ({ transactions }) => (
  <div>
    <h2 className="text-xl font-bold text-gray-800 mb-6">Transactions ({transactions.length})</h2>
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm bg-white">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
          <tr>
            {['Transaction ID', 'Customer', 'Amount', 'Method', 'Status', 'Date'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.map(t => (
            <tr key={t._id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs text-gray-400">{t._id?.slice(-8)}</td>
              <td className="px-4 py-3">
                <div className="font-medium">{t.user?.name || 'N/A'}</div>
                <div className="text-xs text-gray-400">{t.user?.email}</div>
              </td>
              <td className="px-4 py-3 font-bold text-indigo-700">${t.totalAmount?.toFixed(2)}</td>
              <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">{t.paymentMethod}</span></td>
              <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-3 text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ========== PRODUCTS TAB ==========
const ProductsTab = ({ products, setProducts }) => {
  const emptyForm = { name: '', description: '', price: '', category: '', image: '' };
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { data } = await updateProduct(editId, form);
        setProducts(prev => prev.map(p => p._id === editId ? data : p));
        setEditId(null);
      } else {
        const { data } = await addProduct(form);
        setProducts(prev => [data, ...prev]);
      }
      setForm(emptyForm);
      alert(editId ? 'Product updated!' : 'Product added!');
    } catch { alert('Failed. Make sure you have admin rights.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await deleteProduct(id); setProducts(prev => prev.filter(p => p._id !== id)); } catch { alert('Failed to delete.'); }
  };

  const handleEdit = (product) => {
    setForm({ name: product.name, description: product.description, price: product.price, category: product.category, image: product.image || '' });
    setEditId(product._id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-lg text-gray-800 mb-5">{editId ? 'Edit Product' : 'Add New Product'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name', placeholder: 'Product Name' },
              { name: 'category', placeholder: 'Category' },
              { name: 'price', placeholder: 'Price ($)', type: 'number' },
              { name: 'image', placeholder: 'Image URL (optional)' },
            ].map(f => (
              <input key={f.name} type={f.type || 'text'} name={f.name} placeholder={f.placeholder}
                value={form[f.name]} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
                required={f.name !== 'image'}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
              />
            ))}
            <textarea name="description" placeholder="Description" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} required rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm"
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition text-sm">
                {editId ? 'Update' : 'Add Product'}
              </button>
              {editId && (
                <button type="button" onClick={() => { setEditId(null); setForm(emptyForm); }}
                  className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm text-gray-600">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <div className="lg:col-span-2">
        <h3 className="font-bold text-lg text-gray-800 mb-4">Product List ({products.length})</h3>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {products.map(p => (
            <div key={p._id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition">
              <img src={p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=60&q=80'} alt={p.name} className="h-14 w-14 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-grow min-w-0">
                <p className="font-bold text-gray-800 truncate">{p.name}</p>
                <p className="text-indigo-700 font-bold text-sm">${p.price}</p>
                <p className="text-xs text-gray-400">{p.category} • {p.purchaseCount || 0} sold</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit"><Edit3 size={16} /></button>
                <button onClick={() => handleDelete(p._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========== RECOMMENDATIONS TAB ==========
const RecommendationsTab = ({ products, setProducts }) => {
  const handleToggle = async (id, type) => {
    try {
      const fn = type === 'trending' ? toggleTrending : toggleRecommended;
      const { data } = await fn(id);
      setProducts(prev => prev.map(p => p._id === id ? { ...p, [type === 'trending' ? 'isTrending' : 'isRecommended']: data[type === 'trending' ? 'isTrending' : 'isRecommended'] } : p));
    } catch { alert('Failed to update.'); }
  };

  const ToggleBtn = ({ active, onClick, label, color }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${active ? `bg-${color}-100 text-${color}-700 border border-${color}-300` : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'}`}
    >
      {active ? <Check size={12} /> : <X size={12} />}
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Recommendation Control</h2>
        <p className="text-sm text-gray-400">Toggle which products appear in Trending & Recommended sections on the homepage</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p._id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-start gap-4">
            <img src={p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=60&q=80'} alt={p.name} className="h-16 w-16 rounded-xl object-cover flex-shrink-0" />
            <div className="flex-grow min-w-0">
              <p className="font-bold text-gray-800 text-sm truncate">{p.name}</p>
              <p className="text-gray-400 text-xs mb-3">${p.price} • {p.purchaseCount || 0} sold</p>
              <div className="flex flex-col gap-2">
                <ToggleBtn
                  active={p.isTrending}
                  onClick={() => handleToggle(p._id, 'trending')}
                  label={p.isTrending ? '🔥 Trending' : '+ Set Trending'}
                  color="red"
                />
                <ToggleBtn
                  active={p.isRecommended}
                  onClick={() => handleToggle(p._id, 'recommended')}
                  label={p.isRecommended ? '⭐ Recommended' : '+ Set Recommended'}
                  color="amber"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========== REVIEWS TAB ==========
const ReviewsTab = ({ reviews, setReviews }) => {
  const handleSentiment = async (id, sentiment) => {
    try {
      const { data } = await updateReviewSentiment(id, sentiment);
      setReviews(prev => prev.map(r => r._id === id ? data : r));
    } catch { alert('Failed to update sentiment.'); }
  };
  const positive = reviews.filter(r => r.sentiment === 'Positive').length;
  const negative = reviews.filter(r => r.sentiment === 'Negative').length;
  const neutral = reviews.filter(r => r.sentiment === 'Neutral').length;

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{positive}</p>
          <p className="text-sm font-medium text-green-700">Positive</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{negative}</p>
          <p className="text-sm font-medium text-red-700">Negative</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-600">{neutral}</p>
          <p className="text-sm font-medium text-gray-700">Neutral</p>
        </div>
      </div>
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {reviews.map(r => (
          <div key={r._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800">{r.user?.name || r.userName}</span>
                  <span className="text-yellow-500 text-sm">{'⭐'.repeat(r.rating)}</span>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{r.product?.name && <span className="text-indigo-600 font-medium">re: {r.product.name}</span>}</p>
                <p className="text-gray-700 text-sm">{r.comment}</p>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <SentimentBadge sentiment={r.sentiment} />
                <div className="flex gap-1">
                  {['Positive', 'Neutral', 'Negative'].map(s => (
                    <button
                      key={s}
                      onClick={() => handleSentiment(r._id, s)}
                      className={`text-xs px-2 py-1 rounded-lg border transition ${r.sentiment === s ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-gray-400 text-center py-12">No reviews yet.</p>}
      </div>
    </div>
  );
};

// ========== ANALYTICS TAB ==========
const AnalyticsTab = ({ analytics }) => {
  if (!analytics) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-indigo-600"></div></div>;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue by Month */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Revenue by Month</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.revenueByMonth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={analytics.categoryStats || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                {(analytics.categoryStats || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-6">🏆 Top Selling Products</h3>
        <div className="space-y-4">
          {(analytics.topProducts || []).map((p, i) => (
            <div key={p._id} className="flex items-center gap-4">
              <span className="w-6 text-sm font-bold text-gray-400">#{i + 1}</span>
              <img src={p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=40'} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
              <span className="flex-grow font-medium text-gray-800">{p.name}</span>
              <div className="text-right">
                <p className="font-bold text-indigo-700">{p.totalSold} sold</p>
                <p className="text-xs text-gray-400">${p.price} each</p>
              </div>
              <div className="w-32 bg-gray-100 rounded-full h-2">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(100, (p.totalSold / (analytics.topProducts[0]?.totalSold || 1)) * 100)}%` }} />
              </div>
            </div>
          ))}
          {(!analytics.topProducts || analytics.topProducts.length === 0) && <p className="text-gray-400 text-center py-8">No sales data yet.</p>}
        </div>
      </div>
    </div>
  );
};

// ========== MAIN ADMIN DASHBOARD ==========
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, ordersRes, cuRes, txRes, prRes, anRes, revRes] = await Promise.all([
          fetchAdminStats(), fetchAdminOrders(), fetchAdminCustomers(),
          fetchAdminTransactions(), fetchProducts(), fetchAdminAnalytics(), fetchAdminReviews()
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data);
        setCustomers(cuRes.data);
        setTransactions(txRes.data);
        setProducts(prRes.data);
        setAnalytics(anRes.data);
        setReviews(revRes.data);
      } catch (err) {
        console.error('Admin data load failed:', err);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-indigo-900 to-purple-900 text-white flex flex-col shadow-2xl flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-extrabold">Admin Portal</h1>
          <p className="text-white/50 text-xs mt-1">EcomStore Management</p>
        </div>
        <nav className="flex-grow p-4 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white/20 text-white shadow-inner' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 capitalize">
          {tabs.find(t => t.id === activeTab)?.label}
        </h2>
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'orders' && <OrdersTab orders={orders} setOrders={setOrders} />}
        {activeTab === 'customers' && <CustomersTab customers={customers} />}
        {activeTab === 'transactions' && <TransactionsTab transactions={transactions} />}
        {activeTab === 'products' && <ProductsTab products={products} setProducts={setProducts} />}
        {activeTab === 'recommendations' && <RecommendationsTab products={products} setProducts={setProducts} />}
        {activeTab === 'reviews' && <ReviewsTab reviews={reviews} setReviews={setReviews} />}
        {activeTab === 'analytics' && <AnalyticsTab analytics={analytics} />}
      </main>
    </div>
  );
};

export default AdminDashboard;
