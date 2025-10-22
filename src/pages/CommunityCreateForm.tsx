// src/components/CommunityCreateForm.tsx

import { useState } from "react";
import { X, Globe, Lock } from "lucide-react";
import { CreateCommunityPayload } from "../types";

interface CommunityCreateFormProps {
    onClose: () => void;
    onSubmit: (data: CreateCommunityPayload) => void;
    isSubmitting: boolean;
}

const CommunityCreateForm = ({ onClose, onSubmit, isSubmitting }: CommunityCreateFormProps) => {
    const [formData, setFormData] = useState<CreateCommunityPayload>({
        name: "",
        description: "",
        school: "",
        isPublic: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === "privacy") {
            setFormData(prev => ({ ...prev, isPublic: value === 'public' }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value === "" ? null : value, // Gửi null nếu chuỗi rỗng
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Tạo cộng đồng mới</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Tên cộng đồng *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="VD: FPT University - Valorant Champions"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Mô tả cộng đồng</label>
                        <textarea
                            name="description"
                            value={formData.description ?? ""}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Mô tả về mục đích, hoạt động của cộng đồng..."
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Trường đại học</label>
                        <select
                            name="school"
                            value={formData.school ?? ""}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="">Không thuộc trường nào</option>
                            <option value="FPT University">FPT University</option>
                            <option value="HCMUT">HCMUT</option>
                            <option value="UEH">UEH</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-3">Quyền riêng tư</label>
                        <div className="space-y-3">
                            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                <input
                                    type="radio" name="privacy" value="public"
                                    checked={formData.isPublic === true} onChange={handleChange}
                                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                                />
                                <div className="flex items-center space-x-2">
                                    <Globe className="w-4 h-4 text-emerald-400" />
                                    <div>
                                        <span className="text-white font-medium">Công khai</span>
                                        <p className="text-gray-400 text-sm">Ai cũng có thể tìm thấy và tham gia</p>
                                    </div>
                                </div>
                            </label>
                            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                                <input
                                    type="radio" name="privacy" value="private"
                                    checked={formData.isPublic === false} onChange={handleChange}
                                    className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                                />
                                <div className="flex items-center space-x-2">
                                    <Lock className="w-4 h-4 text-yellow-400" />
                                    <div>
                                        <span className="text-white font-medium">Riêng tư</span>
                                        <p className="text-gray-400 text-sm">Chỉ thành viên được mời mới có thể tham gia</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Đang tạo..." : "Tạo cộng đồng"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommunityCreateForm;