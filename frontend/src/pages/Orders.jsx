import React, { useEffect, useState } from 'react';
import API from '../api';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    API.get('/orders/my-orders').then(({ data }) => setOrders(data));
  }, []);

  return (
    <div className="container mx-auto p-6 pt-24">
      <h1 className="text-2xl font-bold mb-6">Your Purchase History</h1>
      {orders.map(order => (
        <div key={order._id} className="border-b py-4 flex justify-between">
          <div>
            <p className="font-semibold">Order ID: {order._id}</p>
            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-600">${order.totalAmount}</p>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{order.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders;
