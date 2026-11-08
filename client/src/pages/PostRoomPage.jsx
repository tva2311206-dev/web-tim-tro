import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, MapPin, DollarSign, Maximize2, Users, Zap, Droplet, 
  Wifi, Phone, Sparkles, Image, Check, AlertCircle, ArrowLeft, ArrowRight, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import { roomApi, aiApi } from '../services/api';
import { CITIES, ROOM_TYPES, AMENITIES_LIST } from '../utils/helpers';

export default function PostRoomPage() {
  const navigate = useNavigate();

  // Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [roomType, setRoomType] = useState('PHONG_TRO');
  const [city, setCity] = useState('Hà Nội');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [maxOccupants, setMaxOccupants] = useState(2);

  const [amenities, setAmenities] = useState(['Điều hòa', 'Nóng lạnh', 'Nhà VS riêng', 'Chỗ để xe']);
  const [electricPrice, setElectricPrice] = useState(3800);
  const [waterPrice, setWaterPrice] = useState(25000);
  const [internetPrice, setInternetPrice] = useState(100000);
  const [contactPhone, setContactPhone] = useState('0912345678');
  const [description, setDescription] = useState('');

  // Images
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState([
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  ]);

  const toggleAmenity = (item) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter(a => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  const handleAddImage = () => {
    if (!imageUrl) return;
    setImages([...images, imageUrl]);
    setImageUrl('');
    toast.success('Đã thêm ảnh');
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // AI Description Generator
  const handleGenerateAIDescription = async () => {
    if (!title || !price || !area) {
      toast.error('Vui lòng nhập trước Tiêu đề, Giá thuê và Diện tích để AI có dữ liệu viết');
      return;
    }

    setAiGenerating(true);
    try {
      const res = await aiApi.describe({
        title,
        roomType,
        city,
        district,
        address,
        price: Number(price),
        area: Number(area),
        amenities,
        electricPrice,
        waterPrice,
        contactPhone,
      });

      if (res.data && res.data.data) {
        setDescription(res.data.data.description);
        toast.success('AI đã gợi ý đoạn mô tả hấp dẫn! Bạn có thể chỉnh sửa lại theo ý muốn.');
      }
    } catch (err) {
      toast.error('Không thể tạo mô tả AI lúc này');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !area || !address) {
      toast.error('Vui lòng điền đầy đủ các thông tin quan trọng');
      return;
    }

    setSubmitting(true);
    try {
      const res = await roomApi.create({
        title,
        roomType,
        city,
        district,
        ward,
        address,
        price: Number(price),
        area: Number(area),
        maxOccupants: Number(maxOccupants),
        amenities,
        electricPrice: Number(electricPrice),
        waterPrice: Number(waterPrice),
        internetPrice: Number(internetPrice),
        contactPhone,
        description: description || 'Phòng sạch sẽ, an ninh tốt, tiện nghi đầy đủ.',
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80'],
      });

      if (res.data && res.data.success) {
        toast.success('Đăng tin thành công! Tin của bạn đang chờ Quản trị viên duyệt.');
        navigate('/tai-khoan');
      }
    } catch (err) {
      toast.error('Đã xảy ra lỗi khi đăng tin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-earth bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            Dành cho Chủ trọ & Người cho thuê
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-navy mt-2 tracking-tight">Đăng tin cho thuê phòng trọ</h1>
          <p className="text-sm text-gray-500 mt-1 max-w-xl mx-auto">
            Tiếp cận hàng nghìn sinh viên và người đi làm đang tìm phòng mỗi ngày. Miễn phí 100%!
          </p>
        </div>

        {/* Warning Banner: Pending Review */}
        <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <strong>Lưu ý kiểm duyệt:</strong> Theo quy định của YouRoom AI, tin đăng mới sẽ ở trạng thái <strong>"Chờ duyệt"</strong>. Đội ngũ quản trị viên sẽ xét duyệt trong vòng 24 giờ để đảm bảo không có tin rác hay lừa đảo trước khi hiển thị công khai.
          </div>
        </div>

        {/* Multi-step progress bar */}
        <div className="mb-8 flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-0 -translate-y-1/2" />
          {[
            { step: 1, title: 'Thông tin cơ bản' },
            { step: 2, title: 'Tiện ích & Chi phí' },
            { step: 3, title: 'Hình ảnh & Xác nhận' },
          ].map((item) => (
            <div key={item.step} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(item.step)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  currentStep >= item.step
                    ? 'bg-navy text-white shadow-md'
                    : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
              >
                {currentStep > item.step ? <Check className="w-5 h-5 text-orange-earth" /> : item.step}
              </button>
              <span className={`text-xs font-semibold mt-2 hidden sm:block ${
                currentStep >= item.step ? 'text-navy' : 'text-gray-400'
              }`}>
                {item.title}
              </span>
            </div>
          ))}
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-card border border-gray-100">
          
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-navy pb-3 border-b border-gray-100 flex items-center gap-2">
                <Building className="w-5 h-5 text-orange-earth" />
                1. Thông tin cơ bản về phòng trọ
              </h2>

              <div>
                <label className="block text-xs font-bold text-navy uppercase mb-1.5">Tiêu đề bài đăng *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Phòng trọ studio khép kín gần ĐH Quốc Gia, ban công thoáng mát"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy uppercase mb-1.5">Loại hình phòng *</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy"
                  >
                    {ROOM_TYPES.filter(t => t.value).map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy uppercase mb-1.5">Sức chứa tối đa (người)</label>
                  <select
                    value={maxOccupants}
                    onChange={(e) => setMaxOccupants(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy"
                  >
                    <option value={1}>1 người</option>
                    <option value={2}>2 người</option>
                    <option value={3}>3 người</option>
                    <option value={4}>4 người</option>
                    <option value={6}>Trên 4 người</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy uppercase mb-1.5">Tỉnh / Thành phố *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy"
                  >
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy uppercase mb-1.5">Quận / Huyện *</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Cầu Giấy, Đống Đa..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy uppercase mb-1.5">Phường / Xã</label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="Dịch Vọng, Yên Hòa..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase mb-1.5">Địa chỉ cụ thể (Số nhà, ngõ, tên đường) *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ví dụ: Số 15 ngõ 120 Trần Duy Hưng"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              {/* Price & Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy uppercase mb-1.5">Giá thuê mỗi tháng (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    step="100000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3000000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-orange-earth focus:bg-white focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy uppercase mb-1.5">Diện tích phòng (m²) *</label>
                  <input
                    type="number"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="25"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-navy focus:bg-white focus:outline-none focus:border-navy"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!title || !price || !area || !address) {
                      toast.error('Vui lòng điền đủ Tiêu đề, Địa chỉ, Giá và Diện tích');
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  Tiếp theo: Tiện ích & Chi phí <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Amenities & Utilities */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-navy pb-3 border-b border-gray-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-earth" />
                2. Tiện ích, Chi phí & Mô tả phòng
              </h2>

              {/* Amenities checkboxes */}
              <div>
                <label className="block text-xs font-bold text-navy uppercase mb-2.5">Tiện ích đi kèm</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {AMENITIES_LIST.map((item) => {
                    const checked = amenities.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleAmenity(item)}
                        className={`p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all ${
                          checked
                            ? 'bg-blue-light/70 border-navy text-navy'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <span>{item}</span>
                        {checked && <Check className="w-3.5 h-3.5 text-orange-earth" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Utility costs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy uppercase mb-1.5">Giá điện (đ/kWh)</label>
                  <input
                    type="number"
                    value={electricPrice}
                    onChange={(e) => setElectricPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy uppercase mb-1.5">Giá nước (đ/khối)</label>
                  <input
                    type="number"
                    value={waterPrice}
                    onChange={(e) => setWaterPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy uppercase mb-1.5">Wifi / Internet (đ/tháng)</label>
                  <input
                    type="number"
                    value={internetPrice}
                    onChange={(e) => setInternetPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy uppercase mb-1.5">Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              {/* Description & AI Button */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-navy uppercase">Mô tả chi tiết bài đăng</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    disabled={aiGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-light text-navy rounded-lg text-xs font-bold hover:bg-blue-100 transition-all border border-blue-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-orange-earth animate-pulse" />
                    {aiGenerating ? 'AI đang viết...' : 'AI viết mô tả giúp tôi'}
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả cụ thể về giờ giấc, không gian xung quanh, vị trí các trường học, bến xe, tiện ích tòa nhà..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-navy focus:bg-white focus:outline-none focus:border-navy leading-relaxed"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="btn-primary flex items-center gap-2"
                >
                  Tiếp theo: Hình ảnh <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Images & Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-navy pb-3 border-b border-gray-100 flex items-center gap-2">
                <Image className="w-5 h-5 text-orange-earth" />
                3. Hình ảnh phòng trọ & Xác nhận đăng tin
              </h2>

              <div>
                <label className="block text-xs font-bold text-navy uppercase mb-1.5">Thêm URL hình ảnh</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:bg-white focus:outline-none focus:border-navy"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-5 py-3 bg-navy text-white rounded-xl text-xs font-bold hover:bg-navy-dark transition-all"
                  >
                    Thêm ảnh
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Gợi ý: Dùng ảnh chất lượng cao, rõ góc phòng để tăng 70% cơ hội người thuê liên hệ.</p>
              </div>

              {/* Images Preview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 h-28 bg-gray-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary Review Card */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-xs space-y-2">
                <h4 className="font-bold text-navy text-sm mb-2">Tóm tắt tin đăng:</h4>
                <p><strong>Tiêu đề:</strong> {title || '(Chưa nhập)'}</p>
                <p><strong>Địa chỉ:</strong> {address}, {district}, {city}</p>
                <p><strong>Giá thuê:</strong> {Number(price || 0).toLocaleString('vi-VN')} đ/tháng | <strong>Diện tích:</strong> {area} m²</p>
                <p><strong>Tiện ích:</strong> {amenities.join(', ')}</p>
                <p><strong>Trạng thái ban đầu:</strong> <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded">Chờ duyệt (Pending)</span></p>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-3.5 bg-orange-earth text-white font-bold rounded-xl text-sm shadow-lg hover:bg-orange-600 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  {submitting ? 'Đang gửi duyệt...' : 'Hoàn tất & Đăng tin miễn phí'}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
