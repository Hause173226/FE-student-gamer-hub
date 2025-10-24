import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import userService, { ResetPasswordPayload } from '../../services/userService';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const userIdParam = searchParams.get('uid') || searchParams.get('userId');
    const tokenParam = searchParams.get('token');
    
    console.log('🔍 Reset Password URL params:', {
      uid: searchParams.get('uid'),
      userId: searchParams.get('userId'),
      token: searchParams.get('token'),
      allParams: Object.fromEntries(searchParams.entries())
    });
    
    if (!userIdParam || !tokenParam) {
      toast.error('Link không hợp lệ hoặc đã hết hạn');
      navigate('/login');
      return;
    }
    
    setUserId(userIdParam);
    setToken(tokenParam);
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.newPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu mới');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const payload: ResetPasswordPayload = {
        userId,
        token,
        newPassword: formData.newPassword
      };
      
      await userService.resetPassword(payload);
      
      setSuccess(true);
      toast.success('Đặt lại mật khẩu thành công!');
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể đặt lại mật khẩu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Đặt lại mật khẩu thành công!
            </h2>
            
            <p className="text-gray-300 mb-6">
              Mật khẩu của bạn đã được đặt lại thành công. Bây giờ bạn có thể đăng nhập với mật khẩu mới.
            </p>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
            <Lock className="h-8 w-8 text-indigo-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Đặt lại mật khẩu
          </h2>
          
          <p className="text-gray-300">
            Nhập mật khẩu mới của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Mật khẩu mới
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang đặt lại...
              </div>
            ) : (
              'Đặt lại mật khẩu'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
