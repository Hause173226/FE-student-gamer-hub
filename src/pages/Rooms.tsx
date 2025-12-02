import React from "react";
import { MessageSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Rooms() {
  const navigate = useNavigate();

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="text-center py-20 bg-gray-800 border border-gray-700 rounded-2xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <MessageSquare className="w-12 h-12 text-indigo-400" />
          <Users className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Rooms</h2>
        <p className="text-gray-400 mb-4">
          Chức năng Rooms đã được tích hợp vào Community → Club → Room flow
        </p>
        <p className="text-gray-500 text-sm">
          Để sử dụng chat, hãy đi qua: Communities → Chọn Community → Chọn Club → Chọn Room
        </p>
        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate("/chat-lab")}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium transition-colors"
          >
            Mở Chat Lab (Join/Leave/History)
          </button>
          <button
            onClick={() => navigate("/chat-groups")}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
          >
            Xem các nhóm chat đã tham gia
          </button>
        </div>
      </div>
    </div>
  );
}