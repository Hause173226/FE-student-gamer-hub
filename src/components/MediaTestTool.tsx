import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Camera,
  Mic as MicIcon,
  Monitor as MonitorIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Square,
  Settings
} from 'lucide-react';

interface MediaTestToolProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TestResult {
  camera: 'idle' | 'testing' | 'success' | 'error';
  microphone: 'idle' | 'testing' | 'success' | 'error';
  screenShare: 'idle' | 'testing' | 'success' | 'error';
}

const MediaTestTool: React.FC<MediaTestToolProps> = ({ isOpen, onClose }) => {
  const [testResults, setTestResults] = useState<TestResult>({
    camera: 'idle',
    microphone: 'idle',
    screenShare: 'idle'
  });
  
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    // Stop all streams
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Cleanup popup elements
    const popupVideo = document.getElementById('media-test-camera');
    if (popupVideo) {
      document.body.removeChild(popupVideo);
    }
    
    const popupScreen = document.getElementById('media-test-screen');
    if (popupScreen) {
      document.body.removeChild(popupScreen);
    }
    
    const popupMic = document.getElementById('media-test-mic');
    if (popupMic) {
      document.body.removeChild(popupMic);
    }
  };

  const testCamera = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      setTestResults(prev => ({ ...prev, camera: 'testing' }));
      
      console.log('🎥 Testing camera...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      console.log('🎥 Camera stream received:', stream);
      
      // Store stream in ref for cleanup
      cameraStreamRef.current = stream;
      
      // Create popup video element
      const popupVideo = document.createElement('video');
      popupVideo.id = 'media-test-camera';
      popupVideo.srcObject = stream;
      popupVideo.autoplay = true;
      popupVideo.muted = true;
      popupVideo.style.width = '320px';
      popupVideo.style.height = '240px';
      popupVideo.style.border = '3px solid #10b981';
      popupVideo.style.position = 'fixed';
      popupVideo.style.top = '80px';
      popupVideo.style.left = '20px';
      popupVideo.style.zIndex = '9999';
      popupVideo.style.backgroundColor = 'black';
      popupVideo.style.borderRadius = '12px';
      popupVideo.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
      
      // Add label
      const label = document.createElement('div');
      label.textContent = '📹 Test Camera - Click to close';
      label.style.position = 'absolute';
      label.style.top = '8px';
      label.style.left = '8px';
      label.style.background = 'rgba(0, 0, 0, 0.8)';
      label.style.color = 'white';
      label.style.padding = '4px 8px';
      label.style.borderRadius = '6px';
      label.style.fontSize = '12px';
      label.style.fontWeight = 'bold';
      label.style.cursor = 'pointer';
      label.style.userSelect = 'none';
      
      popupVideo.appendChild(label);
      document.body.appendChild(popupVideo);
      
      // Click to close
      popupVideo.onclick = () => {
        if (cameraStreamRef.current) {
          cameraStreamRef.current.getTracks().forEach(track => track.stop());
          cameraStreamRef.current = null;
        }
        document.body.removeChild(popupVideo);
        setCameraOn(false);
        setTestResults(prev => ({ ...prev, camera: 'idle' }));
      };
      
      setCameraOn(true);
      setTestResults(prev => ({ ...prev, camera: 'success' }));
      console.log('✅ Camera test successful');
      
    } catch (error) {
      console.error('❌ Camera test failed:', error);
      setError(`Camera test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => ({ ...prev, camera: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const testMicrophone = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      setTestResults(prev => ({ ...prev, microphone: 'testing' }));
      
      console.log('🎤 Testing microphone...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });
      
      console.log('🎤 Microphone stream received:', stream);
      
      // Create audio context for visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      
      microphone.connect(gainNode);
      gainNode.connect(analyser);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Create visualization
      const canvas = document.createElement('canvas');
      canvas.id = 'media-test-mic';
      canvas.width = 320;
      canvas.height = 120;
      canvas.style.position = 'fixed';
      canvas.style.top = '340px';
      canvas.style.left = '20px';
      canvas.style.zIndex = '9999';
      canvas.style.border = '3px solid #3b82f6';
      canvas.style.borderRadius = '12px';
      canvas.style.backgroundColor = 'black';
      canvas.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
      
      const label = document.createElement('div');
      label.textContent = '🎤 Test Microphone - Click to close';
      label.style.position = 'absolute';
      label.style.top = '8px';
      label.style.left = '8px';
      label.style.background = 'rgba(0, 0, 0, 0.8)';
      label.style.color = 'white';
      label.style.padding = '4px 8px';
      label.style.borderRadius = '6px';
      label.style.fontSize = '12px';
      label.style.fontWeight = 'bold';
      label.style.cursor = 'pointer';
      label.style.userSelect = 'none';
      
      canvas.appendChild(label);
      document.body.appendChild(canvas);
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const draw = () => {
          if (micStreamRef.current) {
            analyser.getByteFrequencyData(dataArray);
            
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
              barHeight = (dataArray[i] / 255) * canvas.height;
              
              const hue = (barHeight / canvas.height) * 120; // Green to red
              ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
              ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
              
              x += barWidth + 1;
            }
            
            requestAnimationFrame(draw);
          }
        };
        
        draw();
      }
      
      // Click to close
      canvas.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        document.body.removeChild(canvas);
        setMicOn(false);
        setTestResults(prev => ({ ...prev, microphone: 'idle' }));
      };
      
      micStreamRef.current = stream;
      audioContextRef.current = audioContext;
      setMicOn(true);
      setTestResults(prev => ({ ...prev, microphone: 'success' }));
      console.log('✅ Microphone test successful');
      
    } catch (error) {
      console.error('❌ Microphone test failed:', error);
      setError(`Microphone test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => ({ ...prev, microphone: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const testScreenShare = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      setTestResults(prev => ({ ...prev, screenShare: 'testing' }));
      
      console.log('🖥️ Testing screen share...');
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });
      
      console.log('🖥️ Screen share stream received:', stream);
      
      // Store stream in ref for cleanup
      screenStreamRef.current = stream;
      
      // Create popup video element
      const popupVideo = document.createElement('video');
      popupVideo.id = 'media-test-screen';
      popupVideo.srcObject = stream;
      popupVideo.autoplay = true;
      popupVideo.muted = true;
      popupVideo.style.width = '400px';
      popupVideo.style.height = '300px';
      popupVideo.style.border = '3px solid #f59e0b';
      popupVideo.style.position = 'fixed';
      popupVideo.style.top = '80px';
      popupVideo.style.right = '20px';
      popupVideo.style.zIndex = '9999';
      popupVideo.style.backgroundColor = 'black';
      popupVideo.style.borderRadius = '12px';
      popupVideo.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
      
      // Add label
      const label = document.createElement('div');
      label.textContent = '🖥️ Test Screen Share - Click to close';
      label.style.position = 'absolute';
      label.style.top = '8px';
      label.style.left = '8px';
      label.style.background = 'rgba(0, 0, 0, 0.8)';
      label.style.color = 'white';
      label.style.padding = '4px 8px';
      label.style.borderRadius = '6px';
      label.style.fontSize = '12px';
      label.style.fontWeight = 'bold';
      label.style.cursor = 'pointer';
      label.style.userSelect = 'none';
      
      popupVideo.appendChild(label);
      document.body.appendChild(popupVideo);
      
      // Click to close
      popupVideo.onclick = () => {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
        }
        document.body.removeChild(popupVideo);
        setScreenShare(false);
        setTestResults(prev => ({ ...prev, screenShare: 'idle' }));
      };
      
      setScreenShare(true);
      setTestResults(prev => ({ ...prev, screenShare: 'success' }));
      console.log('✅ Screen share test successful');
      
    } catch (error) {
      console.error('❌ Screen share test failed:', error);
      setError(`Screen share test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => ({ ...prev, screenShare: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const stopAllTests = () => {
    cleanup();
    setCameraOn(false);
    setMicOn(false);
    setScreenShare(false);
    setTestResults({
      camera: 'idle',
      microphone: 'idle',
      screenShare: 'idle'
    });
    setError(null);
    console.log('🛑 All tests stopped');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Media Test Tools
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Test your camera, microphone, and screen sharing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Test Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Camera */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Camera</span>
                </div>
                {getStatusIcon(testResults.camera)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {testResults.camera === 'idle' && 'Ready to test'}
                {testResults.camera === 'testing' && 'Testing...'}
                {testResults.camera === 'success' && 'Working properly'}
                {testResults.camera === 'error' && 'Test failed'}
              </div>
            </div>

            {/* Microphone */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MicIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Microphone</span>
                </div>
                {getStatusIcon(testResults.microphone)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {testResults.microphone === 'idle' && 'Ready to test'}
                {testResults.microphone === 'testing' && 'Testing...'}
                {testResults.microphone === 'success' && 'Working properly'}
                {testResults.microphone === 'error' && 'Test failed'}
              </div>
            </div>

            {/* Screen Share */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MonitorIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Screen Share</span>
                </div>
                {getStatusIcon(testResults.screenShare)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {testResults.screenShare === 'idle' && 'Ready to test'}
                {testResults.screenShare === 'testing' && 'Testing...'}
                {testResults.screenShare === 'success' && 'Working properly'}
                {testResults.screenShare === 'error' && 'Test failed'}
              </div>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Camera Test */}
            <button
              onClick={testCamera}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-400 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/25 disabled:shadow-none"
            >
              <Camera className="w-5 h-5" />
              <span className="font-medium">Test Camera</span>
            </button>

            {/* Microphone Test */}
            <button
              onClick={testMicrophone}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-300 disabled:to-green-400 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/25 disabled:shadow-none"
            >
              <MicIcon className="w-5 h-5" />
              <span className="font-medium">Test Microphone</span>
            </button>

            {/* Screen Share Test */}
            <button
              onClick={testScreenShare}
              disabled={loading}
              className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-300 disabled:to-orange-400 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-orange-500/25 disabled:shadow-none"
            >
              <MonitorIcon className="w-5 h-5" />
              <span className="font-medium">Test Screen Share</span>
            </button>
          </div>

          {/* Stop All Button */}
          <button
            onClick={stopAllTests}
            className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-500/25"
          >
            <Square className="w-5 h-5" />
            <span className="font-medium">Stop All Tests</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Instructions</span>
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Click test buttons to start media tests</li>
            <li>• Popup windows will show live preview</li>
            <li>• Click on popup windows to close them</li>
            <li>• Allow permissions when prompted by browser</li>
            <li>• Check browser console for detailed logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MediaTestTool;
