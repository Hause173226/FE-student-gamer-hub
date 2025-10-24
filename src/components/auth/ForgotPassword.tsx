import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import userService, { ForgotPasswordPayload } from '../../services/userService';
import { toast } from 'react-hot-toast';

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }

    setLoading(true);
    try {
      const payload: ForgotPasswordPayload = { email: email.trim() };
      const callbackBaseUrl = `${window.location.origin}/reset-password`;
      
      await userService.sendPasswordResetEmail(payload, callbackBaseUrl);
      
      setEmailSent(true);
      toast.success('Email đặt lại mật khẩu đã được gửi!');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error?.response?.data?.message || 'Không thể gửi email đặt lại mật khẩu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Email đã được gửi!
            </h2>
            
            <p className="text-gray-300 mb-6">
              Chúng tôi đã gửi link đặt lại mật khẩu đến <strong className="text-white">{email}</strong>. 
              Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={onBack}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Quay lại đăng nhập
              </button>
              
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full bg-gray-700 text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Gửi lại email
              </button>
            </div>
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
            <Mail className="h-8 w-8 text-indigo-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Quên mật khẩu?
          </h2>
          
          <p className="text-gray-300">
            Nhập email của bạn để nhận link đặt lại mật khẩu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Nhập email của bạn"
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
                Đang gửi...
              </div>
            ) : (
              'Gửi email đặt lại mật khẩu'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
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

export default ForgotPassword;
