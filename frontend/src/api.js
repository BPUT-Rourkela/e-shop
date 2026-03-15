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

export default API;
