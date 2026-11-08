import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Lock, Mail, User, Phone, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu cần tối thiểu 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!agreeTerms) {
      toast.error('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({
        fullName,
        email,
        phone,
        password,
      });

      if (res.data && res.data.success) {
        const { user, token } = res.data.data;
        setAuth(user, token);
        toast.success('Đăng ký tài khoản thành công!');
        navigate('/tai-khoan');
      } else {
        toast.error(res.data?.message || 'Đăng ký không thành công');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email này đã tồn tại trong hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-lg w-full">
        
        {/* Card Form */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-gray-100">
          
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-navy flex items-center justify-center text-white shadow-md">
                <Home className="w-6 h-6 text-orange-earth" />
              </div>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">Tạo tài khoản mới</h1>
            
            {/* Note banner: 1 tài khoản cho cả 2 vai trò */}
            <div className="mt-3 p-3 bg-blue-light/60 rounded-2xl border border-blue-100 flex items-start gap-2.5 text-left">
              <Sparkles className="w-4 h-4 text-orange-earth shrink-0 mt-0.5" />
              <p className="text-xs text-navy font-medium leading-relaxed">
                <strong>Đặc quyền tài khoản YouRoom:</strong> Bạn có thể vừa tìm phòng thuê, vừa đăng tin cho thuê phòng trọ trên cùng một tài khoản duy nhất.
              </p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Họ và tên */}
            <div>
              <label className="block text-xs font-bold text-navy uppercase mb-1.5">Họ và tên *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-navy uppercase mb-1.5">Địa chỉ Email *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy transition-all"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-xs font-bold text-navy uppercase mb-1.5">Số điện thoại liên hệ</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy transition-all"
                />
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-navy uppercase mb-1.5">Mật khẩu *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase mb-1.5">Xác nhận mật khẩu *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-gray-600">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded text-navy focus:ring-navy w-4 h-4 accent-navy mt-0.5 shrink-0"
                />
                <span>
                  Tôi đồng ý với <a href="#terms" className="text-navy font-bold hover:underline">Điều khoản sử dụng</a> và <a href="#privacy" className="text-navy font-bold hover:underline">Chính sách bảo mật</a> của YouRoom AI.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-orange-earth text-white font-bold rounded-xl text-sm shadow-md hover:bg-orange-600 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-4"
            >
              {loading ? 'Đang khởi tạo...' : 'Đăng ký tài khoản'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-xs font-medium text-gray-500">
            Đã có tài khoản YouRoom?{' '}
            <Link to="/dang-nhap" className="font-bold text-navy hover:text-orange-earth transition-colors">
              Đăng nhập ngay
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
