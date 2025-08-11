'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Mic, Square, Bot, Play, Loader2 } from 'lucide-react';
import { adaptiveResponse } from '@/ai/flows/adaptive-response';
import { speechToText } from '@/ai/flows/speech-to-text';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { addMessage, getMessages } from '@/services/firestore';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRecorder } from '@/hooks/use-recorder';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { T } from './T';
import { useLanguage } from '@/hooks/use-language';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  audioUri?: string;
  isGeneratingAudio?: boolean;
};

const WelcomeMessage: Message = {
  id: '0',
  role: 'assistant',
  text: "Hello! I'm MindfulMe, your personal wellness companion. How are you feeling today?",
  isGeneratingAudio: false,
};

const AVATAR_URL = "https://i.postimg.cc/43WKm1Py/avatar.jpg";

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([WelcomeMessage]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const { language } = useLanguage();
  const { user, loading: isUserLoading } = useUser();
  const router = useRouter();

  const { recorderState, startRecording, stopRecording, resetRecorder } = useRecorder();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    async function loadHistory() {
      if (user) {
        setIsHistoryLoading(true);
        const history = await getMessages(user.uid);
        if (history.length > 0) {
          setMessages(history.map((m, i) => ({ id: `hist-${i}`, ...m })));
        } else {
          setMessages([WelcomeMessage]);
        }
        setIsHistoryLoading(false);
      }
    }
    loadHistory();
  }, [user]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  const generateAndSetAudio = async (messageId: string, text: string) => {
    try {
      const ttsResponse = await textToSpeech(text);
      if (ttsResponse && ttsResponse.media) {
        setMessages(prev => prev.map(m => m.id === messageId ? {...m, audioUri: ttsResponse.media, isGeneratingAudio: false} : m));
      }
    } catch (e) {
      console.error("Error generating audio:", e);
      toast({
        title: 'Audio Generation Failed',
        description: 'Could not generate audio. You may have exceeded the daily usage limit.',
        variant: 'destructive',
      });
      setMessages(prev => prev.map(m => m.id === messageId ? {...m, isGeneratingAudio: false} : m));
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || !user) return;

    const userMessageText = input;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: userMessageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      await addMessage(user.uid, { role: 'user', text: userMessageText });
      const response = await adaptiveResponse({ message: userMessageText, language });
      
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        text: response.adaptedResponse,
        isGeneratingAudio: true,
      };
      setMessages(prev => [...prev, assistantMessage]);

      await addMessage(user.uid, { role: 'assistant', text: response.adaptedResponse });
      await generateAndSetAudio(assistantMessageId, response.adaptedResponse);

    } catch (error) {
      console.error(error);
      toast({
        title: 'An error occurred',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = async () => {
    if (recorderState === 'recording') {
      try {
        setIsProcessing(true);
        const audioDataUri = await stopRecording();
        const { text } = await speechToText({ audioDataUri });
        setInput(text);
      } catch (error) {
        console.error(error);
        toast({
          title: 'An error occurred',
          description: 'Failed to transcribe audio. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsProcessing(false);
        resetRecorder();
      }
    } else {
      startRecording();
    }
  };
  
  const handlePlayAudio = (audioUri: string) => {
    if (audioRef.current) {
        audioRef.current.pause();
    }
    const audio = new Audio(audioUri);
    audioRef.current = audio;
    audio.play().catch(e => console.error("Error playing audio:", e));
  }
  
  if (isUserLoading || !user) {
    return (
        <div className="flex h-[calc(100vh-theme(spacing.14))] md:h-screen flex-col items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground"><T>Loading your session...</T></p>
        </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] md:h-screen flex-col bg-background">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="mb-8 flex flex-col items-center justify-center gap-4">
             <Avatar className="h-32 w-32">
              <AvatarImage src={AVATAR_URL} alt="MindfulMe Avatar" />
              <AvatarFallback>
                <Bot />
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-semibold font-headline text-center"><T>MindfulMe</T></h2>
          </div>

          <div className="space-y-6">
            {isHistoryLoading ? (
                 <div className='flex items-end gap-3 justify-start'>
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-12 w-48 rounded-2xl" />
               </div>
            ) : messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-end gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                 {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={AVATAR_URL} />
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-md rounded-2xl px-4 py-3 text-base',
                    message.role === 'user'
                      ? 'rounded-br-none bg-primary text-primary-foreground'
                      : 'rounded-bl-none bg-card'
                  )}
                >
                  <p>{message.text}</p>
                </div>
                {message.role === 'assistant' && (message.audioUri || message.isGeneratingAudio) && (
                   <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="rounded-full text-primary hover:bg-primary/10"
                      onClick={() => message.audioUri && handlePlayAudio(message.audioUri)}
                      disabled={message.isGeneratingAudio || !message.audioUri}
                      aria-label="Play audio"
                    >
                      {message.isGeneratingAudio ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                   </Button>
                )}
              </div>
            ))}
            {isProcessing && !messages.some(m => m.id > Date.now().toString()) && (
               <div className='flex items-end gap-3 justify-start'>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={AVATAR_URL} />
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                  <Skeleton className="h-12 w-48 rounded-2xl" />
               </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 bg-background/80 py-4 backdrop-blur-sm">
        <div className="container mx-auto max-w-2xl px-4">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 rounded-full border bg-card p-2 shadow-sm"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message or use the mic..."
              className="flex-1 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isProcessing || recorderState === 'recording'}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full text-primary hover:bg-primary/10"
              onClick={handleVoiceInput}
              disabled={isProcessing}
              aria-label={recorderState === 'recording' ? 'Stop recording' : 'Start recording'}
            >
              {recorderState === 'recording' ? (
                <Square className="h-5 w-5 animate-pulse text-red-500" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            <Button
              type="submit"
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/90"
              disabled={isProcessing || !input.trim()}
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
