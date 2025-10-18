import { useState, useRef, useEffect } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Monitor, 
  Phone, PhoneOff, Volume2, VolumeX
} from 'lucide-react';
import toast from 'react-hot-toast';

interface VideoCallProps {
  roomId: string;
  userId: string;
  onEndCall: () => void;
}

export function VideoCall({ roomId, userId, onEndCall }: VideoCallProps) {
  // States
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    // Stop all streams
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    if (screenRef.current?.srcObject) {
      const stream = screenRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      screenRef.current.srcObject = null;
    }
    
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Cleanup popup camera
    if ((window as any).cameraPopup) {
      const { video, stream } = (window as any).cameraPopup;
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      if (document.body.contains(video)) {
        document.body.removeChild(video);
      }
      delete (window as any).cameraPopup;
    }
  };

  const toggleCamera = async () => {
    if (loading) return;
    
    try {
      if (!cameraOn) {
        setLoading(true);
        console.log('🎥 Starting camera...');
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        });
        
        console.log('🎥 Camera stream received:', stream);
        console.log('🎥 Video tracks:', stream.getVideoTracks());
        console.log('🎥 Stream active:', stream.active);
        console.log('🎥 Track enabled:', stream.getVideoTracks()[0]?.enabled);
        console.log('🎥 Track readyState:', stream.getVideoTracks()[0]?.readyState);
        
        // Create popup video element
        const popupVideo = document.createElement('video');
        popupVideo.srcObject = stream;
        popupVideo.autoplay = true;
        popupVideo.muted = true;
        popupVideo.style.width = '300px';
        popupVideo.style.height = '200px';
        popupVideo.style.border = '2px solid green';
        popupVideo.style.position = 'fixed';
        popupVideo.style.top = '80px';
        popupVideo.style.left = '20px';
        popupVideo.style.zIndex = '9999';
        popupVideo.style.backgroundColor = 'black';
        popupVideo.style.borderRadius = '8px';
        
        // Add label
        const label = document.createElement('div');
        label.textContent = 'Test Camera';
        label.style.position = 'absolute';
        label.style.top = '5px';
        label.style.left = '5px';
        label.style.background = 'rgba(0, 0, 0, 0.7)';
        label.style.color = 'white';
        label.style.padding = '2px 6px';
        label.style.borderRadius = '4px';
        label.style.fontSize = '12px';
        label.style.fontWeight = 'bold';
        
        popupVideo.appendChild(label);
        document.body.appendChild(popupVideo);
        
        // Store reference for cleanup
        (window as any).cameraPopup = { video: popupVideo, stream: stream };
        
        popupVideo.onloadedmetadata = () => {
          console.log('🎥 Popup video loaded, dimensions:', popupVideo.videoWidth, 'x', popupVideo.videoHeight);
        };
        
        popupVideo.onplay = () => {
          console.log('🎥 Popup video playing');
        };
        
        popupVideo.onerror = (e) => {
          console.error('🎥 Popup video error:', e);
        };
        
        setCameraOn(true);
        toast.success('Camera bật thành công');
      } else {
        console.log('🎥 Stopping camera...');
        
        // Cleanup popup
        if ((window as any).cameraPopup) {
          const { video, stream } = (window as any).cameraPopup;
          stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
          document.body.removeChild(video);
          delete (window as any).cameraPopup;
        }
        
        setCameraOn(false);
        toast.success('Camera tắt');
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      toast.error('Không thể bật camera: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = async () => {
    if (loading) return;
    
    try {
      if (!micOn) {
        setLoading(true);
        console.log('🎤 Starting microphone...');
        
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
        
        micStreamRef.current = stream;
        startAudioDetection(stream);
        setMicOn(true);
        toast.success('Microphone bật');
      } else {
        console.log('🎤 Stopping microphone...');
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach(track => track.stop());
          micStreamRef.current = null;
        }
        setMicOn(false);
        setSpeaking(false);
        toast.success('Microphone tắt');
      }
    } catch (error) {
      console.error('❌ Microphone error:', error);
      toast.error('Không thể bật microphone');
    } finally {
      setLoading(false);
    }
  };

  const startAudioDetection = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const detectAudio = () => {
        if (!micOn) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        setSpeaking(average > 30);
        
        if (micOn) {
          requestAnimationFrame(detectAudio);
        }
      };
      
      detectAudio();
    } catch (error) {
      console.error('❌ Audio detection error:', error);
    }
  };

  const toggleScreenShare = async () => {
    if (loading) return;
    
    try {
      if (!screenShare) {
        setLoading(true);
        console.log('📺 Starting screen share...');
        
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: true
        });
        
         console.log('📺 Screen stream received:', stream);
         console.log('📺 Screen tracks:', stream.getTracks());
         console.log('📺 Stream active:', stream.active);
         console.log('📺 Track enabled:', stream.getTracks()[0]?.enabled);
         console.log('📺 Track readyState:', stream.getTracks()[0]?.readyState);
         
         if (screenRef.current) {
           console.log('📺 Setting screen srcObject...');
           screenRef.current.srcObject = stream;
           
           // Add event listeners for debugging
           screenRef.current.onloadstart = () => {
             console.log('📺 Screen load started');
           };
           
           screenRef.current.onloadeddata = () => {
             console.log('📺 Screen data loaded');
           };
           
           screenRef.current.onloadedmetadata = () => {
             console.log('📺 Screen metadata loaded');
             console.log('📺 Screen dimensions:', screenRef.current?.videoWidth, 'x', screenRef.current?.videoHeight);
             console.log('📺 Screen readyState:', screenRef.current?.readyState);
           };
           
           screenRef.current.oncanplay = () => {
             console.log('📺 Screen can play');
           };
           
           screenRef.current.onplay = () => {
             console.log('📺 Screen started playing');
           };
           
           screenRef.current.onerror = (e) => {
             console.error('📺 Screen error:', e);
           };
           
           // Force play with multiple attempts
           const playScreen = async () => {
             try {
               console.log('📺 Attempting to play screen...');
               await screenRef.current?.play();
               console.log('📺 Screen play successful');
             } catch (playError) {
               console.error('📺 Screen play failed:', playError);
               // Retry after a short delay
               setTimeout(() => {
                 screenRef.current?.play().catch(console.error);
               }, 500);
             }
           };
           
           // Try to play immediately and after delays
           playScreen();
           setTimeout(playScreen, 100);
           setTimeout(playScreen, 500);
           setTimeout(playScreen, 1000);
        } else {
          console.error('📺 Screen ref is null!');
        }
        
        setScreenShare(true);
        toast.success('Bắt đầu chia sẻ màn hình thành công');
      } else {
        console.log('📺 Stopping screen share...');
        if (screenRef.current?.srcObject) {
          const stream = screenRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          screenRef.current.srcObject = null;
        }
        setScreenShare(false);
        toast.success('Dừng chia sẻ màn hình');
      }
    } catch (error) {
      console.error('❌ Screen share error:', error);
      toast.error('Không thể chia sẻ màn hình: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
    toast.success(muted ? 'Bỏ tắt tiếng' : 'Tắt tiếng');
  };

  const endCall = () => {
    cleanup();
    onEndCall();
    toast.success('Đã kết thúc cuộc gọi');
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Video Call</h2>
              <p className="text-gray-400 text-sm">Room: {roomId} • User: {userId}</p>
            </div>
          </div>
          <button
            onClick={endCall}
            className="p-2 hover:bg-red-600 rounded-lg transition-colors"
          >
            <PhoneOff className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {/* Debug Buttons */}
        <div className="mb-4 flex justify-center gap-2">
          <button
            onClick={async () => {
              try {
                console.log('🧪 Testing screen share with popup...');
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                console.log('✅ Screen stream:', stream);
                
                // Create popup video element
                const popupVideo = document.createElement('video');
                popupVideo.srcObject = stream;
                popupVideo.autoplay = true;
                popupVideo.muted = true;
                popupVideo.style.width = '400px';
                popupVideo.style.height = '300px';
                popupVideo.style.border = '2px solid blue';
                popupVideo.style.position = 'fixed';
                popupVideo.style.top = '100px';
                popupVideo.style.right = '20px';
                popupVideo.style.zIndex = '9999';
                popupVideo.style.backgroundColor = 'black';
                popupVideo.style.borderRadius = '8px';
                
                // Add label
                const label = document.createElement('div');
                label.textContent = 'Test Screen Share';
                label.style.position = 'absolute';
                label.style.top = '5px';
                label.style.left = '5px';
                label.style.background = 'rgba(0, 0, 0, 0.7)';
                label.style.color = 'white';
                label.style.padding = '2px 6px';
                label.style.borderRadius = '4px';
                label.style.fontSize = '12px';
                label.style.fontWeight = 'bold';
                
                popupVideo.appendChild(label);
                document.body.appendChild(popupVideo);
                
                popupVideo.onloadedmetadata = () => {
                  console.log('📺 Popup screen loaded, dimensions:', popupVideo.videoWidth, 'x', popupVideo.videoHeight);
                };
                
                popupVideo.onplay = () => {
                  console.log('📺 Popup screen playing');
                };
                
                popupVideo.onerror = (e) => {
                  console.error('📺 Popup screen error:', e);
                };
                
                // Remove after 10 seconds
                setTimeout(() => {
                  stream.getTracks().forEach(track => track.stop());
                  document.body.removeChild(popupVideo);
                  console.log('🛑 Popup screen removed');
                }, 10000);
                
                toast.success('Screen test popup! Check top-right corner');
              } catch (error) {
                console.error('❌ Screen test failed:', error);
                toast.error('Screen test failed: ' + error);
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            🧪 Test Screen Popup
          </button>
          
          <button
            onClick={async () => {
              try {
                console.log('🧪 Testing full screen popup...');
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                console.log('✅ Screen stream:', stream);
                
                // Create full screen popup
                const popupVideo = document.createElement('video');
                popupVideo.srcObject = stream;
                popupVideo.autoplay = true;
                popupVideo.muted = true;
                popupVideo.style.width = '80vw';
                popupVideo.style.height = '80vh';
                popupVideo.style.border = '2px solid red';
                popupVideo.style.position = 'fixed';
                popupVideo.style.top = '50%';
                popupVideo.style.left = '50%';
                popupVideo.style.transform = 'translate(-50%, -50%)';
                popupVideo.style.zIndex = '9999';
                popupVideo.style.backgroundColor = 'black';
                popupVideo.style.borderRadius = '8px';
                
                // Add label
                const label = document.createElement('div');
                label.textContent = 'Full Screen Test - Click to close';
                label.style.position = 'absolute';
                label.style.top = '10px';
                label.style.left = '10px';
                label.style.background = 'rgba(0, 0, 0, 0.8)';
                label.style.color = 'white';
                label.style.padding = '8px 12px';
                label.style.borderRadius = '4px';
                label.style.fontSize = '14px';
                label.style.fontWeight = 'bold';
                label.style.cursor = 'pointer';
                
                popupVideo.appendChild(label);
                document.body.appendChild(popupVideo);
                
                popupVideo.onloadedmetadata = () => {
                  console.log('📺 Full screen popup loaded, dimensions:', popupVideo.videoWidth, 'x', popupVideo.videoHeight);
                };
                
                popupVideo.onplay = () => {
                  console.log('📺 Full screen popup playing');
                };
                
                popupVideo.onerror = (e) => {
                  console.error('📺 Full screen popup error:', e);
                };
                
                // Click to close
                const closePopup = () => {
                  stream.getTracks().forEach(track => track.stop());
                  document.body.removeChild(popupVideo);
                  console.log('🛑 Full screen popup removed');
                };
                
                label.onclick = closePopup;
                popupVideo.onclick = closePopup;
                
                toast.success('Full screen test popup! Click to close');
              } catch (error) {
                console.error('❌ Full screen test failed:', error);
                toast.error('Full screen test failed: ' + error);
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
          >
            🧪 Test Full Screen
          </button>
        </div>

         {screenShare ? (
           /* Screen Share View - Full Screen */
           <div className="h-full w-full">
             <div className="relative bg-black rounded-lg overflow-hidden h-full w-full">
               <video
                 ref={screenRef}
                 autoPlay
                 playsInline
                 muted
                 className="w-full h-full object-cover"
                 style={{ 
                   backgroundColor: 'black',
                   width: '100%',
                   height: '100%'
                 }}
                 onLoadStart={() => console.log('📺 Screen load started')}
                 onLoadedData={() => console.log('📺 Screen data loaded')}
                 onLoadedMetadata={() => console.log('📺 Screen metadata loaded')}
                 onCanPlay={() => console.log('📺 Screen can play')}
                 onPlay={() => console.log('📺 Screen playing')}
                 onError={(e) => console.error('📺 Screen error:', e)}
               />
               
               {/* Fallback if video doesn't load */}
               {!screenRef.current?.srcObject && (
                 <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                   <div className="text-center text-white">
                     <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Monitor className="w-8 h-8" />
                     </div>
                     <p className="text-lg font-medium">Đang tải màn hình...</p>
                     <p className="text-sm text-gray-400 mt-2">Vui lòng chờ một chút</p>
                     <button
                       onClick={() => {
                         console.log('🔄 Refreshing screen share...');
                         toggleScreenShare();
                       }}
                       className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                     >
                       🔄 Refresh
                     </button>
                   </div>
                 </div>
               )}
               
               <div className="absolute top-2 left-2 bg-blue-600/90 rounded px-3 py-1">
                 <span className="text-white text-sm font-medium">Màn hình được chia sẻ</span>
               </div>
               <div className="absolute top-2 right-2 flex gap-2">
                 <button
                   onClick={() => {
                     if (screenRef.current) {
                       if (screenRef.current.requestFullscreen) {
                         screenRef.current.requestFullscreen();
                       } else if ((screenRef.current as any).webkitRequestFullscreen) {
                         (screenRef.current as any).webkitRequestFullscreen();
                       } else if ((screenRef.current as any).mozRequestFullScreen) {
                         (screenRef.current as any).mozRequestFullScreen();
                       } else if ((screenRef.current as any).msRequestFullscreen) {
                         (screenRef.current as any).msRequestFullscreen();
                       }
                     }
                   }}
                   className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                 >
                   📺 Full Screen
                 </button>
                 <button
                   onClick={toggleScreenShare}
                   className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                 >
                   Dừng Share
                 </button>
               </div>
             </div>
           </div>
         ) : (
          /* Voice Only View - Always show this, camera is popup */
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Voice Channel</h3>
              <p className="text-gray-400 mb-4">Bạn đang trong voice channel</p>
              {cameraOn && (
                <p className="text-green-400 text-sm">Camera đang bật (popup)</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Camera */}
          <button
            onClick={toggleCamera}
            disabled={loading}
            className={`p-3 rounded-full transition-colors ${
              cameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : cameraOn ? (
              <Video className="w-5 h-5 text-white" />
            ) : (
              <VideoOff className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Microphone */}
          <button
            onClick={toggleMic}
            disabled={loading}
            className={`p-3 rounded-full transition-colors relative ${
              micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : micOn ? (
              <Mic className="w-5 h-5 text-white" />
            ) : (
              <MicOff className="w-5 h-5 text-white" />
            )}
            
            {/* Audio visualization */}
            {micOn && speaking && !loading && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute inset-0 rounded-full border-2 border-green-200 animate-ping" style={{ animationDelay: '0.4s' }}></div>
              </>
            )}
          </button>

          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            disabled={loading}
            className={`p-3 rounded-full transition-colors ${
              screenShare ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Monitor className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Mute */}
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${
              muted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {muted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
          >
            <PhoneOff className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
