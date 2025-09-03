'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Users, MessageSquare } from 'lucide-react';
import { translateText } from '@/lib/translation';
import { saveConversationSession } from '@/lib/cosmic';
import { SpeechRecognition, SpeechSynthesis, getSpeechSupport } from '@/lib/speech';
import { getLanguageFlag, generateSessionId, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import LanguageSelector from './LanguageSelector';
import type { Language } from '@/types';

interface ConversationModeProps {
  languages: Language[];
}

interface ConversationMessage {
  id: string;
  text: string;
  translation: string;
  sender: 'user_1' | 'user_2';
  timestamp: string;
  originalLanguage: string;
  translatedLanguage: string;
}

export default function ConversationMode({ languages }: ConversationModeProps) {
  const [user1Language, setUser1Language] = useState('English');
  const [user2Language, setUser2Language] = useState('Spanish');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<'user_1' | 'user_2' | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [sessionId] = useState(generateSessionId());
  const [sessionStartTime] = useState(new Date());

  const speechRecognition = useRef<SpeechRecognition | null>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const speechSupport = getSpeechSupport();

  useEffect(() => {
    if (speechSupport.recognition) {
      speechRecognition.current = new SpeechRecognition();
    }
    if (speechSupport.synthesis) {
      speechSynthesis.current = new SpeechSynthesis();
    }
  }, [speechSupport]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startListening = (speaker: 'user_1' | 'user_2') => {
    if (!speechRecognition.current || !speechSupport.recognition) {
      toast.error('Speech recognition not supported');
      return;
    }

    const language = speaker === 'user_1' ? user1Language : user2Language;
    
    setCurrentSpeaker(speaker);
    setIsListening(true);

    speechRecognition.current.startListening(
      language,
      (transcript, isFinal) => {
        if (isFinal) {
          setIsListening(false);
          setCurrentSpeaker(null);
          handleMessage(transcript, speaker, language);
        }
      },
      (error) => {
        setIsListening(false);
        setCurrentSpeaker(null);
        toast.error(`Speech recognition error: ${error}`);
      }
    );
  };

  const stopListening = () => {
    if (speechRecognition.current) {
      speechRecognition.current.stopListening();
      setIsListening(false);
      setCurrentSpeaker(null);
    }
  };

  const handleMessage = async (text: string, sender: 'user_1' | 'user_2', originalLanguage: string) => {
    const targetLanguage = sender === 'user_1' ? user2Language : user1Language;
    
    try {
      const result = await translateText(text, originalLanguage, targetLanguage);
      
      const message: ConversationMessage = {
        id: generateSessionId(),
        text,
        translation: result.translatedText,
        sender,
        timestamp: new Date().toISOString(),
        originalLanguage,
        translatedLanguage: targetLanguage
      };

      setMessages(prev => [...prev, message]);

      // Auto-speak the translation
      if (speechSynthesis.current && speechSupport.synthesis) {
        setTimeout(() => {
          speechSynthesis.current?.speak(result.translatedText, targetLanguage);
        }, 500);
      }

    } catch (error) {
      toast.error('Failed to translate message');
    }
  };

  const speakMessage = (text: string, language: string) => {
    if (!speechSynthesis.current || !speechSupport.synthesis) {
      toast.error('Speech synthesis not supported');
      return;
    }

    speechSynthesis.current.speak(text, language);
  };

  const saveSession = async () => {
    if (messages.length === 0) {
      toast.error('No messages to save');
      return;
    }

    try {
      const sessionDuration = Math.round((Date.now() - sessionStartTime.getTime()) / 1000 / 60); // minutes
      
      await saveConversationSession({
        participants: {
          user_1_language: user1Language,
          user_2_language: user2Language
        },
        messages: messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          translation: msg.translation,
          sender: msg.sender,
          timestamp: msg.timestamp
        })),
        status: 'completed',
        duration: sessionDuration
      });

      toast.success('Conversation saved successfully');
    } catch (error) {
      toast.error('Failed to save conversation');
    }
  };

  const clearMessages = () => {
    if (messages.length === 0) return;
    
    if (confirm('Are you sure you want to clear all messages?')) {
      setMessages([]);
      toast.success('Messages cleared');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Conversation Mode</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={saveSession}
            disabled={messages.length === 0}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Session
          </button>
          <button
            onClick={clearMessages}
            disabled={messages.length === 0}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Language setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="font-medium">Speaker 1</span>
          </div>
          <LanguageSelector
            languages={languages}
            value={user1Language}
            onChange={setUser1Language}
            label=""
          />
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="font-medium">Speaker 2</span>
          </div>
          <LanguageSelector
            languages={languages}
            value={user2Language}
            onChange={setUser2Language}
            label=""
          />
        </div>
      </div>

      {/* Voice controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => isListening ? stopListening() : startListening('user_1')}
          disabled={currentSpeaker === 'user_2' || !speechSupport.recognition}
          className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 transition-all ${
            currentSpeaker === 'user_1'
              ? 'border-blue-500 bg-blue-500/10 text-blue-600'
              : 'border-border bg-card text-foreground hover:border-blue-500/50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {currentSpeaker === 'user_1' ? (
            <>
              <MicOff className="w-6 h-6" />
              <span>Stop Speaking ({user1Language})</span>
            </>
          ) : (
            <>
              <Mic className="w-6 h-6" />
              <span>Speak in {user1Language}</span>
            </>
          )}
          <span>{getLanguageFlag(user1Language)}</span>
        </button>

        <button
          onClick={() => isListening ? stopListening() : startListening('user_2')}
          disabled={currentSpeaker === 'user_1' || !speechSupport.recognition}
          className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 transition-all ${
            currentSpeaker === 'user_2'
              ? 'border-green-500 bg-green-500/10 text-green-600'
              : 'border-border bg-card text-foreground hover:border-green-500/50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {currentSpeaker === 'user_2' ? (
            <>
              <MicOff className="w-6 h-6" />
              <span>Stop Speaking ({user2Language})</span>
            </>
          ) : (
            <>
              <Mic className="w-6 h-6" />
              <span>Speak in {user2Language}</span>
            </>
          )}
          <span>{getLanguageFlag(user2Language)}</span>
        </button>
      </div>

      {/* Messages */}
      <div className="bg-card border border-border rounded-lg p-4 min-h-[400px] max-h-[600px] overflow-y-auto custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Start a conversation by speaking in either language</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user_1' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-md p-3 rounded-lg ${
                  message.sender === 'user_1'
                    ? 'bg-blue-500/10 border border-blue-500/20'
                    : 'bg-green-500/10 border border-green-500/20'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${
                      message.sender === 'user_1' ? 'bg-blue-500' : 'bg-green-500'
                    }`}></span>
                    <span className="text-xs text-muted-foreground">
                      {getLanguageFlag(message.originalLanguage)} {message.originalLanguage}
                    </span>
                    <button
                      onClick={() => speakMessage(message.text, message.originalLanguage)}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                      title="Speak original"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-foreground mb-2">{message.text}</p>
                  
                  <div className="border-t border-border/50 pt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {getLanguageFlag(message.translatedLanguage)} {message.translatedLanguage}
                      </span>
                      <button
                        onClick={() => speakMessage(message.translation, message.translatedLanguage)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        title="Speak translation"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-foreground">{message.translation}</p>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    {formatDate(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}