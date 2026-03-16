import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

// Automatically add the JWT token to headers if it exists
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = localStorage.getItem('token');
  }
  return req;
});

// ---- AUTH ----
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);

// ---- PRODUCTS ----
export const fetchProducts = () => API.get('/products');
export const fetchTrendingProducts = () => API.get('/products/trending');
export const fetchRecommendedProducts = () => API.get('/products/recommended');
export const addProduct = (data) => API.post('/products/add', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const toggleTrending = (id) => API.patch(`/products/${id}/trending`);
export const toggleRecommended = (id) => API.patch(`/products/${id}/recommended`);

// ---- ORDERS ----
export const createOrder = (data) => API.post('/orders', data);
export const fetchUserOrders = () => API.get('/orders/myorders');

// ---- USER PROFILE ----
export const getUserProfile = () => API.get('/users/profile');
export const updateUserProfile = (data) => API.put('/users/profile', data);
export const addAddress = (data) => API.post('/users/addresses', data);
export const updateAddress = (id, data) => API.put(`/users/addresses/${id}`, data);
export const deleteAddress = (id) => API.delete(`/users/addresses/${id}`);
export const toggleWishlist = (productId) => API.post('/users/wishlist/toggle', { productId });
export const addPaymentMethod = (data) => API.post('/users/payment-methods', data);
export const deletePaymentMethod = (id) => API.delete(`/users/payment-methods/${id}`);

// ---- REVIEWS ----
export const addReview = (data) => API.post('/reviews/add', data);
export const fetchProductReviews = (productId) => API.get(`/reviews/${productId}`);
export const updateReviewSentiment = (id, sentiment) => API.patch(`/reviews/${id}/sentiment`, { sentiment });

// ---- ADMIN ----
export const fetchAdminStats = () => API.get('/admin/stats');
export const fetchAdminOrders = () => API.get('/admin/orders');
export const updateOrderStatus = (id, status) => API.patch(`/admin/orders/${id}/status`, { status });
export const fetchAdminCustomers = () => API.get('/admin/customers');
export const fetchCustomerOrders = (id) => API.get(`/admin/customers/${id}/orders`);
export const fetchAdminTransactions = () => API.get('/admin/transactions');
export const fetchAdminAnalytics = () => API.get('/admin/analytics');
export const fetchAdminReviews = () => API.get('/admin/reviews');

export default API;
