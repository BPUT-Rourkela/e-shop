import React, { useState } from 'react';
import { login, register } from '../api';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { data } = await login({ email: formData.email, password: formData.password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        navigate(data.user.role === 'admin' ? '/admin' : '/');
      } else {
        await register(formData);
        alert("Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(isLogin ? "Login failed. Check credentials." : "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center p-6 selection:bg-teal-200">
      <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden flex w-full max-w-5xl">
        
        {/* Decorative Side Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-4">
              {isLogin ? "Welcome Back to EcomStore" : "Join the EcomStore Family"}
            </h2>
            <p className="text-purple-200 text-lg">
              {isLogin 
                ? "Sign in to access personalized deals, fast checkout, and exclusive products." 
                : "Create an account for the smartest, fastest, and most beautiful shopping experience."}
            </p>
          </div>
          <div className="relative z-10 mt-12 bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-teal-400/20 p-2 rounded-lg text-teal-300"><ShieldCheck size={28} /></div>
              <h4 className="font-bold text-lg">Secure Access</h4>
            </div>
            <p className="text-sm text-purple-100">Your data is fully encrypted and protected during every step of your shopping journey.</p>
          </div>
          {/* Background decoration elements */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>

        {/* Form Panel */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-extrabold text-gray-900 mb-2">
                {isLogin ? "Hello Again!" : "Create Account"}
              </h3>
              <p className="text-gray-500 font-medium">
                {isLogin ? "Sign in to your account" : "Fill out the form to get started"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    <User size={20} />
                  </div>
                  <input 
                    name="name" 
                    type="text" 
                    placeholder="Full Name" 
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-gray-800"
                    required={!isLogin} 
                  />
                </div>
              )}
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Mail size={20} />
                </div>
                <input 
                  name="email" 
                  type="email" 
                  placeholder="Email Address" 
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-gray-800"
                  required 
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Password" 
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all font-medium text-gray-800"
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Sign Up"}
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-gray-500 font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
              >
                {isLogin ? "Register now" : "Log in instead"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
