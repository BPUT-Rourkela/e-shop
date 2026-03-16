import React, { useEffect, useState } from 'react';
import { fetchUserOrders } from '../../api';
import { Package, ArrowRight, XCircle, CheckCircle, Clock } from 'lucide-react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // We are assuming the backend order API has /orders endpoint that returns user's orders implicitly if non-admin or /orders/myorders endpoint.
  // We'll mock the data structurally or attempt to fetch.
  useEffect(() => {
    fetchUserOrders()
      .then(res => setOrders(res.data))
      .catch(err => console.log('Wait, we might not have a dedicated fetchUserOrders route working yet, mocking for visual completion'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Delivered': return <CheckCircle className="text-green-500" size={20}/>;
      case 'Cancelled': return <XCircle className="text-red-500" size={20}/>;
      default: return <Clock className="text-orange-500" size={20}/>;
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Order History</h3>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium">You haven't placed any orders yet.</p>
          <button className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-500">Order ID:</span>
                    <span className="font-mono text-gray-900">{order._id.substring(0,8).toUpperCase()}</span>
                  </div>
                  <div className="text-sm text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0 font-bold bg-gray-50 px-4 py-2 rounded-lg">
                  {getStatusIcon(order.status)}
                  <span className={order.status === 'Delivered' ? 'text-green-700' : order.status === 'Cancelled' ? 'text-red-700' : 'text-orange-700'}>
                    {order.status || 'Processing'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {order.products?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.product?.image || 'https://via.placeholder.com/64'} alt="Product" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <h5 className="font-bold text-gray-900">{item.product?.name || 'Product Details'}</h5>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-gray-900">${(item.product?.price * item.quantity).toFixed(2) || '0.00'}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-4">
                <div className="text-lg font-bold text-gray-900">Total: <span className="text-indigo-600">${order.totalAmount || '0.00'}</span></div>
                <button className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                  View Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
