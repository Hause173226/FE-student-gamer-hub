import React from 'react';
import { MessageSquare, Users, Hash } from 'lucide-react';

export function Rooms() {
  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="text-center py-20">
        <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Rooms</h2>
        <p className="text-gray-400 mb-4">Chức năng Rooms đã được tích hợp vào Community → Club → Room flow</p>
        <p className="text-gray-500 text-sm">
          Để sử dụng chat, hãy đi qua: Communities → Chọn Community → Chọn Club → Chọn Room
        </p>
      </div>
    </div>
  );
}