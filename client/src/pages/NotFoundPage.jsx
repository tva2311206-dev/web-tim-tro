import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md bg-white p-10 rounded-3xl shadow-card border border-gray-100">
        <span className="text-6xl font-black text-navy tracking-tight">404</span>
        <h1 className="text-xl font-black text-navy mt-4 mb-2">Trang không tồn tại</h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Đường dẫn bạn truy cập có thể đã bị thay đổi hoặc không tồn tại trên hệ thống YouRoom AI.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <Home className="w-4 h-4" /> Về trang chủ
        </Link>
      </div>
    </div>
  );
}
