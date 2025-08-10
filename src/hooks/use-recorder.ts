'use client';

import { useState, useRef } from 'react';
import { useToast } from './use-toast';

export type RecorderState = 'idle' | 'recording' | 'stopped';

export function useRecorder() {
  const [recorderState, setRecorderState] = useState<RecorderState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    setRecorderState('recording');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.error('Error accessing microphone:', JSON.stringify(err, null, 2));
      toast({
        title: 'Microphone Error',
        description: 'Could not access the microphone. Please check your browser permissions.',
        variant: 'destructive',
      });
      setRecorderState('idle');
    }
  };

  const stopRecording = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64data = reader.result as string;
            resolve(base64data);
            audioChunksRef.current = [];
            setRecorderState('stopped');
          };
           reader.onerror = (error) => {
            reject(error);
          };
        };
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current.stop();
      } else {
        reject('Not recording');
      }
    });
  };

  const resetRecorder = () => {
    setRecorderState('idle');
  };

  return { recorderState, startRecording, stopRecording, resetRecorder };
}
