// src/components/AudioCallModal.tsx
import React, { useEffect } from "react";
import { PhoneOff } from "lucide-react";
import { useAgoraAudioCall } from "../hooks/useAgoraAudioCall.ts";

interface AudioCallModalProps {
    open: boolean;
    onClose: () => void;
    friendName: string;
    channelId: string;
}

export const AudioCallModal: React.FC<AudioCallModalProps> = ({
                                                                  open,
                                                                  onClose,
                                                                  friendName,
                                                                  channelId,
                                                              }) => {
    const { joined, join, leave } = useAgoraAudioCall({
        appId: import.meta.env.VITE_AGORA_APP_ID as string,
        channel: channelId,
    });

    useEffect(() => {
        if (open) join();
        return () => {
            leave();
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-80 text-center border border-slate-700">
                <h2 className="text-white text-xl font-semibold mb-2">
                    Cuộc gọi với {friendName}
                </h2>
                <p className="text-slate-400 mb-6">
                    {joined ? "Đang kết nối âm thanh..." : "Đang kết nối..."}
                </p>
                <button
                    onClick={onClose}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full flex items-center justify-center gap-2 mx-auto"
                >
                    <PhoneOff size={20} />
                    Kết thúc cuộc gọi
                </button>
            </div>
        </div>
    );
};
