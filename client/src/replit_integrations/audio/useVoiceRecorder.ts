/**
 * React hook for voice recording using MediaRecorder API.
 * Records audio in WebM/Opus format for efficient streaming.
 */
import { useRef, useCallback, useState } from "react";

export type RecordingState = "idle" | "recording" | "stopped";

export function useVoiceRecorder() {
  const [state, setState] = useState<RecordingState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const supportedMimeTypeRef = useRef<string>("");

  const startRecording = useCallback(async (): Promise<void> => {
    if (!window.isSecureContext) {
      throw new Error("Microphone access requires a secure connection (HTTPS). Please ensure you're on a secure URL.");
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Microphone API not supported in this browser.");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Fallback mime types for different browsers (Chrome vs Safari vs Firefox)
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
        "audio/aac",
        "audio/wav",
        "" // Final fallback to default
      ];

      let supportedMimeType = "";
      for (const type of mimeTypes) {
        if (!type || MediaRecorder.isTypeSupported(type)) {
          supportedMimeType = type;
          break;
        }
      }

      supportedMimeTypeRef.current = supportedMimeType;

      const recorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType || undefined,
      });

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(100); // Collect chunks every 100ms
      setState("recording");
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.name === 'SecurityError') {
        throw new Error("Microphone access was denied. Please check your browser's site settings (look for the 🔒 icon) and allow microphone access.");
      }
      throw err;
    }
  }, []);

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state !== "recording") {
        resolve(new Blob([], { type: supportedMimeTypeRef.current || 'audio/webm' }));
        return;
      }

      recorder.onstop = () => {
        const contentType = supportedMimeTypeRef.current || (recorder.mimeType) || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: contentType });
        recorder.stream.getTracks().forEach((t) => t.stop());
        setState("stopped");
        resolve(blob);
      };

      recorder.stop();
    });
  }, []);

  return { state, startRecording, stopRecording };
}

