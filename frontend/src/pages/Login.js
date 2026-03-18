import React, { useState } from 'react';
import { login, register } from '../api';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckSquare, Square } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    role: 'customer' 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && !agreeTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { data } = await login({ email: formData.email, password: formData.password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        window.dispatchEvent(new Event('authChange'));
        navigate(data.user.role === 'admin' ? '/admin' : '/');
      } else {
        // Map firstName+lastName to name for the backend
        const regData = { 
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password,
          role: 'customer'
        };
        await register(regData);
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
    <div className="min-h-screen bg-white flex items-center justify-center p-6 selection:bg-teal-200">
      <div className="w-full max-w-[440px] flex flex-col items-center">
        
        {/* Branding & Header */}
        <div className="text-center mb-10 w-full">
          <h1 className="text-[32px] font-extrabold text-[#0d1b2a] tracking-tight mb-1">
            EcomStore
          </h1>
          <p className="text-gray-500 font-medium tracking-wide">
            {isLogin ? "Welcome back" : "Create your account"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 ml-1">First name</label>
                <input 
                  name="firstName" 
                  type="text" 
                  placeholder="" 
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] focus:outline-none focus:border-indigo-500/50 focus:bg-white transition-all text-gray-800 placeholder-gray-300 font-medium"
                  required={!isLogin} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-500 ml-1">Last name</label>
                <input 
                  name="lastName" 
                  type="text" 
                  placeholder="" 
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] focus:outline-none focus:border-indigo-500/50 focus:bg-white transition-all text-gray-800 placeholder-gray-300 font-medium"
                  required={!isLogin} 
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 ml-1">Email</label>
            <input 
              name="email" 
              type="email" 
              placeholder="you@example.com" 
              value={formData.email}
              onChange={handleChange}
              className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] focus:outline-none focus:border-indigo-500/50 focus:bg-white transition-all text-gray-800 placeholder-gray-300 font-medium"
              required 
            />
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-semibold text-gray-500 ml-1">Password</label>
            <div className="relative">
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                placeholder={isLogin ? "••••••••" : "Min. 8 characters"} 
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-[1.25rem] focus:outline-none focus:border-indigo-500/50 focus:bg-white transition-all text-gray-800 placeholder-gray-300 font-medium pr-12"
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <div 
              className="flex items-center gap-2 cursor-pointer group select-none"
              onClick={() => isLogin ? setRememberMe(!rememberMe) : setAgreeTerms(!agreeTerms)}
            >
              <div className={`transition-colors duration-200 ${isLogin && rememberMe || !isLogin && agreeTerms ? 'text-indigo-600' : 'text-gray-300 group-hover:text-gray-400'}`}>
                {isLogin && rememberMe || !isLogin && agreeTerms ? <CheckSquare size={18} fill="currentColor" className="text-white" /> : <Square size={18} />}
              </div>
              <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                {isLogin ? "Remember me" : "I agree to the Terms of Service and Privacy Policy"}
              </span>
            </div>
            {isLogin && (
              <button type="button" className="text-sm font-semibold text-indigo-500 hover:text-indigo-600 transition-colors">
                Forgot password?
              </button>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0d1b2a] text-white py-4 rounded-[1.25rem] font-bold text-center hover:bg-[#1a2e47] transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-[#0d1b2a]/10"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-[15px] font-medium text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:text-indigo-800 font-bold ml-1"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
