'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send, Mic, Square, Bot } from 'lucide-react';
import { adaptiveResponse } from '@/ai/flows/adaptive-response';
import { speechToText } from '@/ai/flows/speech-to-text';
import { textToSpeech } from '@/ai/flows/text-to-speech';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRecorder } from '@/hooks/use-recorder';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { T } from './T';

type Message = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
};

const WelcomeMessage: Message = {
  id: 0,
  role: 'assistant',
  text: "Hello! I'm MindfulMe, your personal wellness companion. How are you feeling today?",
};

const AVATAR_URL = "https://i.postimg.cc/43WKm1Py/avatar.jpg";

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([WelcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { recorderState, startRecording, stopRecording, resetRecorder } = useRecorder();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await adaptiveResponse({ message: input });
      const assistantMessage: Message = { id: Date.now() + 1, role: 'assistant', text: response.adaptedResponse };
      setMessages(prev => [...prev, assistantMessage]);
      
      if (response.adaptedResponse) {
        const ttsResponse = await textToSpeech(response.adaptedResponse);
        if (ttsResponse && ttsResponse.media) {
          const audio = new Audio(ttsResponse.media);
          audio.play().catch(e => console.error("Error playing audio:", e));
        }
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'An error occurred',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (recorderState === 'recording') {
      try {
        setIsLoading(true);
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
        setIsLoading(false);
        resetRecorder();
      }
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] md:h-screen flex-col bg-background">
       <audio className="hidden" />
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
            {messages.map((message) => (
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
              </div>
            ))}
            {isLoading && !messages.some(m => m.id > Date.now()) && (
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
              disabled={isLoading || recorderState === 'recording'}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full text-primary hover:bg-primary/10"
              onClick={handleVoiceInput}
              disabled={isLoading}
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
              disabled={isLoading || !input.trim()}
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
