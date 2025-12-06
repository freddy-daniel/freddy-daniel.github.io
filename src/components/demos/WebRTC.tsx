import { useRef, useState, useEffect } from 'react';
import { FaMicrophone, FaVideo, FaPhoneSlash, FaMicrophoneSlash, FaVideoSlash } from 'react-icons/fa';

export const WebRTC = () => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(mediaStream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = mediaStream;
            }
            setError('');
        } catch (err) {
            console.error("Error accessing media devices:", err);
            setError('Could not access camera/microphone. Please ensure permissions are granted.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsVideoOff(!isVideoOff);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm border border-red-200 dark:border-red-800">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[500px]">
                {/* Local Video */}
                <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800 group">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm">
                        You (Local)
                    </div>
                </div>

                {/* Remote Video (Mock) */}
                <div className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4 animate-pulse flex items-center justify-center">
                            <FaVideo className="text-gray-500 text-3xl" />
                        </div>
                        <p className="text-gray-400">Waiting for peer connection...</p>
                        <p className="text-xs text-gray-500 mt-2">(Signaling server required for P2P)</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
                <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition-all duration-200 ${isMuted
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    {isMuted ? <FaMicrophoneSlash className="text-xl" /> : <FaMicrophone className="text-xl" />}
                </button>

                <button
                    onClick={stopCamera}
                    className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
                >
                    <FaPhoneSlash className="text-xl" />
                </button>

                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-all duration-200 ${isVideoOff
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    {isVideoOff ? <FaVideoSlash className="text-xl" /> : <FaVideo className="text-xl" />}
                </button>
            </div>
        </div>
    );
};
