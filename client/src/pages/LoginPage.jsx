import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Eye, EyeOff, Lock, Mail, ArrowRight, Shield, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (res.data && res.data.success) {
        const { user, token } = res.data.data;
        setAuth(user, token);
        toast.success(`Chào mừng trở lại, ${user.fullName}!`);
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/tai-khoan');
        }
      } else {
        toast.error(res.data?.message || 'Đăng nhập không thành công');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  // Demo 1-click logins
  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        
        {/* Card Form */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-gray-100">
          
          {/* Logo & Heading */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group mb-4">
              <div className="w-12 h-12 rounded-2xl bg-navy flex items-center justify-center text-white shadow-md">
                <Home className="w-6 h-6 text-orange-earth" />
              </div>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">Chào mừng trở lại!</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Đăng nhập để quản lý phòng trọ, yêu cầu thuê và tìm nơi ở lý tưởng.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-navy uppercase mb-1.5">Email hoặc Số điện thoại</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-navy uppercase">Mật khẩu</label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); toast('Vui lòng liên hệ Admin để khôi phục mật khẩu.'); }} className="text-xs font-semibold text-orange-earth hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-navy"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-600">
                <input type="checkbox" defaultChecked className="rounded text-navy focus:ring-navy w-4 h-4 accent-navy" />
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-orange-earth text-white font-bold rounded-xl text-sm shadow-md hover:bg-orange-600 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập ngay'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Box */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5 text-center">
              Tài khoản dùng thử nhanh (1-Click)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('demo@youroom.ai', 'User@123')}
                className="p-2.5 bg-blue-light/60 hover:bg-blue-light rounded-xl text-xs font-bold text-navy flex items-center justify-center gap-1.5 transition-all border border-blue-100"
              >
                <UserCheck className="w-3.5 h-3.5 text-navy" />
                Người dùng Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@youroom.ai', 'Admin@123')}
                className="p-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl text-xs font-bold text-amber-800 flex items-center justify-center gap-1.5 transition-all border border-amber-200"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                Quản trị viên (Admin)
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center text-xs font-medium text-gray-500">
            Chưa có tài khoản YouRoom?{' '}
            <Link to="/dang-ky" className="font-bold text-navy hover:text-orange-earth transition-colors">
              Đăng ký ngay
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
