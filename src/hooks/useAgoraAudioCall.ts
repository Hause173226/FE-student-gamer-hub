// src/hooks/useAgoraAudioCall.ts
import { useEffect, useRef, useState } from "react";
import AgoraRTC, {IAgoraRTCClient, IAgoraRTCRemoteUser, ILocalAudioTrack} from "agora-rtc-sdk-ng";



interface UseAgoraAudioOptions {
    appId: string;
    channel: string;
    token?: string | null;
    uid?: string | number | null;
}



export function useAgoraAudioCall({ appId, channel, token = null, uid }: UseAgoraAudioOptions) {
    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const [joined, setJoined] = useState(false);
    const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [localTrack, setLocalTrack] = useState<ILocalAudioTrack | null>(null);

    useEffect(() => {
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        client.on("user-published", async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            if (mediaType === "audio" && user.audioTrack) {
                user.audioTrack.play();
            }
            setRemoteUsers([...client.remoteUsers]);
        });

        client.on("user-unpublished", () => {
            setRemoteUsers([...client.remoteUsers]);
        });

        return () => {
            client.removeAllListeners();
        };
    }, []);

    const join = async () => {
        if (!clientRef.current) return;
        const client = clientRef.current;
        await client.join(appId, channel, token || null, uid || null);
        const mic = await AgoraRTC.createMicrophoneAudioTrack();
        setLocalTrack(mic);
        await client.publish([mic]);
        setJoined(true);
    };

    const leave = async () => {
        if (!clientRef.current) return;
        const client = clientRef.current;

        localTrack?.stop();
        localTrack?.close();
        await client.unpublish();
        await client.leave();

        setLocalTrack(null);
        setJoined(false);
        setRemoteUsers([]);
    };

    return { joined, join, leave, remoteUsers };
}
