import React, { useState } from 'react';
import { Search, MapPin, Home, DollarSign } from 'lucide-react';
import { CITIES, ROOM_TYPES, PRICE_RANGES } from '../../utils/helpers';

export default function SearchBar({ initialValues = {}, onSearch }) {
  const [keyword, setKeyword] = useState(initialValues.keyword || '');
  const [city, setCity] = useState(initialValues.city || '');
  const [roomType, setRoomType] = useState(initialValues.roomType || '');
  const [priceRangeIndex, setPriceRangeIndex] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedPrice = PRICE_RANGES[priceRangeIndex] || {};
    if (onSearch) {
      onSearch({
        keyword,
        city,
        roomType,
        minPrice: selectedPrice.min || undefined,
        maxPrice: selectedPrice.max || undefined,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-3 md:p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col lg:flex-row items-center gap-3 w-full">
      {/* Keyword */}
      <div className="flex-1 w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-navy focus-within:bg-white transition-all">
        <Search className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo tên đường, trường ĐH, địa điểm..."
          className="bg-transparent w-full text-sm font-medium text-navy focus:outline-none placeholder:text-gray-400"
        />
      </div>

      {/* City */}
      <div className="w-full lg:w-48 flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-transparent w-full text-sm font-medium text-navy focus:outline-none cursor-pointer"
        >
          <option value="">Tất cả tỉnh/TP</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Room Type */}
      <div className="w-full lg:w-44 flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
        <Home className="w-4 h-4 text-gray-400 shrink-0" />
        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          className="bg-transparent w-full text-sm font-medium text-navy focus:outline-none cursor-pointer"
        >
          {ROOM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="w-full lg:w-44 flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
        <DollarSign className="w-4 h-4 text-gray-400 shrink-0" />
        <select
          value={priceRangeIndex}
          onChange={(e) => setPriceRangeIndex(Number(e.target.value))}
          className="bg-transparent w-full text-sm font-medium text-navy focus:outline-none cursor-pointer"
        >
          {PRICE_RANGES.map((p, idx) => (
            <option key={idx} value={idx}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full lg:w-auto px-7 py-3 bg-orange-earth text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-md active:scale-95 shrink-0"
      >
        Tìm kiếm
      </button>
    </form>
  );
}
