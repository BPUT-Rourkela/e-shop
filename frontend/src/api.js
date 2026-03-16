import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

// Automatically add the JWT token to headers if it exists
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = localStorage.getItem('token');
  }
  return req;
});

export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const fetchProducts = () => API.get('/products');
export const addProduct = (data) => API.post('/products/add', data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const createOrder = (data) => API.post('/orders', data);
export const fetchUserOrders = () => API.get('/orders/myorders'); // Assuming this exists or we can use generic orders

// User Profile Endpoints
export const getUserProfile = () => API.get('/users/profile');
export const updateUserProfile = (data) => API.put('/users/profile', data);
export const addAddress = (data) => API.post('/users/addresses', data);
export const updateAddress = (id, data) => API.put(`/users/addresses/${id}`, data);
export const deleteAddress = (id) => API.delete(`/users/addresses/${id}`);
export const toggleWishlist = (productId) => API.post('/users/wishlist/toggle', { productId });
export const addPaymentMethod = (data) => API.post('/users/payment-methods', data);
export const deletePaymentMethod = (id) => API.delete(`/users/payment-methods/${id}`);

export default API;
