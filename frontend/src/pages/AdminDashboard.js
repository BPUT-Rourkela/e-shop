import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  fetchProducts, addProduct, updateProduct, deleteProduct,
  fetchAdminStats, fetchAdminOrders, updateOrderStatus,
  fetchAdminCustomers, fetchCustomerOrders,
  fetchAdminTransactions, fetchAdminAnalytics, fetchAdminReviews,
  updateReviewSentiment
} from '../api';
import {
  LayoutDashboard, Package, Users, CreditCard, ShoppingBag,
  Star, Trash2, Edit3, 
  ThumbsUp, ThumbsDown, Minus, RefreshCw,LogOut
} from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

// ========== SIDEBAR ==========
const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'transactions', label: 'Transactions', icon: CreditCard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'reviews', label: 'Reviews & Sentiment', icon: Star },
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
const OverviewTab = ({ stats, analytics }) => {
  if (!stats || !analytics) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 rounded-full border-b-2 border-indigo-600"></div></div>;
  const cards = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue?.toFixed(2) || '0.00'}`, color: 'from-indigo-500 to-purple-600' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue by Month */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Revenue by Month</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.revenueByMonth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [`₹${v.toFixed(2)}`, 'Revenue']} />
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
                <p className="text-xs text-gray-400">₹{p.price} each</p>
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
                  <td className="px-4 py-3 font-bold text-indigo-700">₹{o.totalAmount?.toFixed(2)}</td>
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
                            <span className="font-bold text-indigo-700">₹{item.product?.price}</span>
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
                <p className="text-xs text-gray-400">₹{c.totalSpend?.toFixed(2)}</p>
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
                  <span className="font-bold text-indigo-700">₹{o.totalAmount?.toFixed(2)}</span>
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
              <td className="px-4 py-3 font-bold text-indigo-700">₹{t.totalAmount?.toFixed(2)}</td>
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
              { name: 'price', placeholder: 'Price (₹)', type: 'number' },
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
              <button type="submit" className="flex-1 bg-[#0d1b2a] text-white font-bold py-3 rounded-xl hover:bg-[#1a2e47] transition text-sm">
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
                <p className="text-indigo-700 font-bold text-sm">₹{p.price}</p>
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


// ========== REVIEWS TAB ==========
const ReviewsTab = ({ reviews, setReviews }) => {
  const [groupMode, setGroupMode] = useState('flat'); // 'flat', 'product', 'user'

  const handleSentiment = async (id, sentiment) => {
    try {
      const { data } = await updateReviewSentiment(id, sentiment);
      setReviews(prev => prev.map(r => r._id === id ? data : r));
    } catch { alert('Failed to update sentiment.'); }
  };

  const positive = reviews.filter(r => r.sentiment === 'Positive').length;
  const negative = reviews.filter(r => r.sentiment === 'Negative').length;
  const neutral = reviews.filter(r => r.sentiment === 'Neutral').length;

  const groupedByProduct = useMemo(() => {
    const groups = {};
    reviews.forEach(r => {
      const pId = r.product?._id || r.product;
      const key = typeof pId === 'object' ? pId.toString() : pId;
      if (!groups[key]) {
        groups[key] = {
          product: r.product,
          reviews: [],
          counts: { Positive: 0, Negative: 0, Neutral: 0 }
        };
      }
      groups[key].reviews.push(r);
      if (groups[key].counts[r.sentiment] !== undefined) groups[key].counts[r.sentiment]++;
    });
    return Object.values(groups).sort((a, b) => b.reviews.length - a.reviews.length);
  }, [reviews]);

  const groupedByUser = useMemo(() => {
    const groups = {};
    reviews.forEach(r => {
      const uId = r.user?._id || r.user || 'anonymous';
      const key = uId.toString();
      if (!groups[key]) {
        groups[key] = {
          user: r.user,
          userName: r.user?.name || r.userName || 'Anonymous',
          reviews: [],
          counts: { Positive: 0, Negative: 0, Neutral: 0 }
        };
      }
      groups[key].reviews.push(r);
      if (groups[key].counts[r.sentiment] !== undefined) groups[key].counts[r.sentiment]++;
    });
    return Object.values(groups).sort((a, b) => b.reviews.length - a.reviews.length);
  }, [reviews]);

  const ReviewItem = ({ r }) => (
    <div key={r._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              {(r.user?.name || r.userName || '?').charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-gray-800 text-sm">{r.user?.name || r.userName}</span>
            <span className="text-yellow-500 text-xs">{'⭐'.repeat(r.rating)}</span>
            <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full">{new Date(r.createdAt).toLocaleDateString()}</span>
          </div>
          
          <div className="mb-2">
            {r.product ? (
              <Link to={`/product/${r.product?._id || r.product}`} className="group flex items-center gap-2 text-xs">
                <span className="text-gray-400">on</span>
                <span className="text-indigo-600 font-bold group-hover:underline underline-offset-2">
                  {r.product?.name || "View Product"}
                </span>
                {r.product?.image && (
                  <img src={r.product.image} alt="" className="h-5 w-5 rounded object-cover border border-gray-100 shadow-sm" />
                )}
              </Link>
            ) : (
             <span className="text-[10px] text-gray-400 italic">Product details unavailable</span>
            )}
          </div>

          <p className="text-gray-700 text-sm leading-relaxed">{r.comment}</p>
        </div>
        <div className="flex flex-col items-end gap-3 ml-4">
          <SentimentBadge sentiment={r.sentiment} />
          <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
            {['Positive', 'Neutral', 'Negative'].map(s => (
              <button
                key={s}
                onClick={() => handleSentiment(r._id, s)}
                className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all ${r.sentiment === s 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="grid grid-cols-3 gap-3 flex-grow max-w-xl">
          {[
            { label: 'Positive', val: positive, bg: 'bg-green-50', txt: 'text-green-600', border: 'border-green-100' },
            { label: 'Negative', val: negative, bg: 'bg-red-50', txt: 'text-red-600', border: 'border-red-100' },
            { label: 'Neutral', val: neutral, bg: 'bg-gray-50', txt: 'text-gray-600', border: 'border-gray-100' },
          ].map(c => (
            <div key={c.label} className={`${c.bg} ${c.border} border rounded-2xl p-3 flex items-center justify-between`}>
              <span className={`text-xs font-bold ${c.txt}`}>{c.label}</span>
              <span className={`text-xl font-black ${c.txt}`}>{c.val}</span>
            </div>
          ))}
        </div>

        <div className="flex bg-gray-100/50 p-1.5 rounded-2xl w-fit border border-gray-100">
          {[
            { id: 'flat', label: 'Flat View', icon: Star },
            { id: 'product', label: 'By Product', icon: Package },
            { id: 'user', label: 'By User', icon: Users },
          ].map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setGroupMode(m.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${groupMode === m.id 
                  ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-100' 
                  : 'text-gray-500 hover:text-gray-800'}`}
              >
                <Icon size={14} />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {groupMode === 'flat' && (
          <div className="space-y-4">
            {reviews.map(r => <ReviewItem key={r._id} r={r} />)}
            {reviews.length === 0 && <div className="text-center py-20 text-gray-400 font-medium">No reviews found yet.</div>}
          </div>
        )}

        {groupMode === 'product' && (
          <div className="grid grid-cols-1 gap-8">
            {groupedByProduct.map(group => (
              <div key={group.product?._id || group.product} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={group.product?.image || 'https://via.placeholder.com/48'} 
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100 shadow-sm" 
                      alt="" 
                    />
                    <div>
                      <h4 className="font-extrabold text-gray-900 leading-tight">
                        {group.product?.name || "Unknown Product"}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {group.reviews.length} total reviews
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['Positive', 'Negative', 'Neutral'].map(s => (
                      <div key={s} className="px-3 py-1.5 bg-gray-50 rounded-lg flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          s === 'Positive' ? 'bg-green-500' : s === 'Negative' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-[10px] font-black text-gray-700">{group.counts[s]}</span>
                      </div>
                    ))}
                    <Link 
                      to={`/product/${group.product?._id || group.product}`}
                      className="ml-2 bg-indigo-50 text-indigo-600 p-2 rounded-xl hover:bg-indigo-100 transition shadow-sm"
                    >
                      <Package size={16} />
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.reviews.map(r => <ReviewItem key={r._id} r={r} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {groupMode === 'user' && (
          <div className="grid grid-cols-1 gap-8">
            {groupedByUser.map(group => (
              <div key={group.user?._id || group.userName} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-lg font-black shadow-lg shadow-indigo-100">
                      {group.userName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 leading-tight">{group.userName}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {group.reviews.length} reviews contributed
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['Positive', 'Negative', 'Neutral'].map(s => (
                      <div key={s} className="px-3 py-1.5 bg-gray-50 rounded-lg flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          s === 'Positive' ? 'bg-green-500' : s === 'Negative' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-[10px] font-black text-gray-700">{group.counts[s]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.reviews.map(r => <ReviewItem key={r._id} r={r} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// ========== MAIN ADMIN DASHBOARD ==========
const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => setSearchParams({ tab });

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
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
      {/* Sidebar — Optimized transition for maximum smoothness */}
      <aside 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`fixed left-0 top-0 z-40 h-screen bg-[#0d1b2a] text-white flex flex-col shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${isSidebarHovered ? 'w-64' : 'w-20'}`}
      >
        <div className="p-6 border-b border-white/10 whitespace-nowrap overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center flex-shrink-0">
              <LayoutDashboard size={20} />
            </div>
            <div className={`transition-all duration-300 transform ${isSidebarHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <h1 className="text-xl font-extrabold leading-tight">Admin Portal</h1>
              <p className="text-white/50 text-[10px] mt-0.5">EcomStore Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                  ? 'bg-white/20 text-white shadow-inner' 
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex-shrink-0">
                  <Icon size={22} className={activeTab === tab.id ? 'text-teal-400' : ''} />
                </div>
                <span className={`transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id ? 'font-bold' : ''
                } ${isSidebarHovered ? 'opacity-100' : 'opacity-0'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition group/logout"
          >
            <div className="flex-shrink-0 group-hover/logout:text-red-400">
              <LogOut size={22} />
            </div>
            <span className={`transition-all duration-300 whitespace-nowrap ${isSidebarHovered ? 'opacity-100' : 'opacity-0'}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content — Shifting sync'd with sidebar transition */}
      <main className={`flex-grow p-8 pt-28 transition-all duration-300 ease-in-out overflow-auto ${isSidebarHovered ? 'ml-64' : 'ml-20'}`}>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 capitalize">
          {tabs.find(t => t.id === activeTab)?.label}
        </h2>
        {activeTab === 'overview' && <OverviewTab stats={stats} analytics={analytics} />}
        {activeTab === 'orders' && <OrdersTab orders={orders} setOrders={setOrders} />}
        {activeTab === 'customers' && <CustomersTab customers={customers} />}
        {activeTab === 'transactions' && <TransactionsTab transactions={transactions} />}
        {activeTab === 'products' && <ProductsTab products={products} setProducts={setProducts} />}
        {activeTab === 'reviews' && <ReviewsTab reviews={reviews} setReviews={setReviews} />}
      </main>
    </div>
  );
};

export default AdminDashboard;
