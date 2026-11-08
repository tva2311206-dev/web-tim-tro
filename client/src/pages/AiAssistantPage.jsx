import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Trash2, ArrowRight, AlertCircle, Info, Home } from 'lucide-react';
import { aiApi } from '../services/api';
import RoomCard from '../components/room/RoomCard';

const QUICK_PROMPTS = [
  'Tôi là sinh viên, ngân sách 2.5 triệu, cần tìm phòng gần Học viện Kỹ thuật Mật mã có điều hòa và vệ sinh riêng.',
  'Tìm phòng trọ giá dưới 2 triệu gần Cầu Giấy cho 2 người ở.',
  'Cần thuê căn hộ mini full nội thất tại Hà Đông hoặc Thanh Xuân tầm 3 đến 4 triệu.',
  'Tìm phòng trọ có ban công, thoáng mát tại TP. Hồ Chí Minh.',
  'Hướng dẫn tôi cách đăng tin cho thuê phòng miễn phí trên YouRoom AI.',
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Xin chào! Tôi là **Trợ lý YouRoom AI** 🏠.\n\nTôi có thể giúp bạn tìm phòng trọ lý tưởng dựa trên nhu cầu thực tế: vị trí, mức giá, tiện ích, trường học... Hãy mô tả mong muốn của bạn bằng ngôn ngữ tự nhiên nhé!',
      suggestedRooms: [],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const res = await aiApi.chat(textToSend, messages);
      if (res.data && res.data.data) {
        const { reply, suggestedRooms } = res.data.data;
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: reply,
            suggestedRooms: suggestedRooms || [],
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Xin lỗi, tôi gặp sự cố tạm thời khi kết nối máy chủ AI. Bạn hãy thử lại sau giây lát nhé!',
          suggestedRooms: [],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Cuộc trò chuyện đã được làm mới. Tôi có thể hỗ trợ gì thêm cho bạn?',
        suggestedRooms: [],
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="bg-cream min-h-[calc(100vh-80px)] py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col h-[calc(100vh-130px)]">

        {/* Demo Notice Banner */}
        <div className="mb-4 p-3 bg-blue-light/70 rounded-2xl border border-blue-200/80 flex items-center justify-between text-xs text-navy shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-earth animate-pulse shrink-0" />
            <span>
              <strong>Chế độ YouRoom AI:</strong> AI truy vấn trực tiếp từ cơ sở dữ liệu phòng thực tế, không tự bịa đặt thông tin.
            </span>
          </div>
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 text-gray-500 hover:text-red-500 font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-white"
            title="Xóa lịch sử trò chuyện"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>

        {/* Chat History Container */}
        <div className="flex-1 bg-white rounded-3xl p-4 sm:p-6 shadow-card border border-gray-100 overflow-y-auto space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot Avatar */}
              {msg.role === 'assistant' && (
                <div className="w-9 h-9 rounded-xl bg-navy text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-5 h-5 text-orange-earth" />
                </div>
              )}

              {/* Message Content */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-navy text-white rounded-tr-none'
                    : 'bg-blue-light/40 text-navy border border-blue-100 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line font-normal">
                  {msg.content}
                </div>

                {/* Suggested Real Rooms Grid */}
                {msg.suggestedRooms && msg.suggestedRooms.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-navy/10 space-y-3">
                    <p className="text-xs font-bold text-navy flex items-center gap-1.5 uppercase tracking-wider">
                      <Home className="w-4 h-4 text-orange-earth" />
                      Phòng thực tế trong cơ sở dữ liệu ({msg.suggestedRooms.length}):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.suggestedRooms.map((room) => (
                        <RoomCard key={room.id} room={room} />
                      ))}
                    </div>
                  </div>
                )}

                <div className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-gray-300' : 'text-gray-400'} text-right`}>
                  {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-orange-earth text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-9 h-9 rounded-xl bg-navy text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-5 h-5 text-orange-earth" />
              </div>
              <div className="bg-blue-light/40 p-4 rounded-2xl rounded-tl-none border border-blue-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-navy animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-navy animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-navy animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Carousel */}
        <div className="py-3 flex gap-2 overflow-x-auto shrink-0 no-scrollbar">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600 hover:text-navy hover:border-navy whitespace-nowrap transition-all shadow-2xs hover:shadow-xs"
            >
              💬 {prompt.slice(0, 45)}...
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="bg-white p-3 rounded-2xl shadow-card border border-gray-100 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập yêu cầu tìm phòng (Ví dụ: Tìm phòng dưới 3 triệu gần Cầu Giấy...)"
            className="flex-1 bg-transparent px-3 py-2 text-sm font-medium text-navy placeholder:text-gray-400 focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-3 bg-orange-earth text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
