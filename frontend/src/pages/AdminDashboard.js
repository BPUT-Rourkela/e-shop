import React, { useState, useEffect } from 'react';
import { fetchProducts, addProduct, deleteProduct } from '../api';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', category: '', image: ''
  });

  useEffect(() => {
    fetchProducts()
      .then(({ data }) => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await addProduct(newProduct);
      setProducts([...products, data]);
      setNewProduct({ name: '', description: '', price: '', category: '', image: '' });
      alert('Product added successfully!');
    } catch (err) {
      alert('Failed to add product. Make sure you have admin rights.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
      alert('Product deleted');
    } catch (err) {
      alert('Failed to delete product. Make sure you have admin rights.');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-bold mb-4">Add New Product</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg">
          <input type="text" name="name" placeholder="Name" value={newProduct.name} onChange={handleChange} required className="border p-2 rounded" />
          <textarea name="description" placeholder="Description" value={newProduct.description} onChange={handleChange} required className="border p-2 rounded" />
          <input type="number" name="price" placeholder="Price" value={newProduct.price} onChange={handleChange} required className="border p-2 rounded" />
          <input type="text" name="category" placeholder="Category" value={newProduct.category} onChange={handleChange} required className="border p-2 rounded" />
          <input type="text" name="image" placeholder="Image URL (optional)" value={newProduct.image} onChange={handleChange} className="border p-2 rounded" />
          <button type="submit" className="bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">Add Product</button>
        </form>
      </div>

      <h2 className="text-2xl font-bold mb-4">Product List</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div key={p._id} className="border p-4 rounded bg-white shadow flex flex-col justify-between">
            <div>
              <h3 className="font-bold">{p.name}</h3>
              <p className="text-green-600 font-bold">${p.price}</p>
              <p className="text-sm text-gray-500">{p.category}</p>
            </div>
            <button 
              onClick={() => handleDelete(p._id)}
              className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600 self-end">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
