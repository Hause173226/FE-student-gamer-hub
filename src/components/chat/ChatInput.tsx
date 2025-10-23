import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  showEmojiPicker?: boolean;
  showFileUpload?: boolean;
  showVoiceMessage?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = "Type a message...",
  maxLength = 1000,
  showEmojiPicker = true,
  showFileUpload = true,
  showVoiceMessage = false
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const recordingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Handle typing detection
  useEffect(() => {
    if (message.trim()) {
      setIsTyping(true);
      onTyping?.(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping?.(false);
      }, 1000);
    } else {
      setIsTyping(false);
      onTyping?.(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, onTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceStart = () => {
    setIsRecording(true);
    // TODO: Implement voice recording
    console.log('🎤 Voice recording started');
  };

  const handleVoiceStop = () => {
    setIsRecording(false);
    // TODO: Implement voice recording stop and send
    console.log('🎤 Voice recording stopped');
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojis(false);
    textareaRef.current?.focus();
  };

  const handleFileUpload = () => {
    // TODO: Implement file upload
    console.log('📎 File upload clicked');
  };

  const emojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯'];

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Emoji picker */}
      {showEmojis && (
        <div className="absolute bottom-20 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
          <div className="grid grid-cols-5 gap-2">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiSelect(emoji)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        {/* File upload button */}
        {showFileUpload && (
          <button
            type="button"
            onClick={handleFileUpload}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        )}

        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          
          {/* Character count */}
          {maxLength && (
            <div className="absolute bottom-1 right-2 text-xs text-gray-400">
              {message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Emoji button */}
        {showEmojiPicker && (
          <button
            type="button"
            onClick={() => setShowEmojis(!showEmojis)}
            disabled={disabled}
            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <Smile className="w-5 h-5" />
          </button>
        )}

        {/* Voice message button */}
        {showVoiceMessage && (
          <button
            type="button"
            onMouseDown={handleVoiceStart}
            onMouseUp={handleVoiceStop}
            onMouseLeave={handleVoiceStop}
            disabled={disabled}
            className={`p-2 rounded-full ${
              isRecording 
                ? 'bg-red-500 text-white' 
                : 'text-gray-500 hover:text-gray-700'
            } disabled:opacity-50`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}

        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      {/* Typing indicator */}
      {isTyping && (
        <div className="text-xs text-gray-500 mt-1">
          Typing...
        </div>
      )}
    </div>
  );
};

export default ChatInput;
